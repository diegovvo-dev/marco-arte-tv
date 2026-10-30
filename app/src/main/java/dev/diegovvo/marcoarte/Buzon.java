package dev.diegovvo.marcoarte;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Locale;

/**
 * "Buzón" del centro de control: un servidor pequeño en el Wi-Fi de la casa (puerto 8765)
 * donde el iPhone (con un Atajo) y la laptop dejan sus datos como JSON.
 *
 *   POST /iphone   -> iphone.json   (recordatorios, alarmas, batería)
 *   POST /laptop   -> laptop.json   (batería, cargando)
 *   POST /tele     -> tele.json     (lo que muestra la Sharp)
 *   POST /claude   -> claude.json   (resumen de lo que trabajas con Claude)
 *   GET  /         -> "ok" (para probar la conexión desde el navegador)
 *
 * Solo acepta esos nombres y como máximo 256 KB por envío.
 */
class Buzon {
    interface Aviso { void llego(String nombre); }

    static final int PUERTO = 8765;
    private static final String[] PERMITIDOS = {"iphone", "laptop", "tele", "claude"};
    private final File carpeta;
    private final Aviso aviso;
    private ServerSocket servidor;

    Buzon(File carpeta, Aviso aviso) { this.carpeta = carpeta; this.aviso = aviso; }

    void iniciar() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    servidor = new ServerSocket(PUERTO);
                    while (!servidor.isClosed()) {
                        final Socket s = servidor.accept();
                        new Thread(new Runnable() { @Override public void run() { atender(s); } }).start();
                    }
                } catch (Exception ignorar) { }
            }
        }).start();
    }

    void detener() {
        try { if (servidor != null) servidor.close(); } catch (Exception ignorar) { }
    }

    private void atender(Socket s) {
        try {
            s.setSoTimeout(8000);
            InputStream in = s.getInputStream();
            String linea = leerLinea(in);
            if (linea == null) { s.close(); return; }
            String[] partes = linea.split(" ");
            String metodo = partes.length > 0 ? partes[0] : "";
            String ruta = partes.length > 1 ? partes[1] : "/";
            int largo = 0;
            String h;
            while ((h = leerLinea(in)) != null && h.length() > 0) {
                String hl = h.toLowerCase(Locale.ROOT);
                if (hl.startsWith("content-length:")) {
                    try { largo = Integer.parseInt(h.substring(15).trim()); } catch (Exception ignorar) { }
                }
            }
            String nombre = ruta.replaceAll("^/+", "").replaceAll("[?#].*$", "").toLowerCase(Locale.ROOT);

            if (metodo.equals("OPTIONS")) { responder(s, 204, ""); return; }
            if (metodo.equals("GET")) { responder(s, 200, "ok\n"); return; }
            if (!metodo.equals("POST") || !permitido(nombre)) { responder(s, 404, "no\n"); return; }
            if (largo <= 0 || largo > 256 * 1024) { responder(s, 413, "muy grande\n"); return; }

            byte[] cuerpo = new byte[largo];
            int leidos = 0;
            while (leidos < largo) {
                int r = in.read(cuerpo, leidos, largo - leidos);
                if (r < 0) break;
                leidos += r;
            }
            File destino = new File(carpeta, nombre + ".json");
            File temporal = new File(carpeta, nombre + ".json.tmp");
            FileOutputStream o = new FileOutputStream(temporal);
            o.write(cuerpo, 0, leidos);
            o.close();
            temporal.renameTo(destino);
            responder(s, 200, "guardado\n");
            if (aviso != null) aviso.llego(nombre);
        } catch (Exception e) {
            try { s.close(); } catch (Exception ignorar) { }
        }
    }

    private static boolean permitido(String n) {
        for (String p : PERMITIDOS) if (p.equals(n)) return true;
        return false;
    }

    private static String leerLinea(InputStream in) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int c;
        while ((c = in.read()) >= 0) {
            if (c == '\n') break;
            if (c != '\r') b.write(c);
            if (b.size() > 8192) break;
        }
        if (c < 0 && b.size() == 0) return null;
        return b.toString("UTF-8");
    }

    private static void responder(Socket s, int codigo, String texto) throws Exception {
        byte[] cuerpo = texto.getBytes("UTF-8");
        String estado = codigo == 200 ? "OK" : codigo == 204 ? "No Content" : codigo == 404 ? "Not Found" : "Error";
        String cab = "HTTP/1.1 " + codigo + " " + estado + "\r\nContent-Type: text/plain; charset=utf-8\r\n" +
                "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type\r\n" +
                "Content-Length: " + cuerpo.length + "\r\nConnection: close\r\n\r\n";
        OutputStream o = s.getOutputStream();
        o.write(cab.getBytes("US-ASCII"));
        o.write(cuerpo);
        o.flush();
        s.close();
    }
}
