package dev.diegovvo.marcoarte;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Al encender el Fire TV: arranca el vigía y abre Marco Arte. */
public class Arranque extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        Vigia.iniciar(c);
        Vigia.abrirApp(c);
    }
}
