/* Centro de control del cuarto — pantalla vertical (Atvio parada, orilla de abajo a la derecha).
   Día: azul tecnológico. Noche (botón OK): negro, la misma información, atenuada y cálida.
   Esta versión pinta el diseño con datos de ejemplo; las fuentes reales se conectan después. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }

  // ------------------------------------------------------------ Íconos (un solo color)
  var T = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    sol: '<svg viewBox="0 0 32 32" ' + T + '><circle cx="16" cy="16" r="6"/><path d="M16 3.5v3M16 25.5v3M3.5 16h3M25.5 16h3M7.2 7.2l2.1 2.1M22.7 22.7l2.1 2.1M7.2 24.8l2.1-2.1M22.7 9.3l2.1-2.1"/></svg>',
    luna: '<svg viewBox="0 0 32 32" ' + T + '><path d="M25.5 19.5A10.5 10.5 0 0 1 12.5 6.5a10.5 10.5 0 1 0 13 13z"/></svg>',
    nube: '<svg viewBox="0 0 32 32" ' + T + '><path d="M10 24.5h13a5 5 0 0 0 .6-9.96A7.5 7.5 0 0 0 9.3 15.6 4.5 4.5 0 0 0 10 24.5z"/></svg>',
    parcial: '<svg viewBox="0 0 32 32" ' + T + '><path d="M11 5v2M4.6 11H6.6M6.5 6.5l1.4 1.4M15.5 6.5l-1.4 1.4"/><path d="M8.3 14.2A5 5 0 0 1 15.6 10"/><path d="M12 26h11a4.5 4.5 0 0 0 .5-8.97 6.5 6.5 0 0 0-12.4 1A4 4 0 0 0 12 26z"/></svg>',
    lluvia: '<svg viewBox="0 0 32 32" ' + T + '><path d="M10 19.5h13a5 5 0 0 0 .6-9.96A7.5 7.5 0 0 0 9.3 10.6 4.5 4.5 0 0 0 10 19.5z"/><path d="M12 23l-1.5 3.5M17 23l-1.5 3.5M22 23l-1.5 3.5"/></svg>',
    tormenta: '<svg viewBox="0 0 32 32" ' + T + '><path d="M10 19.5h13a5 5 0 0 0 .6-9.96A7.5 7.5 0 0 0 9.3 10.6 4.5 4.5 0 0 0 10 19.5z"/><path d="M17 19.5l-3 5h4l-2 4.5"/></svg>',
    alarma: '<svg viewBox="0 0 32 32" ' + T + '><circle cx="16" cy="17.5" r="10"/><path d="M16 12v6l3.5 2.5M5 6.5l4-3M27 6.5l-4-3"/></svg>',
    avion: '<svg viewBox="0 0 32 32" ' + T + '><path d="M4 18l8-1 6-11h3l-2.5 10.5 7-.5 2-3h2l-1 5 1 5h-2l-2-3-7-.5L21 30h-3l-6-11-8-1z" transform="rotate(-30 16 16)"/></svg>',
    calendario: '<svg viewBox="0 0 32 32" ' + T + '><rect x="4.5" y="6.5" width="23" height="21" rx="4"/><path d="M4.5 13h23M10.5 3.5v6M21.5 3.5v6"/></svg>',
    check: '<svg viewBox="0 0 32 32" ' + T + '><circle cx="16" cy="16" r="12"/><path d="M10.5 16.5l3.8 3.8 7.4-8"/></svg>',
    chispa: '<svg viewBox="0 0 32 32" ' + T + '><path d="M16 3.5c.9 6.4 3.3 10.6 12.5 12.5-9.2 1.9-11.6 6.1-12.5 12.5-.9-6.4-3.3-10.6-12.5-12.5C12.7 14.1 15.1 9.9 16 3.5z"/></svg>',
    casa: '<svg viewBox="0 0 32 32" ' + T + '><path d="M4.5 14.5L16 5l11.5 9.5V27a1 1 0 0 1-1 1h-6.5v-8h-8v8H5.5a1 1 0 0 1-1-1z"/></svg>',
    laptop: '<svg viewBox="0 0 32 32" ' + T + '><rect x="6" y="7" width="20" height="13.5" rx="2"/><path d="M3 24.5h26"/></svg>',
    consola: '<svg viewBox="0 0 32 32" ' + T + '><path d="M9 10h14a6 6 0 0 1 5.8 7.5l-1.2 4.8a3 3 0 0 1-5.1 1.3L19.6 21h-7.2l-2.9 2.6a3 3 0 0 1-5.1-1.3l-1.2-4.8A6 6 0 0 1 9 10z"/><path d="M10.5 14v4M8.5 16h4"/></svg>',
    tele: '<svg viewBox="0 0 32 32" ' + T + '><rect x="3.5" y="6" width="25" height="16.5" rx="2"/><path d="M11 27h10"/></svg>',
    tablet: '<svg viewBox="0 0 32 32" ' + T + '><rect x="6.5" y="3.5" width="19" height="25" rx="3"/><path d="M15 24.5h2"/></svg>',
    bocina: '<svg viewBox="0 0 32 32" ' + T + '><rect x="8.5" y="3.5" width="15" height="25" rx="3"/><circle cx="16" cy="18.5" r="5"/><path d="M16 9h.01"/></svg>',
    telefono: '<svg viewBox="0 0 32 32" ' + T + '><rect x="9" y="3.5" width="14" height="25" rx="3.5"/><path d="M14 7h4"/></svg>'
  };
  function icono(nombre) { return '<span class="icono">' + (I[nombre] || '') + '</span>'; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-i]'), function (el) { el.innerHTML = I[el.getAttribute('data-i')] || ''; });

  // ------------------------------------------------------------ Datos de ejemplo
  function hoyA(h, m) { var d = new Date(); d.setHours(h, m || 0, 0, 0); return d; }
  function enDias(n, h, m) { var d = hoyA(h, m); d.setDate(d.getDate() + n); return d; }
  var EJEMPLO = {
    clima: { temp: 17, max: 25, min: 11, texto: 'Casi despejado', icono: 'luna', ciudad: 'La Magdalena Contreras',
      horas: [{ h: 'Ahora', i: 'luna', t: 17 }, { h: '3 a. m.', i: 'luna', t: 15 }, { h: '6 a. m.', i: 'nube', t: 13 },
              { h: '9 a. m.', i: 'parcial', t: 17 }, { h: '12 p. m.', i: 'sol', t: 23 }, { h: '3 p. m.', i: 'sol', t: 25 }] },
    alarma: enDias(1, 7, 0),
    cuenta: { titulo: 'Madrid', fecha: new Date(2027, 0, 7), clases: new Date(2027, 0, 14) },
    eventos: [
      { ini: hoyA(9, 0), fin: hoyA(10, 30), titulo: 'Taller de Algoritmos y Programación', lugar: 'IBERO' },
      { ini: hoyA(13, 0), fin: hoyA(14, 0), titulo: 'Comida con distribuidor', lugar: 'Polanco' },
      { ini: hoyA(19, 0), fin: hoyA(20, 0), titulo: 'Junta Los Primos', lugar: 'Videollamada' }
    ],
    manana: [
      { ini: enDias(1, 8, 0), titulo: 'Negocios Globales' },
      { ini: enDias(1, 17, 0), titulo: 'Entrega de muestras a restaurante' }
    ],
    pendientes: [
      { titulo: 'Agendar cita de visa en BLS', vence: 'Hoy', urgente: true },
      { titulo: 'Mandar cotización a Mesa de Noche', vence: 'Mañana 10:00' },
      { titulo: 'Subir ejercicio de Colab', vence: 'Viernes' },
      { titulo: 'Comprar cable USB‑C a HDMI', vence: '' }
    ],
    claude: { cuando: 'hace 12 min', temas: [
      { titulo: 'App Marco Arte para la tele', nota: 'Centro de control vertical' },
      { titulo: 'Venta a restaurantes CDMX', nota: 'Guion de primer contacto' },
      { titulo: 'Intercambio en Madrid', nota: 'Sigue la cita de visa' }
    ] },
    musica: { titulo: 'Vagabundo', artista: 'Sebastián Yatra, Manuel Turizo, Beéle', pos: 83, dur: 215, leido: Date.now(), sonando: true, portada: '' },
    aparatos: [
      { nombre: 'Laptop', icono: 'laptop', on: true, estado: 'Cargando · 66 %' },
      
      { nombre: 'Marco Arte', icono: 'tele', on: true, estado: 'Las bodas de Caná' },
      { nombre: 'Sonos Diego', icono: 'bocina', on: true, estado: 'Sonando' },
      { nombre: 'iPhone', icono: 'telefono', on: true, estado: 'En casa · 82 %' },
      { nombre: 'iPad', icono: 'tablet', on: false, estado: 'Sin conexión' }
    ],
    cambio: 'EUR 1 = MXN 21.48',
    actualizado: new Date()
  };
  var DATOS = EJEMPLO;

  // ------------------------------------------------------------ Formatos
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function dd(n) { return n < 10 ? '0' + n : '' + n; }
  function hora12(d, conAmPm) {
    var h = d.getHours(), m = d.getMinutes();
    var t = (h % 12 === 0 ? 12 : h % 12) + ':' + dd(m);
    return conAmPm ? t + (h < 12 ? ' a. m.' : ' p. m.') : t;
  }
  function falta(ms) {
    var min = Math.max(0, Math.round(ms / 60000)), h = Math.floor(min / 60), m = min % 60;
    if (h === 0) return 'en ' + m + ' min';
    return 'en ' + h + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

  // ------------------------------------------------------------ Hora de vidrio líquido (con segundos)
  // Sobre fondo negro el vidrio se dibuja directo: relleno blanco translúcido con brillo arriba
  // y un borde de luz. LIQUIDO va de 0 (blanco sólido) a 100 (vidrio). Cada dígito ocupa
  // el mismo ancho para que la hora no "baile" cuando cambian los segundos.
  var LIQUIDO = 100;
  var horaDibujada = '';
  var lienzoTmp = document.createElement('canvas');
  function dibujarHora(txt, forzar) {
    if (!forzar && txt === horaDibujada) return;
    horaDibujada = txt;
    var g = LIQUIDO / 100, dpr = 1.5, fs = 190;
    var fuente = '600 ' + fs + 'px InterVar, "Helvetica Neue", Arial, sans-serif';
    var c = $('hora-texto'), x = c.getContext('2d');
    x.font = fuente;
    var celda = 0;
    for (var d = 0; d <= 9; d++) celda = Math.max(celda, x.measureText(String(d)).width);
    var dosp = x.measureText(':').width;
    var letras = txt.split(''), espacio = -0.02 * fs;
    var anchos = letras.map(function (ch) { return ch === ':' ? dosp : celda; });
    var total = anchos.reduce(function (a, b) { return a + b; }, 0) + espacio * (letras.length - 1);
    // Que quepa en el ancho de la pantalla
    var maxAncho = 900;
    if (total > maxAncho) { var k = maxAncho / total; fs = Math.floor(fs * k); return dibujarConTam(fs); }
    return dibujarConTam(fs);

    function dibujarConTam(fs2) {
      var f2 = '600 ' + fs2 + 'px InterVar, "Helvetica Neue", Arial, sans-serif';
      x.font = f2;
      var cel = 0; for (var d2 = 0; d2 <= 9; d2++) cel = Math.max(cel, x.measureText(String(d2)).width);
      var dp = x.measureText(':').width, esp = -0.02 * fs2;
      var an = letras.map(function (ch) { return ch === ':' ? dp : cel; });
      var tot = an.reduce(function (a, b) { return a + b; }, 0) + esp * (letras.length - 1);
      var pad = Math.round(fs2 * 0.1), alto = Math.round(fs2 * 0.74);
      var W = Math.ceil(tot + pad * 2), H = alto + pad * 2, base = pad + alto;
      function preparar(cv) {
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        var cx = cv.getContext('2d'); cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
        cx.font = f2; cx.textBaseline = 'alphabetic'; cx.textAlign = 'center'; return cx;
      }
      function escribir(cx, dx, dy) {
        var px = pad;
        for (var i = 0; i < letras.length; i++) { cx.fillText(letras[i], px + an[i] / 2 + (dx || 0), base + (dy || 0)); px += an[i] + esp; }
      }
      var xt = preparar(c);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      // Relleno: de blanco sólido (0 %) a vidrio translúcido con brillo arriba (100 %)
      var rel = xt.createLinearGradient(0, pad, 0, pad + alto);
      rel.addColorStop(0, 'rgba(255,255,255,' + (1 - 0.45 * g).toFixed(3) + ')');
      rel.addColorStop(0.5, 'rgba(255,255,255,' + (1 - 0.78 * g).toFixed(3) + ')');
      rel.addColorStop(1, 'rgba(255,255,255,' + (1 - 0.62 * g).toFixed(3) + ')');
      xt.fillStyle = rel; escribir(xt);
      // Borde de luz: la forma menos la misma forma movida un poco (sin líneas internas)
      var grosor = Math.max(1.2, fs2 * (0.008 + 0.008 * g));
      function filo(dx, dy, alfa) {
        var t = preparar(lienzoTmp);
        t.fillStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')'; escribir(t);
        t.globalCompositeOperation = 'destination-out'; t.fillStyle = '#000'; escribir(t, dx, dy);
        t.globalCompositeOperation = 'source-over';
        xt.setTransform(1, 0, 0, 1, 0, 0); xt.drawImage(lienzoTmp, 0, 0); xt.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      var aB = 0.35 + 0.65 * g;
      filo(0, grosor, aB); filo(0, -grosor, aB * 0.6); filo(grosor, 0, aB * 0.45); filo(-grosor, 0, aB * 0.45);
    }
  }
  if (document.fonts && document.fonts.load) document.fonts.load('600 100px InterVar').then(function () { dibujarHora(horaDibujada || '', true); }, function () {});
  function hms(d) { var h = d.getHours(); return (h % 12 === 0 ? 12 : h % 12) + ':' + dd(d.getMinutes()) + ':' + dd(d.getSeconds()); }
  (function tic() { dibujarHora(hms(new Date()), false); setTimeout(tic, 1000 - (Date.now() % 1000) + 5); })();

  // ------------------------------------------------------------ Música: barra suave y tiempos
  var ICONO_PAUSA = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>';
  var ICONO_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  function minSeg(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + dd(s % 60); }
  function avanzarMusica() {
    var m = (typeof D !== 'undefined' && D.musica) || (DATOS && DATOS.musica);
    if (!m || !m.titulo || !m.dur) { $('m-avance').style.width = '0'; $('m-va').textContent = ''; $('m-falta').textContent = ''; return; }
    var pos = m.pos + (m.sonando ? (Date.now() - m.leido) / 1000 : 0);
    pos = Math.min(pos, m.dur);
    $('m-avance').style.width = (pos / m.dur * 100).toFixed(2) + '%';
    $('m-va').textContent = minSeg(pos);
    $('m-falta').textContent = '-' + minSeg(m.dur - pos);
  }
  setInterval(avanzarMusica, 250);

  // Control de la Sonos con ⏪ ⏯ ⏩ del control (la app de Android manda estas teclas aquí)
  function iluminar(id) { var b = $(id); b.className = 'boton activo'; setTimeout(function () { b.className = 'boton'; }, 350); }
  var esperandoSonos = false;
  function ordenSonos(accion) {
    iluminar(accion === 'pausa' ? 'm-pausa' : accion === 'siguiente' ? 'm-siguiente' : 'm-anterior');
    if (!(window.Android && Android.sonos) || esperandoSonos) return;
    esperandoSonos = true;
    setTimeout(function () { esperandoSonos = false; }, 8000);
    var m = typeof D !== 'undefined' && D.musica;
    if (accion === 'pausa' && m && m.titulo) {   // se ve al instante; la bocina confirma después
      m.pos = m.pos + (m.sonando ? (Date.now() - m.leido) / 1000 : 0); m.leido = Date.now(); m.sonando = !m.sonando;
      pintar(D);
    }
    Android.sonos(accion === 'pausa' ? 'alternar' : accion, CONFIG.cuartoSonos || 'Diego');
  }
  window.alSonos = function () { esperandoSonos = false; setTimeout(actualizarSonos, 400); setTimeout(actualizarSonos, 1500); };
  window.alPausa = function () { ordenSonos('pausa'); };
  window.alSiguiente = function () { ordenSonos('siguiente'); };
  window.alAnterior = function () { ordenSonos('anterior'); };

  // ------------------------------------------------------------ Pintar
  // Cada sección se pinta con lo que haya; si falta un dato, se dice qué falta conectar.
  function vacio(id, texto) { $(id).innerHTML = '<li class="vacio">' + esc(texto) + '</li>'; }

  function pintar(D) {
    var ahora = new Date();
    $('fecha').textContent = DIAS[ahora.getDay()] + ', ' + ahora.getDate() + ' de ' + MESES[ahora.getMonth()];

    var c = D.clima;
    if (c) {
      $('clima-icono').innerHTML = I[c.icono] || '';
      $('clima-temp').textContent = c.temp + '°';
      $('clima-texto').textContent = c.texto + ' · ' + c.ciudad;
      $('clima-rango').textContent = c.max != null ? 'Máx. ' + c.max + '°  ·  Mín. ' + c.min + '°' : '';
      $('horas').innerHTML = c.horas.map(function (x) { return '<li>' + esc(x.h) + icono(x.i) + '<b>' + x.t + '°</b></li>'; }).join('');
    }

    if (D.alarma) {
      $('alarma-hora').textContent = hora12(D.alarma, true);
      var manana = new Date(ahora); manana.setDate(manana.getDate() + 1);
      var dia = D.alarma.toDateString() === ahora.toDateString() ? 'Hoy' : D.alarma.toDateString() === manana.toDateString() ? 'Mañana' : DIAS[D.alarma.getDay()];
      $('alarma-falta').textContent = dia + ' · ' + falta(D.alarma - ahora);
    } else {
      $('alarma-hora').textContent = '—';
      $('alarma-falta').textContent = D.iphone ? 'Sin alarmas activas' : 'Falta el Atajo del iPhone';
    }

    if (D.cuenta && D.cuenta.fecha) {
      var hoy0 = new Date(ahora); hoy0.setHours(0, 0, 0, 0);
      var diasA = function (f) { return Math.max(0, Math.round((f - hoy0) / 86400000)); };
      var corta = function (f) { return f.getDate() + ' de ' + MESES[f.getMonth()]; };
      $('cuenta-titulo').textContent = D.cuenta.titulo;
      $('cuenta-dias').textContent = diasA(D.cuenta.fecha);
      $('cuenta-nota').textContent = corta(D.cuenta.fecha);
      if (D.cuenta.clases) {
        $('clases-dias').textContent = diasA(D.cuenta.clases);
        $('clases-nota').textContent = corta(D.cuenta.clases) + ' · ICADE';
      }
    }

    // Hoy: lo que sigue (máximo 3); si ya pasó casi todo, se completa con lo último que pasó.
    if (D.eventos) {
      var siguen = D.eventos.filter(function (e) { return e.fin >= ahora; });
      var pasaron = D.eventos.filter(function (e) { return e.fin < ahora; });
      var visibles = pasaron.slice(Math.max(0, pasaron.length - Math.max(0, 3 - siguen.length))).concat(siguen).slice(0, 3);
      if (visibles.length) {
        $('eventos').innerHTML = visibles.map(function (e) {
          var clase = e.fin < ahora ? 'pasado' : (e.ini <= ahora ? 'ahora' : '');
          var pil = clase === 'ahora' ? '<span class="pildora">Ahora</span>' : '';
          var horario = e.todoElDia ? 'Todo el día' : hora12(e.ini, false) + ' – ' + hora12(e.fin, true);
          return '<li class="' + clase + '"><span class="color" style="background:' + (e.color || 'transparent') + '"></span><span class="cuando">' + (e.todoElDia ? 'Día' : hora12(e.ini, false)) + '</span>' +
            '<span class="que">' + esc(e.titulo) + pil + '<small>' + horario + (e.lugar ? ' · ' + esc(e.lugar) : '') + '</small></span></li>';
        }).join('');
      } else vacio('eventos', 'Nada en el calendario hoy');
      $('hoy-resumen').textContent = siguen.length ? (siguen.length === 1 ? '1 por delante' : siguen.length + ' por delante') : 'Nada más hoy';
      $('eventos-manana').innerHTML = (D.manana || []).slice(0, 2).map(function (e) {
        return '<li><span class="color" style="background:' + (e.color || 'transparent') + '"></span><span class="cuando">Mañana ' + (e.todoElDia ? '' : hora12(e.ini, false)) + '</span><span class="que">' + esc(e.titulo) + '</span></li>';
      }).join('');
    } else {
      var links = CONFIG.calendarios || (CONFIG.calendario ? [CONFIG.calendario] : []);
      vacio('eventos', !links.length ? 'Conecta tu calendario de iCloud' : D.errorCalendario ? 'No pude leer el calendario (' + D.errorCalendario + ')' : 'Cargando calendario…');
      $('hoy-resumen').textContent = '';
      $('eventos-manana').innerHTML = '';
    }

    if (D.pendientes) {
      if (D.pendientes.length) {
        $('pendientes').innerHTML = D.pendientes.slice(0, 3).map(function (p) {
          return '<li><span class="punto-lista' + (p.urgente ? ' urgente' : '') + '"></span><span class="que">' + esc(p.titulo) +
            (p.vence ? '<span class="vence' + (p.urgente ? ' urgente' : '') + '">' + esc(p.vence) + '</span>' : '') + '</span></li>';
        }).join('');
      } else vacio('pendientes', 'Sin pendientes');
      $('pend-resumen').textContent = D.pendientes.length ? D.pendientes.length + ' en total' : '';
    } else {
      vacio('pendientes', 'Falta el Atajo del iPhone');
      $('pend-resumen').textContent = '';
    }

    if (D.claude && D.claude.temas && D.claude.temas.length) {
      $('claude-cuando').textContent = D.claude.cuando || '';
      $('claude').innerHTML = D.claude.temas.slice(0, 3).map(function (t) {
        return '<li>' + esc(t.titulo) + '<small>' + esc(t.nota || '') + '</small></li>';
      }).join('');
    } else {
      $('claude-cuando').textContent = '';
      vacio('claude', 'Pronto: el resumen de tus chats');
    }

    var m = D.musica;
    if (m && m.titulo) {
      $('t-musica').className = 'tarjeta' + (m.sonando ? '' : ' pausa');
      $('m-lugar').textContent = 'Sonos · ' + (m.cuarto || 'Diego') + (m.sonando ? '' : ' · En pausa');
      $('m-titulo').textContent = m.titulo;
      $('m-artista').textContent = m.artista;
      if (m.portada && $('m-portada').getAttribute('src') !== m.portada) $('m-portada').src = m.portada;
      $('m-portada').style.visibility = m.portada ? 'visible' : 'hidden';
      $('m-pausa').innerHTML = m.sonando ? ICONO_PAUSA : ICONO_PLAY;
    } else {
      $('t-musica').className = 'tarjeta pausa';
      $('m-lugar').textContent = 'Sonos · ' + ((m && m.cuarto) || 'Diego');
      $('m-titulo').textContent = 'Nada sonando';
      $('m-artista').textContent = '';
      $('m-portada').style.visibility = 'hidden';
      $('m-pausa').innerHTML = ICONO_PLAY;
    }
    avanzarMusica();

    $('aparatos').innerHTML = (D.aparatos || []).map(function (a) {
      return '<li class="' + (a.on ? 'on' : 'off') + '">' + icono(a.icono) +
        '<div><div class="nombre">' + esc(a.nombre) + '</div><div class="estado"><span class="punto"></span><span class="texto">' + esc(a.estado) + '</span></div></div></li>';
    }).join('');

    $('pie-cambio').textContent = D.cambio || '';
    $('pie-actualizado').textContent = D.actualizado ? 'Actualizado ' + hora12(D.actualizado, true) : '';
  }

  // ------------------------------------------------------------ Ajustes (☰): brillo y vidrio líquido
  var ajustes = { brillo: 100, liquido: 100, tamano: 94, v: 2 };
  try {
    var g = JSON.parse(localStorage.getItem('centro.ajustes') || '{}');
    if (g.brillo != null) ajustes.brillo = g.brillo;
    if (g.liquido != null && g.v === 2) ajustes.liquido = g.liquido;
    if (g.tamano != null) ajustes.tamano = g.tamano;
  } catch (e) {}
  function guardar() { try { localStorage.setItem('centro.ajustes', JSON.stringify(ajustes)); } catch (e) {} }

  var FILAS = [
    { clave: 'brillo', etiqueta: 'Brillo', min: 10, max: 100 },
    { clave: 'liquido', etiqueta: 'Vidrio líquido', min: 0, max: 100 },
    { clave: 'tamano', etiqueta: 'Tamaño de pantalla', min: 70, max: 100, paso: 2 }
  ];
  var panelAbierto = false, filaActiva = 0;

  function aplicarAjustes() {
    $('velo').style.opacity = (Math.min(0.9, 1 - ajustes.brillo / 100)).toFixed(2);
    LIQUIDO = ajustes.liquido;
    acomodar();
    dibujarHora(hms(new Date()), true);
  }

  function pintarPanel() {
    $('ajustes-lista').innerHTML = FILAS.map(function (f, i) {
      var v = ajustes[f.clave], pct = (v - f.min) / (f.max - f.min) * 100;
      return '<li class="' + (i === filaActiva ? 'activo' : '') + '"><div class="fila-ajuste"><span>' + f.etiqueta + '</span><b>' + v + ' %</b></div>' +
        '<div class="barra"><i style="width:' + pct + '%"></i><b style="left:' + pct + '%"></b></div></li>';
    }).join('');
    var ip = '';
    try { ip = (window.Android && Android.ip && Android.ip()) || ''; } catch (e) {}
    $('ajustes-lista').innerHTML += '<li class="info"><div class="fila-ajuste"><span>Buzón de esta tele</span><b>' + (ip ? 'http://' + ip + ':8765' : 'Sin Wi‑Fi') + '</b></div>' +
      '<div class="fila-ajuste"><span>Pantalla</span><b>' + medida().W + ' × ' + medida().H + '</b></div></li>';
  }
  function abrirPanel() { panelAbierto = true; filaActiva = 0; $('ajustes').hidden = false; pintarPanel(); }
  function cerrarPanel() { panelAbierto = false; $('ajustes').hidden = true; }
  function mover(dir) {
    var f = FILAS[filaActiva];
    ajustes[f.clave] = Math.max(f.min, Math.min(f.max, ajustes[f.clave] + dir * (f.paso || 10)));
    guardar(); aplicarAjustes(); pintarPanel();
  }

  // Botones del control. La app de Android manda ☰ como window.alMenu() y Atrás como window.alAtras().
  window.alMenu = function () { if (panelAbierto) cerrarPanel(); else abrirPanel(); };
  window.alAtras = function () { if (panelAbierto) { cerrarPanel(); return true; } return false; };
  document.addEventListener('keydown', function (e) {
    var k = e.key, c = e.keyCode;
    if (k === 'ContextMenu' || c === 93 || c === 82) { e.preventDefault(); window.alMenu(); return; }
    if (!panelAbierto) return;
    e.preventDefault();
    if (k === 'ArrowUp' || c === 38) { filaActiva = (filaActiva + FILAS.length - 1) % FILAS.length; pintarPanel(); }
    else if (k === 'ArrowDown' || c === 40) { filaActiva = (filaActiva + 1) % FILAS.length; pintarPanel(); }
    else if (k === 'ArrowLeft' || c === 37) mover(-1);
    else if (k === 'ArrowRight' || c === 39) mover(1);
    else if (k === 'Escape' || k === 'Enter' || c === 27 || c === 13) cerrarPanel();
  });

  // ------------------------------------------------------------ Tamaño y giro
  // Con la orilla de abajo a la derecha, la imagen se gira 90° a la derecha.
  // En una pantalla que ya es vertical (vista previa) no se gira.
  function medida() {
    var de = document.documentElement;
    return { W: Math.round(de.clientWidth || window.innerWidth), H: Math.round(de.clientHeight || window.innerHeight) };
  }
  function acomodar() {
    var m = medida(), W = m.W, H = m.H, L = $('lienzo');
    var t = (typeof ajustes !== 'undefined' && ajustes.tamano ? ajustes.tamano : 94) / 100;
    var tr;
    if (W > H) {
      var e = Math.min(W / 1920, H / 1080) * t;
      tr = 'translate(' + (W / 2 + 960 * e) + 'px,' + (H / 2 - 540 * e) + 'px) rotate(90deg) scale(' + e + ')';
    } else {
      var s2 = Math.min(W / 1080, H / 1920) * t;
      tr = 'translate(' + ((W - 1080 * s2) / 2) + 'px,' + ((H - 1920 * s2) / 2) + 'px) scale(' + s2 + ')';
    }
    L.style.webkitTransform = tr; L.style.transform = tr;
  }
  window.addEventListener('load', acomodar);
  [300, 1000, 3000, 8000].forEach(function (ms) { setTimeout(acomodar, ms); });
  setInterval(acomodar, 60000);
  window.addEventListener('resize', acomodar);
  acomodar();

  // ------------------------------------------------------------ Datos reales
  // En la tele (window.Android existe) se usan datos reales; en una vista previa, los de ejemplo.
  var REAL = !!window.Android;
  var CONFIG = { ciudad: { nombre: 'La Magdalena Contreras', lat: 19.3075, lon: -99.2425 }, cuartoSonos: 'Diego', aparatos: [] };
  function leerJSON(nombre) {
    try { var t = window.Android && Android.leer(nombre); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function pedir(url, ms) {
    return new Promise(function (ok, falla) {
      var x = new XMLHttpRequest();
      x.open('GET', url, true); x.timeout = ms || 20000;
      x.onload = function () { if (x.status >= 200 && x.status < 300) ok(x.responseText); else falla(new Error('HTTP ' + x.status)); };
      x.onerror = x.ontimeout = function () { falla(new Error('red')); };
      x.send();
    });
  }
  // Descargas largas (calendarios) las hace la parte de Android, que no tiene límites del navegador.
  var descargas = {}, nDesc = 0;
  window.alDescarga = function (id, texto, error) {
    var f = descargas[id]; delete descargas[id];
    if (f) f(texto, error);
  };
  function descargar(url) {
    if (!(window.Android && Android.descargar)) return pedir(url.replace(/^webcal:/i, 'https:'), 30000);
    return new Promise(function (ok, falla) {
      var id = 'd' + (++nDesc);
      descargas[id] = function (t, e) {
        if (!t) { falla(new Error(e || 'vacío')); return; }
        if (t.indexOf('ok:') === 0) {
          var contenido = '';
          try { contenido = Android.leer('desc-' + id); } catch (er) {}
          if (contenido) ok(contenido); else falla(new Error('no se pudo leer'));
        } else ok(t);
      };
      setTimeout(function () { if (descargas[id]) { delete descargas[id]; falla(new Error('tiempo')); } }, 60000);
      Android.descargar(id, url);
    });
  }

  function haceCuanto(d) {
    var min = Math.round((Date.now() - d) / 60000);
    if (min < 1) return 'ahora';
    if (min < 60) return 'hace ' + min + ' min';
    var h = Math.round(min / 60);
    return h < 24 ? 'hace ' + h + ' h' : 'hace ' + Math.round(h / 24) + ' d';
  }

  var D = { actualizado: new Date(), aparatos: [] };

  // Clima (Open-Meteo, gratis y sin cuenta)
  var CLIMA = { 0: 'Despejado', 1: 'Casi despejado', 2: 'Parcialmente nublado', 3: 'Nublado', 45: 'Neblina', 48: 'Neblina' };
  function textoClima(c) {
    if (CLIMA[c]) return CLIMA[c];
    if (c >= 51 && c <= 57) return 'Llovizna';
    if (c >= 61 && c <= 67) return 'Lluvia';
    if (c >= 71 && c <= 77) return 'Nieve';
    if (c >= 80 && c <= 82) return 'Chubascos';
    if (c >= 95) return 'Tormenta';
    return '';
  }
  function iconoClima(c, dia) {
    if (c >= 95) return 'tormenta';
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'lluvia';
    if (c === 3 || c === 45 || c === 48) return 'nube';
    if (c === 2) return dia ? 'parcial' : 'nube';
    return dia ? 'sol' : 'luna';
  }
  function horaCorta(d) { var h = d.getHours(); return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? ' a. m.' : ' p. m.'); }
  function actualizarClima() {
    var c = CONFIG.ciudad;
    pedir('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2').then(function (t) {
      var r = JSON.parse(t), ahora = new Date(), horas = [];
      horas.push({ h: 'Ahora', i: iconoClima(r.current.weather_code, r.current.is_day), t: Math.round(r.current.temperature_2m) });
      for (var k = 0; k < r.hourly.time.length && horas.length < 6; k++) {
        var d = new Date(r.hourly.time[k]);
        if (d <= ahora || d.getHours() % 3 !== 0) continue;
        if (horas.length > 1 && (d - horas[horas.length - 1].d) < 3 * 3600000) continue;
        horas.push({ h: horaCorta(d), i: iconoClima(r.hourly.weather_code[k], r.hourly.is_day[k]), t: Math.round(r.hourly.temperature_2m[k]), d: d });
      }
      D.clima = { max: Math.round(r.daily.temperature_2m_max[0]), min: Math.round(r.daily.temperature_2m_min[0]), temp: Math.round(r.current.temperature_2m), texto: textoClima(r.current.weather_code), icono: iconoClima(r.current.weather_code, r.current.is_day), ciudad: c.nombre, horas: horas };
      repintar();
    }).catch(function () {});
  }

  // Tipo de cambio euro → peso (Frankfurter, datos del Banco Central Europeo, sin cuenta)
  function actualizarCambio() {
    pedir('https://api.frankfurter.app/latest?from=EUR&to=MXN').then(function (t) {
      var r = JSON.parse(t);
      if (r.rates && r.rates.MXN) { D.cambio = 'EUR 1 = MXN ' + r.rates.MXN.toFixed(2); repintar(); }
    }).catch(function () {});
  }

  // Calendarios de iCloud (links públicos, webcal:// → https://). Cada link trae su nombre;
  // el color sigue al de tu iPhone.
  var COLORES = { casa: '#5aa9e6', trabajo: '#d84fe8', ibero: '#ef4b4b', 'cumpleaños': '#f2cf45', europa: '#f3f3f1', 'los primos': '#f0913a' };
  function colorDe(nombre) {
    var n = (nombre || '').toLowerCase();
    for (var k in COLORES) if (n.indexOf(k) >= 0) return COLORES[k];
    return 'rgba(243,243,241,.5)';
  }
  function actualizarCalendario() {
    var links = CONFIG.calendarios || (CONFIG.calendario ? [CONFIG.calendario] : []);
    links = links.filter(Boolean).map(function (x) { return typeof x === 'string' ? { url: x } : x; });
    if (!links.length) return;
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    var pasado = new Date(hoy); pasado.setDate(hoy.getDate() + 2);
    var pendientes = links.length, todos = [], alguno = false, errores = [];
    links.forEach(function (link) {
      descargar(link.url).then(function (t) {
        var evs;
        try { evs = window.leerICS(t, hoy, pasado); } catch (er) { throw new Error('formato'); }
        alguno = true;
        if (link.nombre) evs.forEach(function (e) { e.calendario = link.nombre; });
        todos = todos.concat(evs);
      }).catch(function (e) { errores.push((link.nombre || 'calendario') + ': ' + e.message); }).then(function () {
        if (--pendientes > 0) return;
        if (!alguno) { D.errorCalendario = errores[0] || 'sin respuesta'; repintar(); return; }
        D.errorCalendario = '';
        todos.forEach(function (e) { e.color = colorDe(e.calendario); });
        todos.sort(function (a, b) { return (a.todoElDia ? 0 : 1) - (b.todoElDia ? 0 : 1) || a.ini - b.ini; });
        D.eventos = todos.filter(function (e) { return e.ini < manana && e.fin > hoy; });
        D.manana = todos.filter(function (e) { return e.ini >= manana && e.ini < pasado; });
        repintar();
      });
    });
  }

  // iPhone: el Atajo manda recordatorios, alarmas y batería al buzón de la tele
  // Formato: {"recordatorios": "Título | vence\n…", "alarmas": "7:00 a.m.\n…", "bateria": 82}
  function proximaAlarma(texto) {
    var ahora = new Date(), mejor = null;
    String(texto || '').split(/\n|,/).forEach(function (l) {
      var m = /(\d{1,2})[:.](\d{2})\s*([ap])?\.?\s*m?\.?/i.exec(l);
      if (!m) return;
      var h = +m[1], min = +m[2], ap = (m[3] || '').toLowerCase();
      if (ap === 'p' && h < 12) h += 12;
      if (ap === 'a' && h === 12) h = 0;
      var d = new Date(); d.setHours(h, min, 0, 0);
      if (d <= ahora) d.setDate(d.getDate() + 1);
      if (!mejor || d < mejor) mejor = d;
    });
    return mejor;
  }
  function leerIphone() {
    var j = leerJSON('iphone');
    if (!j) return;
    D.iphone = j;
    var lista = Array.isArray(j.recordatorios) ? j.recordatorios : String(j.recordatorios || '').split('\n');
    D.pendientes = lista.map(function (x) {
      if (typeof x === 'object') return x;
      var p = String(x).split('|');
      var vence = (p[1] || '').trim();
      return { titulo: p[0].trim(), vence: vence, urgente: /hoy|vencid|ayer/i.test(vence) };
    }).filter(function (x) { return x.titulo; });
    D.alarma = proximaAlarma(j.alarmas);
    D.iphoneVisto = new Date(j.enviado || Date.now());
    repintar();
  }

  // Resumen de Claude (lo deja una tarea automática)
  function leerClaude() {
    var j = leerJSON('claude');
    if (j && j.temas) { D.claude = { temas: j.temas, cuando: j.actualizado ? haceCuanto(new Date(j.actualizado)) : '' }; repintar(); }
  }

  // Sonos: qué suena en el cuarto, leído directo de la bocina
  var sonosPidiendo = false;
  window.alSonosInfo = function (t) {
    sonosPidiendo = false;
    var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
    D.sonosVisto = true;
    if (!j || !j.titulo) { D.musica = { cuarto: CONFIG.cuartoSonos, titulo: '' }; D.sonosEstado = j ? (j.estado || 'STOPPED') : ''; }
    else {
      D.sonosEstado = j.estado;
      D.musica = { cuarto: CONFIG.cuartoSonos, titulo: j.titulo, artista: j.artista, portada: j.portada,
        sonando: j.estado === 'PLAYING' || j.estado === 'TRANSITIONING', pos: j.pos || 0, dur: j.dur || 0, leido: Date.now() };
    }
    repintar();
  };
  function actualizarSonos() {
    if (sonosPidiendo || !(window.Android && Android.sonosInfo)) return;
    sonosPidiendo = true;
    setTimeout(function () { sonosPidiendo = false; }, 15000);
    Android.sonosInfo(CONFIG.cuartoSonos || 'Diego');
  }

  // Aparatos del cuarto
  var vivos = {};
  window.alPresencia = function (r) { for (var k in r) vivos[k] = r[k]; armarAparatos(); repintar(); };
  function actualizarPresencia() {
    var ips = (CONFIG.aparatos || []).map(function (a) { return a.ip; }).filter(Boolean);
    if (ips.length && window.Android && Android.presencia) Android.presencia(JSON.stringify(ips));
  }
  function armarAparatos() {
    var lista = [], ahora = Date.now();
    var lap = leerJSON('laptop');
    var lapOn = !!lap && ahora - new Date(lap.enviado || 0) < 12 * 60000;
    lista.push({ nombre: 'Laptop', icono: 'laptop', on: lapOn,
      estado: lapOn ? (lap.cargando ? 'Cargando' : 'Con batería') + (lap.bateria != null ? ' · ' + lap.bateria + ' %' : '') : 'Sin conexión' });
    var tele = leerJSON('tele');
    (CONFIG.aparatos || []).forEach(function (a) {
      var on = vivos[a.ip];
      var estado = on === undefined ? 'Revisando…' : on ? 'En línea' : 'Sin conexión';
      if (a.icono === 'tele' && on && tele && tele.obra) estado = tele.obra;
      lista.push({ nombre: a.nombre, icono: a.icono || 'tele', on: on !== false, estado: estado });
    });
    var sOn = D.sonosEstado !== '' && D.sonosEstado != null;
    lista.push({ nombre: 'Sonos ' + (CONFIG.cuartoSonos || 'Diego'), icono: 'bocina', on: sOn || !D.sonosVisto,
      estado: !D.sonosVisto ? 'Buscando…' : !sOn ? 'Sin conexión' : D.sonosEstado === 'PLAYING' ? 'Sonando' : 'En pausa' });
    if (D.iphone) {
      var iOn = ahora - D.iphoneVisto < 3 * 3600000;
      var b = D.iphone.bateria != null ? Math.round(+D.iphone.bateria > 1 ? +D.iphone.bateria : +D.iphone.bateria * 100) + ' % · ' : '';
      lista.push({ nombre: 'iPhone', icono: 'telefono', on: iOn, estado: b + haceCuanto(D.iphoneVisto) });
    }
    D.aparatos = lista.slice(0, 6);
  }

  var repintarPendiente = false;
  function repintar() {
    if (repintarPendiente) return;
    repintarPendiente = true;
    setTimeout(function () { repintarPendiente = false; D.actualizado = new Date(); armarAparatos(); pintar(D); }, 50);
  }

  // Cuando llega algo al buzón (iPhone, laptop, Sharp o Claude), se vuelve a leer al momento
  window.alDatos = function (nombre) {
    if (nombre === 'iphone') leerIphone();
    else if (nombre === 'claude') leerClaude();
    else repintar();
  };

  function arrancar() {
    var cfg = leerJSON('config');
    if (cfg) for (var k in cfg) CONFIG[k] = cfg[k];
    function fechaISO(t) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
    var vuelo = fechaISO(CONFIG.madrid) || new Date(2027, 0, 7);
    var clases = fechaISO(CONFIG.clases) || new Date(2027, 0, 14);
    D.cuenta = { titulo: 'Madrid', fecha: vuelo, nota: 'Vuelo · 7 de enero', clases: clases };
    leerIphone(); leerClaude();
    actualizarClima(); setInterval(actualizarClima, 20 * 60000);
    actualizarCambio(); setInterval(actualizarCambio, 6 * 3600000);
    actualizarCalendario(); setInterval(actualizarCalendario, 10 * 60000);
    actualizarSonos(); setInterval(actualizarSonos, 5000);
    actualizarPresencia(); setInterval(actualizarPresencia, 60000);
    setInterval(function () { leerIphone(); repintar(); }, 60000);
    repintar();
  }

  aplicarAjustes();
  if (REAL) arrancar();
  else { pintar(EJEMPLO); setInterval(function () { pintar(EJEMPLO); }, 20000); }
  window.centroEjemplo = EJEMPLO;
})();
