package dev.diegovvo.marcoarte;

import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import java.io.File;
import java.io.FileInputStream;
import java.util.Arrays;
import org.json.JSONArray;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Pantalla única: una galería a pantalla completa hecha en HTML (assets/index.html).
 * Aquí solo se prepara la ventana, se mantiene la pantalla encendida y se pasan
 * los botones del control remoto a la página.
 */
public class MainActivity extends Activity {

    private WebView web;
    private Sonos sonos;
    private Buzon buzon;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        web.setBackgroundColor(0xFF1B1D1A);
        web.setWebViewClient(new WebViewClient());
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);

        sonos = new Sonos(this);
        web.addJavascriptInterface(new Puente(), "Android");
        setContentView(web);
        ocultarBarras();
        new File(carpeta(), "fotos").mkdirs();
        if (esCentro()) {
            web.setBackgroundColor(0xFF030304);
            // El buzón recibe los datos del iPhone y de la laptop por el Wi-Fi.
            buzon = new Buzon(carpeta(), new Buzon.Aviso() {
                @Override
                public void llego(final String nombre) {
                    web.post(new Runnable() {
                        @Override
                        public void run() { js("window.alDatos && alDatos('" + nombre + "')"); }
                    });
                }
            });
            buzon.iniciar();
            web.loadUrl("file:///android_asset/centro/index.html");
        } else {
            web.loadUrl("file:///android_asset/index.html");
        }
        Vigia.iniciar(this);
        web.requestFocus();
    }

    /** Esta tele muestra el centro de control (lo decide el instalador con modo.txt). */
    private boolean esCentro() {
        return "centro".equals(leerArchivo(new File(carpeta(), "modo.txt")).trim());
    }

    private static String leerArchivo(File f) {
        if (!f.isFile()) return "";
        try {
            FileInputStream in = new FileInputStream(f);
            byte[] b = new byte[(int) Math.min(f.length(), 8 * 1024 * 1024)];
            int leidos = 0;
            while (leidos < b.length) {
                int r = in.read(b, leidos, b.length - leidos);
                if (r < 0) break;
                leidos += r;
            }
            in.close();
            String t = new String(b, 0, leidos, "UTF-8");
            if (t.length() > 0 && t.charAt(0) == '\uFEFF') t = t.substring(1);
            return t;
        } catch (Exception e) {
            return "";
        }
    }

    /** Carpeta propia de la app en el Fire TV, donde el instalador deja fotos y la llave de Spotify. */
    private File carpeta() {
        File f = getExternalFilesDir(null);
        return f != null ? f : getFilesDir();
    }

    /** Lo que la página puede pedirle a la app. */
    private class Puente {
        @JavascriptInterface
        public String fotos() {
            JSONArray lista = new JSONArray();
            File dir = new File(carpeta(), "fotos");
            File[] archivos = dir.listFiles();
            if (archivos == null) return "[]";
            Arrays.sort(archivos);
            for (File a : archivos) {
                String n = a.getName().toLowerCase();
                if (a.isFile() && (n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png") || n.endsWith(".webp"))) {
                    lista.put(a.getName() + "|" + Uri.fromFile(a).toString());
                }
            }
            return lista.toString();
        }

        /** Manda una orden a la bocina Sonos y avisa a la página con window.alSonos(resultado). */
        @JavascriptInterface
        public void sonos(final String accion, final String cuarto) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    final String r = sonos.ejecutar(accion, cuarto);
                    web.post(new Runnable() {
                        @Override
                        public void run() {
                            web.evaluateJavascript("window.alSonos && alSonos('" + r + "')", null);
                        }
                    });
                }
            }).start();
        }

        /** Busca los cuartos Sonos y los manda a la página con window.alCuartos("A|B|C"). */
        @JavascriptInterface
        public void sonosCuartos() {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    final String r = sonos.cuartos().replace("\\", "").replace("'", "\\'");
                    web.post(new Runnable() {
                        @Override
                        public void run() {
                            web.evaluateJavascript("window.alCuartos && alCuartos('" + r + "')", null);
                        }
                    });
                }
            }).start();
        }

        /** Lee un archivo de datos de la carpeta de la app (solo nombres conocidos). */
        @JavascriptInterface
        public String leer(String nombre) {
            String[] ok = {"iphone", "ipad", "laptop", "tele", "claude", "config"};
            for (String n : ok) if (n.equals(nombre)) return leerArchivo(new File(carpeta(), nombre + ".json"));
            if (nombre.matches("desc-d[0-9]+")) {
                File f = new File(carpeta(), nombre + ".txt");
                String t = leerArchivo(f);
                f.delete();
                return t;
            }
            return "";
        }

        /** La IP de esta tele en el Wi-Fi (para configurar el Atajo del iPhone). */
        @JavascriptInterface
        public String ip() {
            try {
                android.net.wifi.WifiManager w = (android.net.wifi.WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
                int i = w.getConnectionInfo().getIpAddress();
                if (i == 0) return "";
                return (i & 255) + "." + ((i >> 8) & 255) + "." + ((i >> 16) & 255) + "." + ((i >> 24) & 255);
            } catch (Exception e) {
                return "";
            }
        }

        /** Qué suena en el cuarto Sonos; responde con window.alSonosInfo(json). */
        @JavascriptInterface
        public void sonosInfo(final String cuarto) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    final String r = sonos.info(cuarto);
                    web.post(new Runnable() {
                        @Override
                        public void run() { js("window.alSonosInfo && alSonosInfo(" + org.json.JSONObject.quote(r) + ")"); }
                    });
                }
            }).start();
        }

        /** Revisa qué aparatos contestan en el Wi-Fi; responde con window.alPresencia({"ip":true,…}). */
        @JavascriptInterface
        public void presencia(final String ipsJson) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    org.json.JSONObject res = new org.json.JSONObject();
                    try {
                        JSONArray ips = new JSONArray(ipsJson);
                        for (int i = 0; i < ips.length(); i++) {
                            String ip = ips.getString(i);
                            if (!ip.matches("[0-9.]+")) continue;
                            boolean vivo = false;
                            try {
                                Process p = Runtime.getRuntime().exec(new String[]{"ping", "-c", "1", "-W", "1", ip});
                                vivo = p.waitFor() == 0;
                            } catch (Exception e) {
                                vivo = java.net.InetAddress.getByName(ip).isReachable(1200);
                            }
                            res.put(ip, vivo);
                        }
                    } catch (Exception ignorar) { }
                    final String r = res.toString();
                    web.post(new Runnable() {
                        @Override
                        public void run() { js("window.alPresencia && alPresencia(" + r + ")"); }
                    });
                }
            }).start();
        }

        /** Descarga un texto de internet (calendarios) y lo entrega con window.alDescarga(id, texto, error). */
        @JavascriptInterface
        public void descargar(final String id, final String direccion) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    String texto = "", error = "";
                    try {
                        String u = direccion.replaceFirst("(?i)^webcal:", "https:");
                        for (int salto = 0; salto < 5; salto++) {
                            java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(u).openConnection();
                            c.setInstanceFollowRedirects(false);
                            c.setConnectTimeout(15000);
                            c.setReadTimeout(30000);
                            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) MarcoArte/1.0");
                            c.setRequestProperty("Accept", "text/calendar, */*");
                            int code = c.getResponseCode();
                            if (code >= 300 && code < 400 && c.getHeaderField("Location") != null) {
                                u = new java.net.URL(new java.net.URL(u), c.getHeaderField("Location")).toString().replaceFirst("(?i)^webcal:", "https:");
                                c.disconnect();
                                continue;
                            }
                            if (code != 200) { error = "HTTP " + code; c.disconnect(); break; }
                            java.io.InputStream in = c.getInputStream();
                            java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
                            byte[] buf = new byte[8192];
                            int n;
                            while ((n = in.read(buf)) > 0 && b.size() < 8 * 1024 * 1024) b.write(buf, 0, n);
                            in.close();
                            c.disconnect();
                            // Se guarda en un archivo: pasar textos muy grandes directo a la página puede fallar.
                            java.io.File f = new java.io.File(carpeta(), "desc-" + id.replaceAll("[^a-z0-9]", "") + ".txt");
                            java.io.FileOutputStream o = new java.io.FileOutputStream(f);
                            b.writeTo(o);
                            o.close();
                            texto = "ok:" + b.size();
                            break;
                        }
                    } catch (Exception e) {
                        error = e.getClass().getSimpleName();
                    }
                    final String js = "window.alDescarga && alDescarga(" + org.json.JSONObject.quote(id) + "," +
                            org.json.JSONObject.quote(texto) + "," + org.json.JSONObject.quote(error) + ")";
                    web.post(new Runnable() { @Override public void run() { web.evaluateJavascript(js, null); } });
                }
            }).start();
        }

        @JavascriptInterface
        public String spotify() {
            File f = new File(carpeta(), "spotify.json");
            if (!f.isFile()) return "";
            try {
                FileInputStream in = new FileInputStream(f);
                byte[] b = new byte[(int) f.length()];
                int leidos = 0;
                while (leidos < b.length) {
                    int r = in.read(b, leidos, b.length - leidos);
                    if (r < 0) break;
                    leidos += r;
                }
                in.close();
                String t = new String(b, 0, leidos, "UTF-8");
                if (t.length() > 0 && t.charAt(0) == '\uFEFF') t = t.substring(1);
                return t;
            } catch (Exception e) {
                return "";
            }
        }
    }

    private void ocultarBarras() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    private void js(String codigo) {
        web.evaluateJavascript(codigo, null);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int k = e.getKeyCode();
        String accion = null;
        if (k == KeyEvent.KEYCODE_MENU) accion = "window.alMenu && alMenu()";
        else if (k == KeyEvent.KEYCODE_MEDIA_FAST_FORWARD || k == KeyEvent.KEYCODE_MEDIA_NEXT) accion = "window.alSiguiente && alSiguiente()";
        else if (k == KeyEvent.KEYCODE_MEDIA_REWIND || k == KeyEvent.KEYCODE_MEDIA_PREVIOUS) accion = "window.alAnterior && alAnterior()";
        else if (k == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || k == KeyEvent.KEYCODE_MEDIA_PLAY || k == KeyEvent.KEYCODE_MEDIA_PAUSE) accion = "window.alPausa && alPausa()";
        if (accion != null) {
            if (e.getAction() == KeyEvent.ACTION_UP) js(accion);
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    @Override
    public void onBackPressed() {
        // La página decide: si hay un panel abierto lo cierra; si no, salimos.
        web.evaluateJavascript("(window.alAtras ? alAtras() : false)", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String valor) {
                if (!"true".equals(valor)) finish();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        ocultarBarras();
    }

    @Override
    protected void onDestroy() {
        if (buzon != null) buzon.detener();
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }
}
