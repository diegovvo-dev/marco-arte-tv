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
import android.os.IBinder;

/**
 * Servicio pequeño que se queda escuchando: cuando la tele se prende y el Fire TV despierta,
 * abre Marco Arte. Si estás en otra app con la tele prendida, no hace nada.
 */
public class Vigia extends Service {
    private BroadcastReceiver alPrender;

    static void iniciar(Context c) {
        Intent i = new Intent(c, Vigia.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignorar) { }
    }

    static void abrirApp(Context c) {
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        try { c.startActivity(i); } catch (Exception ignorar) { }
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
                // Un instante para que la tele termine de mostrar imagen
                new android.os.Handler(getMainLooper()).postDelayed(new Runnable() {
                    @Override
                    public void run() { abrirApp(Vigia.this); }
                }, 1500);
            }
        };
        registerReceiver(alPrender, new IntentFilter(Intent.ACTION_SCREEN_ON));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) { return START_STICKY; }

    @Override
    public void onDestroy() {
        try { unregisterReceiver(alPrender); } catch (Exception ignorar) { }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
