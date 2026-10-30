package dev.diegovvo.marcoarte;

import android.content.Context;
import android.net.wifi.WifiManager;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Control directo de bocinas Sonos por la red de la casa (UPnP, puerto 1400).
 * Spotify no deja que otras apps controlen las Sonos, pero la bocina sí acepta
 * órdenes de cualquier aparato en el mismo Wi-Fi, igual que la app de Sonos.
 */
class Sonos {
    private final Context ctx;
    private final List<String> bocinas = new ArrayList<>();

    Sonos(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    /**
     * accion: "alternar", "siguiente" o "anterior". cuarto: el nombre de la bocina en la app de Sonos.
     * Solo se controla ese cuarto (o el grupo al que pertenezca). Nunca se tocan las demás bocinas.
     */
    synchronized String ejecutar(String accion, String cuarto) {
        if (bocinas.isEmpty()) buscar();
        if (bocinas.isEmpty()) return "sin-sonos";
        String ip = coordinadorDe(cuarto);
        if (ip == null) { buscar(); ip = coordinadorDe(cuarto); }   // quizá cambió la IP
        if (ip == null) return "sin-cuarto";
        return ordenar(ip, accion);
    }

    /**
     * Qué está sonando en el cuarto, como JSON:
     * {"estado":"PLAYING","titulo":"…","artista":"…","album":"…","portada":"http://…","pos":83,"dur":200}
     * Devuelve "" si no encuentra el cuarto.
     */
    synchronized String info(String cuarto) {
        if (bocinas.isEmpty()) buscar();
        String ip = coordinadorDe(cuarto);
        if (ip == null) { buscar(); ip = coordinadorDe(cuarto); }
        if (ip == null) return "";
        String estado = valor(soap(ip, "GetTransportInfo", ""), "CurrentTransportState");
        String pos = soap(ip, "GetPositionInfo", "");
        String meta = desescapar(desescapar(valor(pos, "TrackMetaData")));
        String titulo = desescapar(valorLibre(meta, "dc:title"));
        String artista = desescapar(valorLibre(meta, "dc:creator"));
        String album = desescapar(valorLibre(meta, "upnp:album"));
        String portada = desescapar(valorLibre(meta, "upnp:albumArtURI"));
        if (portada != null && portada.startsWith("/")) portada = "http://" + ip + ":1400" + portada;
        try {
            org.json.JSONObject j = new org.json.JSONObject();
            j.put("estado", estado == null ? "" : estado);
            j.put("titulo", titulo == null ? "" : titulo);
            j.put("artista", artista == null ? "" : artista);
            j.put("album", album == null ? "" : album);
            j.put("portada", portada == null ? "" : portada);
            j.put("pos", segundos(valor(pos, "RelTime")));
            j.put("dur", segundos(valor(pos, "TrackDuration")));
            return j.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private static String desescapar(String t) {
        if (t == null) return null;
        return t.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&apos;", "'").replace("&amp;", "&");
    }

    private static String valorLibre(String xml, String etiqueta) {
        if (xml == null) return null;
        Matcher m = Pattern.compile("<" + Pattern.quote(etiqueta) + "(?:\\s[^>]*)?>(.*?)</" + Pattern.quote(etiqueta) + ">", Pattern.DOTALL).matcher(xml);
        return m.find() ? m.group(1).trim() : null;
    }

    private static int segundos(String t) {
        if (t == null) return 0;
        try {
            String[] p = t.split(":");
            int s = 0;
            for (String x : p) s = s * 60 + Integer.parseInt(x.trim());
            return s;
        } catch (Exception e) {
            return 0;
        }
    }

    /** Nombres de los cuartos Sonos que hay en la casa, separados por "|". */
    synchronized String cuartos() {
        if (bocinas.isEmpty()) buscar();
        Set<String> nombres = new LinkedHashSet<>();
        for (String[] m : miembros()) if (!"1".equals(m[4])) nombres.add(m[2]);
        StringBuilder b = new StringBuilder();
        for (String n : nombres) { if (b.length() > 0) b.append('|'); b.append(n); }
        return b.toString();
    }

    private String ordenar(String ip, String accion) {
        String estado = valor(soap(ip, "GetTransportInfo", ""), "CurrentTransportState");
        if (estado == null) return "fallo";
        boolean sonando = "PLAYING".equals(estado) || "TRANSITIONING".equals(estado);
        String orden, resultado;
        if (accion.equals("alternar")) {
            if (sonando) { orden = "Pause"; resultado = "pausado"; }
            else { orden = "Play"; resultado = "sonando"; }
        } else {
            orden = accion.equals("siguiente") ? "Next" : "Previous";
            resultado = "ok";
        }
        String r = soap(ip, orden, orden.equals("Play") ? "<Speed>1</Speed>" : "");
        return (r != null && !r.contains("Fault>")) ? resultado : "fallo";
    }

    /**
     * Lee cómo están agrupadas las bocinas (ZoneGroupTopology) y devuelve la IP de la bocina
     * que manda en el grupo donde está el cuarto pedido. En un par estéreo, la bocina
     * escondida ("Invisible") nunca recibe órdenes.
     */
    private String coordinadorDe(String cuarto) {
        List<String[]> lista = miembros();   // {uuid, ip, nombre, coordinador, invisible}
        String coord = null;
        for (String[] m : lista) {
            if (m[2].equalsIgnoreCase(cuarto.trim()) && !"1".equals(m[4])) { coord = m[3]; break; }
        }
        if (coord == null) return null;
        for (String[] m : lista) if (m[0].equals(coord)) return m[1];
        return null;
    }

    private List<String[]> miembros() {
        List<String[]> lista = new ArrayList<>();
        for (String ip : bocinas) {
            String r = soapServicio(ip, "/ZoneGroupTopology/Control", "ZoneGroupTopology", "GetZoneGroupState", "");
            String estado = valor(r, "ZoneGroupState");
            if (estado == null) continue;
            estado = estado.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&apos;", "'").replace("&amp;", "&");
            Matcher g = Pattern.compile("<ZoneGroup\\b[^>]*\\bCoordinator=\"([^\"]+)\"[^>]*>(.*?)</ZoneGroup>", Pattern.DOTALL).matcher(estado);
            while (g.find()) {
                String coordinador = g.group(1);
                Matcher m = Pattern.compile("<ZoneGroupMember\\b([^>]*)>").matcher(g.group(2));
                while (m.find()) {
                    String a = m.group(1);
                    String uuid = atributo(a, "UUID"), ubic = atributo(a, "Location"), nombre = atributo(a, "ZoneName");
                    if (uuid == null || ubic == null || nombre == null) continue;
                    Matcher h = Pattern.compile("http://([0-9.]+):").matcher(ubic);
                    if (!h.find()) continue;
                    String invisible = atributo(a, "Invisible");
                    lista.add(new String[]{uuid, h.group(1), nombre, coordinador, invisible == null ? "0" : invisible});
                }
            }
            if (!lista.isEmpty()) break;   // con una bocina que conteste basta: todas saben lo mismo
        }
        return lista;
    }

    private static String atributo(String texto, String nombre) {
        Matcher m = Pattern.compile("\\b" + nombre + "=\"([^\"]*)\"").matcher(texto);
        return m.find() ? m.group(1) : null;
    }

    /** Busca bocinas Sonos en el Wi-Fi (SSDP). */
    private void buscar() {
        Set<String> encontradas = new LinkedHashSet<>();
        WifiManager wifi = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
        WifiManager.MulticastLock candado = null;
        DatagramSocket socket = null;
        try {
            if (wifi != null) { candado = wifi.createMulticastLock("marco-arte-sonos"); candado.acquire(); }
            socket = new DatagramSocket();
            socket.setSoTimeout(700);
            byte[] msg = ("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 1\r\n" +
                    "ST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n\r\n").getBytes("US-ASCII");
            InetAddress grupo = InetAddress.getByName("239.255.255.250");
            Pattern ubicacion = Pattern.compile("(?i)LOCATION:\\s*http://([0-9.]+):1400/");
            long fin = System.currentTimeMillis() + 3000;
            int envios = 0;
            while (System.currentTimeMillis() < fin) {
                if (envios < 3) { socket.send(new DatagramPacket(msg, msg.length, grupo, 1900)); envios++; }
                try {
                    byte[] buf = new byte[2048];
                    DatagramPacket p = new DatagramPacket(buf, buf.length);
                    socket.receive(p);
                    Matcher m = ubicacion.matcher(new String(p.getData(), 0, p.getLength(), "US-ASCII"));
                    if (m.find()) encontradas.add(m.group(1));
                } catch (SocketTimeoutException ignorar) { }
            }
        } catch (Exception ignorar) {
        } finally {
            if (socket != null) socket.close();
            if (candado != null && candado.isHeld()) candado.release();
        }
        bocinas.clear();
        bocinas.addAll(encontradas);
    }

    private static String soap(String ip, String accion, String extra) {
        return soapServicio(ip, "/MediaRenderer/AVTransport/Control", "AVTransport", accion, "<InstanceID>0</InstanceID>" + extra);
    }

    private static String soapServicio(String ip, String ruta, String servicio, String accion, String args) {
        HttpURLConnection c = null;
        try {
            String cuerpo = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                    "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">" +
                    "<s:Body><u:" + accion + " xmlns:u=\"urn:schemas-upnp-org:service:" + servicio + ":1\">" +
                    args + "</u:" + accion + "></s:Body></s:Envelope>";
            byte[] datos = cuerpo.getBytes("UTF-8");
            c = (HttpURLConnection) new URL("http://" + ip + ":1400" + ruta).openConnection();
            c.setConnectTimeout(2500);
            c.setReadTimeout(3500);
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "text/xml; charset=\"utf-8\"");
            c.setRequestProperty("SOAPACTION", "\"urn:schemas-upnp-org:service:" + servicio + ":1#" + accion + "\"");
            c.setFixedLengthStreamingMode(datos.length);
            OutputStream o = c.getOutputStream();
            o.write(datos);
            o.close();
            int code = c.getResponseCode();
            InputStream in = code < 400 ? c.getInputStream() : c.getErrorStream();
            String resp = leer(in);
            return code < 400 ? resp : "<s:Fault>" + resp;
        } catch (Exception e) {
            return null;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private static String leer(InputStream in) throws Exception {
        if (in == null) return "";
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
        in.close();
        return b.toString("UTF-8");
    }

    private static String valor(String xml, String etiqueta) {
        if (xml == null) return null;
        Matcher m = Pattern.compile("<" + etiqueta + ">([^<]*)</" + etiqueta + ">").matcher(xml);
        if (!m.find()) {
            m = Pattern.compile("<" + etiqueta + ">(.*?)</" + etiqueta + ">", Pattern.DOTALL).matcher(xml);
            return m.find() ? m.group(1) : null;
        }
        m.reset();
        return m.find() ? m.group(1).replace("&amp;", "&") : null;
    }
}
