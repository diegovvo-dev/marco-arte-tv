package dev.diegovvo.marcoarte;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
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

        setContentView(web);
        ocultarBarras();
        web.loadUrl("file:///android_asset/index.html");
        web.requestFocus();
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
    protected void onPause() {
        web.onPause();
        super.onPause();
    }
}
