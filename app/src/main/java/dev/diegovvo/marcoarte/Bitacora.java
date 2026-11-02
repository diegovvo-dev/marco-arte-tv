package dev.diegovvo.marcoarte;

import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** Apunta en bitacora.txt cuándo la app se ve, se esconde, se cae o la tele se prende (para revisar fallas). */
final class Bitacora {
    private Bitacora() { }

    static synchronized void anotar(Context c, String que) {
        try {
            File dir = c.getExternalFilesDir(null);
            if (dir == null) dir = c.getFilesDir();
            File f = new File(dir, "bitacora.txt");
            if (f.length() > 300 * 1024) {
                File vieja = new File(dir, "bitacora-vieja.txt");
                vieja.delete();
                f.renameTo(vieja);
            }
            String linea = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.ROOT).format(new Date()) + "  " + que + "\n";
            FileOutputStream o = new FileOutputStream(f, true);
            o.write(linea.getBytes("UTF-8"));
            o.close();
        } catch (Exception ignorar) { }
    }
}
