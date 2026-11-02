package dev.diegovvo.marcoarte;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;

/**
 * Servicio pequeño que se queda escuchando y abre Marco Arte cuando:
 *  - la tele se prende (el Fire TV detecta la señal HDMI otra vez; sirve aunque la tele
 *    no le avise por HDMI-CEC y el Fire TV esté conectado a la corriente),
 *  - el Fire TV despierta o sale de su protector de pantalla,
 *  - la app se cerró sola (falla o falta de memoria) sin que tú le picaras a Inicio.
 * Si saliste con el botón de Inicio, no hace nada hasta la próxima vez que se prenda la tele.
 */
public class Vigia extends Service {
    private BroadcastReceiver alPrender, alHdmi;
    private final Handler h = new Handler();

    static void iniciar(Context c) {
        Intent i = new Intent(c, Vigia.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignorar) { }
    }

    static void abrirApp(Context c, String porque) {
        if (MainActivity.enPantalla) return;   // ya se ve: no la toques (evita parpadeos)
        Bitacora.anotar(c, "abrir app: " + porque);
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        try { c.startActivity(i); } catch (Exception e) { Bitacora.anotar(c, "no se pudo abrir: " + e); }
    }

    private void abrirEn(final String porque, long ms) {
        h.postDelayed(new Runnable() {
            @Override
            public void run() { abrirApp(Vigia.this, porque); }
        }, ms);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            NotificationChannel canal = new NotificationChannel("vigia", "Marco Arte", NotificationManager.IMPORTANCE_MIN);
            canal.setShowBadge(false);
            nm.createNotificationChannel(canal);
            Notification n = new Notification.Builder(this, "vigia")
                    .setContentTitle("Marco Arte")
                    .setContentText("Se abre sola al prender la tele")
                    .setSmallIcon(R.drawable.ic_launcher)
                    .setOngoing(true)
                    .build();
            startForeground(7, n);
        }

        alPrender = new BroadcastReceiver() {
            @Override
            public void onReceive(Context c, Intent i) {
                String a = String.valueOf(i.getAction());
                Bitacora.anotar(c, a);
                if (Intent.ACTION_SCREEN_OFF.equals(a)) return;
                // Al prender la pantalla o terminar el protector: vuelve a la app,
                // a menos que hayas salido con Inicio y la tele siga prendida.
                if (Intent.ACTION_DREAMING_STOPPED.equals(a) && MainActivity.salioUsuario) return;
                MainActivity.salioUsuario = false;
                abrirEn(a, 1500);
            }
        };
        IntentFilter filtro = new IntentFilter(Intent.ACTION_SCREEN_ON);
        filtro.addAction(Intent.ACTION_SCREEN_OFF);
        filtro.addAction(Intent.ACTION_DREAMING_STOPPED);
        registerReceiver(alPrender, filtro);

        // La tele se prende -> vuelve la señal HDMI (no depende de HDMI-CEC)
        alHdmi = new BroadcastReceiver() {
            @Override
            public void onReceive(Context c, Intent i) {
                if (isInitialStickyBroadcast()) return;
                boolean conectada = i.getBooleanExtra("state", false);
                Bitacora.anotar(c, "HDMI " + (conectada ? "conectada (tele prendida)" : "desconectada (tele apagada)"));
                if (conectada) { MainActivity.salioUsuario = false; abrirEn("tele prendida", 2500); }
            }
        };
        registerReceiver(alHdmi, new IntentFilter("android.intent.action.HDMI_PLUGGED"));

        // Si el sistema cerró la app sola (no fuiste tú), se vuelve a abrir
        if (!MainActivity.vivo && getSharedPreferences("estado", MODE_PRIVATE).getBoolean("mostrando", false)) {
            Bitacora.anotar(this, "la app se había cerrado sola");
            abrirEn("se cerró sola", 3000);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) { return START_STICKY; }

    @Override
    public void onDestroy() {
        try { unregisterReceiver(alPrender); } catch (Exception ignorar) { }
        try { unregisterReceiver(alHdmi); } catch (Exception ignorar) { }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
