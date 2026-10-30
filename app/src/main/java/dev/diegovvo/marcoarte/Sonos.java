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

    /** accion: "alternar", "siguiente" o "anterior". Devuelve un resultado corto para la página. */
    synchronized String ejecutar(String accion) {
        if (bocinas.isEmpty()) buscar();
        if (bocinas.isEmpty()) return "sin-sonos";
        String r = intentar(accion);
        if (r.equals("fallo")) {           // quizá cambió la IP: buscamos de nuevo una vez
            buscar();
            r = intentar(accion);
        }
        return r;
    }

    private String intentar(String accion) {
        List<String> sonando = new ArrayList<>();
        List<String> enPausa = new ArrayList<>();
        for (String ip : bocinas) {
            String uri = valor(soap(ip, "GetMediaInfo", ""), "CurrentURI");
            if (uri != null && uri.startsWith("x-rincon:")) continue;   // es parte de un grupo; manda el coordinador
            String estado = valor(soap(ip, "GetTransportInfo", ""), "CurrentTransportState");
            if ("PLAYING".equals(estado) || "TRANSITIONING".equals(estado)) sonando.add(ip);
            else if ("PAUSED_PLAYBACK".equals(estado)) enPausa.add(ip);
        }
        if (sonando.isEmpty() && enPausa.isEmpty()) return "nada";

        String orden, resultado;
        List<String> destino;
        if (accion.equals("alternar")) {
            if (!sonando.isEmpty()) { orden = "Pause"; destino = sonando; resultado = "pausado"; }
            else { orden = "Play"; destino = enPausa; resultado = "sonando"; }
        } else {
            orden = accion.equals("siguiente") ? "Next" : "Previous";
            destino = sonando.isEmpty() ? enPausa : sonando;
            resultado = "ok";
        }
        String extra = orden.equals("Play") ? "<Speed>1</Speed>" : "";
        boolean alguno = false;
        for (String ip : destino) {
            String r = soap(ip, orden, extra);
            if (r != null && !r.contains("<s:Fault>") && !r.contains("Fault>")) alguno = true;
        }
        return alguno ? resultado : "fallo";
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
        HttpURLConnection c = null;
        try {
            String cuerpo = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                    "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">" +
                    "<s:Body><u:" + accion + " xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">" +
                    "<InstanceID>0</InstanceID>" + extra + "</u:" + accion + "></s:Body></s:Envelope>";
            byte[] datos = cuerpo.getBytes("UTF-8");
            c = (HttpURLConnection) new URL("http://" + ip + ":1400/MediaRenderer/AVTransport/Control").openConnection();
            c.setConnectTimeout(2500);
            c.setReadTimeout(3500);
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "text/xml; charset=\"utf-8\"");
            c.setRequestProperty("SOAPACTION", "\"urn:schemas-upnp-org:service:AVTransport:1#" + accion + "\"");
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
        return m.find() ? m.group(1).replace("&amp;", "&") : null;
    }
}
