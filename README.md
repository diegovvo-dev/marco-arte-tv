# Marco Arte

App para Fire TV que convierte la tele en un cuadro: pinturas famosas de dominio público con su cartela de museo, la hora, la fecha y el clima.

- **Pinturas:** colección abierta del Art Institute of Chicago (gratis, sin cuenta).
- **Clima:** Open-Meteo (gratis, sin cuenta).
- **Costo:** $0. No usa suscripciones ni pide iniciar sesión.

## Instalar en el Fire TV Stick

1. En el Fire TV: **Configuración → Mi Fire TV → Acerca de**. Presiona 7 veces sobre el nombre del dispositivo hasta que diga que ya eres desarrollador.
2. Instala la app **Downloader** desde la tienda de Amazon (es gratis).
3. **Configuración → Mi Fire TV → Opciones de desarrollador → Instalar apps desconocidas** y activa **Downloader**.
4. Abre Downloader y escribe esta dirección:

   ```
   https://github.com/diegovvo-dev/marco-arte-tv/releases/latest/download/marco-arte-tv.apk
   ```

5. Dale **Instalar** y luego **Abrir**. La app aparece en tu menú como **Marco Arte**.

Para actualizarla, repite el paso 4 con la misma dirección: siempre baja la versión más nueva.

## Control remoto

| Botón | Qué hace |
|---|---|
| ◀ ▶ | Obra anterior / siguiente |
| OK o ☰ | Abre los ajustes |
| ⏯ | Deja la obra fija o vuelve a rotar |
| ▲ | Muestra la ayuda |
| Atrás | Cierra los ajustes o sale de la app |

En **Ajustes** se elige la colección (Impresionismo, Van Gogh y postimpresionismo, Monet, Paisajes, Retratos, Bodegones, Grabado japonés o todo mezclado), cada cuánto cambia la obra, la ciudad del clima, el estilo (Galería o Inmersivo), formato de hora, solo obras horizontales y atenuar de noche.

## Cómo se construye

Cada cambio que se sube a `main` lo compila GitHub Actions (gratis) y publica el `.apk` en **Releases**. La pantalla está hecha en HTML (`app/src/main/assets/`) dentro de una app Android mínima.

La llave de firma `app/marco.keystore` está en el repo a propósito para que cada versión nueva se instale encima de la anterior sin borrar la app. Es solo para esta app personal.

Tipografías: Cormorant Garamond y Jost, bajo licencia SIL Open Font License (ver `app/src/main/assets/fonts/`).
