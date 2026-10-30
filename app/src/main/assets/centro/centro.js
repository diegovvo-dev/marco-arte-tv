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
    clima: { temp: 17, texto: 'Casi despejado', icono: 'luna', ciudad: 'Ciudad de México',
      horas: [{ h: 'Ahora', i: 'luna', t: 17 }, { h: '3 a. m.', i: 'luna', t: 15 }, { h: '6 a. m.', i: 'nube', t: 13 },
              { h: '9 a. m.', i: 'parcial', t: 17 }, { h: '12 p. m.', i: 'sol', t: 23 }, { h: '3 p. m.', i: 'sol', t: 25 }] },
    alarma: enDias(1, 7, 0),
    cuenta: { titulo: 'Madrid', fecha: new Date(2027, 0, 11), nota: 'Comillas · ICADE' },
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
    musica: { titulo: 'Vagabundo', artista: 'Sebastián Yatra, Manuel Turizo, Beéle', avance: 0.38, sonando: true, portada: '' },
    aparatos: [
      { nombre: 'Laptop', icono: 'laptop', on: true, estado: 'Cargando · 66 %' },
      { nombre: 'Xbox', icono: 'consola', on: false, estado: 'Apagado' },
      { nombre: 'Marco Arte', icono: 'tele', on: true, estado: 'Las bodas de Caná' },
      { nombre: 'Sonos Diego', icono: 'bocina', on: true, estado: 'Sonando' },
      { nombre: 'iPhone', icono: 'telefono', on: true, estado: 'En casa · 82 %' },
      { nombre: 'iPad', icono: 'tablet', on: false, estado: 'Fuera del Wi‑Fi' }
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

  // ------------------------------------------------------------ Hora de vidrio líquido
  // Igual que en la Sharp: una máscara con la forma de los números deja ver el fondo
  // desenfocado, con sombra debajo y un borde de luz. LIQUIDO va de 0 (blanco) a 100 (vidrio claro).
  var LIQUIDO = 70;
  var horaDibujada = '';
  var medidor = document.createElement('canvas');
  function dibujarHora(txt, forzar) {
    if (!forzar && txt === horaDibujada) return;
    horaDibujada = txt;
    var g = LIQUIDO / 100, fs = 200, dpr = 2;
    var fuente = '600 ' + fs + 'px InterVar, "Helvetica Neue", Arial, sans-serif';
    var m = medidor.getContext('2d'); m.font = fuente;
    var espacio = -0.025 * fs, letras = txt.split('');
    var anchos = letras.map(function (c) { return m.measureText(c).width; });
    var total = anchos.reduce(function (a, b) { return a + b; }, 0) + espacio * (letras.length - 1);
    var pad = Math.round(fs * 0.14), alto = Math.round(fs * 0.74);
    var W = Math.ceil(total + pad * 2), H = alto + pad * 2, base = pad + alto;
    function preparar(c) {
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
      var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      x.font = fuente; x.textBaseline = 'alphabetic'; return x;
    }
    function escribir(x, dx, dy) {
      var px = pad;
      for (var i = 0; i < letras.length; i++) { x.fillText(letras[i], px + (dx || 0), base + (dy || 0)); px += anchos[i] + espacio; }
    }
    var mascara = document.createElement('canvas'), xm = preparar(mascara);
    xm.fillStyle = '#fff'; escribir(xm);
    var url = 'url(' + mascara.toDataURL('image/png') + ')';
    var v = $('hora-vidrio');
    v.style.width = W + 'px'; v.style.height = H + 'px';
    v.style.webkitMaskImage = url; v.style.maskImage = url;
    var r = $('hora');
    r.style.setProperty('--blur', (26 - 10 * g).toFixed(1) + 'px');
    r.style.setProperty('--brillo', (1.38 - 0.24 * g).toFixed(2));
    r.style.setProperty('--tinte', (0.03 + 0.2 * (1 - g)).toFixed(3));
    var xs = preparar($('hora-sombra'));
    // Las sombras del canvas no se escalan con setTransform: van en pixeles reales.
    xs.shadowColor = 'rgba(0,0,0,' + (0.22 + 0.2 * g).toFixed(2) + ')'; xs.shadowBlur = fs * 0.09 * dpr; xs.shadowOffsetY = fs * 0.02 * dpr;
    xs.shadowOffsetX = 10000 * dpr; xs.fillStyle = '#000'; escribir(xs, -10000, 0);
    var xt = preparar($('hora-texto'));
    xt.fillStyle = 'rgba(255,255,255,' + (1 - g).toFixed(3) + ')'; escribir(xt);
    var aBorde = 0.2 + 0.8 * g, grosor = Math.max(1, fs * (0.007 + 0.007 * g));
    function filo(dx, dy, alfa) {
      var c = document.createElement('canvas'), x = preparar(c);
      x.fillStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')'; escribir(x);
      x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; escribir(x, dx, dy);
      xt.drawImage(c, 0, 0, W, H);
    }
    filo(0, grosor, aBorde); filo(0, -grosor, aBorde * 0.55); filo(grosor, 0, aBorde * 0.4); filo(-grosor, 0, aBorde * 0.4);
  }
  if (document.fonts && document.fonts.load) document.fonts.load('600 100px InterVar').then(function () { dibujarHora(horaDibujada || hora12(new Date(), false), true); }, function () {});


  // ------------------------------------------------------------ Pintar
  function pintar(D) {
    var ahora = new Date();
    $('fecha').textContent = DIAS[ahora.getDay()] + ', ' + ahora.getDate() + ' de ' + MESES[ahora.getMonth()];
    dibujarHora(hora12(ahora, false), false);

    var c = D.clima;
    $('clima-icono').innerHTML = I[c.icono] || '';
    $('clima-temp').textContent = c.temp + '°';
    $('clima-texto').textContent = c.texto + ' · ' + c.ciudad;
    $('horas').innerHTML = c.horas.map(function (x) { return '<li>' + esc(x.h) + icono(x.i) + '<b>' + x.t + '°</b></li>'; }).join('');

    if (D.alarma) {
      $('alarma-hora').textContent = hora12(D.alarma, true);
      var dia = D.alarma.toDateString() === ahora.toDateString() ? 'Hoy' : 'Mañana';
      $('alarma-falta').textContent = dia + ' · ' + falta(D.alarma - ahora);
    }

    $('cuenta-titulo').textContent = D.cuenta.titulo;
    $('cuenta-dias').textContent = Math.max(0, Math.ceil((D.cuenta.fecha - ahora) / 86400000));
    $('cuenta-nota').textContent = D.cuenta.nota;

    // Hoy: lo que sigue (máximo 3); si ya pasó casi todo, se completa con lo último que pasó.
    var siguen = D.eventos.filter(function (e) { return e.fin >= ahora; });
    var pasaron = D.eventos.filter(function (e) { return e.fin < ahora; });
    var visibles = pasaron.slice(Math.max(0, pasaron.length - Math.max(0, 3 - siguen.length))).concat(siguen).slice(0, 3);
    $('eventos').innerHTML = visibles.map(function (e) {
      var clase = e.fin < ahora ? 'pasado' : (e.ini <= ahora ? 'ahora' : '');
      var pil = clase === 'ahora' ? '<span class="pildora">Ahora</span>' : '';
      return '<li class="' + clase + '"><span class="cuando">' + hora12(e.ini, false) + '</span>' +
        '<span class="que">' + esc(e.titulo) + pil + '<small>' + hora12(e.ini, false) + ' – ' + hora12(e.fin, true) + (e.lugar ? ' · ' + esc(e.lugar) : '') + '</small></span></li>';
    }).join('');
    $('hoy-resumen').textContent = siguen.length ? (siguen.length === 1 ? '1 por delante' : siguen.length + ' por delante') : 'Nada más hoy';
    $('eventos-manana').innerHTML = D.manana.slice(0, 2).map(function (e) {
      return '<li><span class="cuando">Mañana ' + hora12(e.ini, false) + '</span><span class="que">' + esc(e.titulo) + '</span></li>';
    }).join('');

    $('pendientes').innerHTML = D.pendientes.slice(0, 3).map(function (p) {
      return '<li><span class="punto-lista' + (p.urgente ? ' urgente' : '') + '"></span><span class="que">' + esc(p.titulo) +
        (p.vence ? '<span class="vence' + (p.urgente ? ' urgente' : '') + '">' + esc(p.vence) + '</span>' : '') + '</span></li>';
    }).join('');
    $('pend-resumen').textContent = D.pendientes.length + ' en total';

    $('claude-cuando').textContent = D.claude.cuando;
    $('claude').innerHTML = D.claude.temas.slice(0, 3).map(function (t) {
      return '<li>' + esc(t.titulo) + '<small>' + esc(t.nota) + '</small></li>';
    }).join('');

    var m = D.musica;
    $('m-titulo').textContent = m.titulo;
    $('m-artista').textContent = m.artista;
    $('m-avance').style.width = Math.round(m.avance * 100) + '%';
    if (m.portada) $('m-portada').src = m.portada;
    $('m-portada').style.visibility = m.portada ? 'visible' : 'hidden';

    $('aparatos').innerHTML = D.aparatos.map(function (a) {
      return '<li class="' + (a.on ? 'on' : 'off') + '">' + icono(a.icono) +
        '<div><div class="nombre">' + esc(a.nombre) + '</div><div class="estado"><span class="punto"></span><span class="texto">' + esc(a.estado) + '</span></div></div></li>';
    }).join('');

    $('pie-cambio').textContent = D.cambio;
    $('pie-actualizado').textContent = 'Actualizado ' + hora12(D.actualizado, true);
  }

  // ------------------------------------------------------------ Modo noche (botón OK)
  // Negro total, misma información, todo atenuado y en tonos cálidos. ▲ ▼ ajustan qué tan tenue.
  var estado = { noche: false, atenuar: 45 };
  try { var g = JSON.parse(localStorage.getItem('centro.estado') || '{}'); if (typeof g.noche === 'boolean') estado.noche = g.noche; if (g.atenuar != null) estado.atenuar = g.atenuar; } catch (e) {}
  function guardar() { try { localStorage.setItem('centro.estado', JSON.stringify(estado)); } catch (e) {} }
  var avisoT = null;
  function avisar(t) {
    var a = $('aviso'); a.textContent = t; a.className = 'visible';
    clearTimeout(avisoT); avisoT = setTimeout(function () { a.className = ''; }, 2200);
  }
  function aplicarNoche() {
    $('lienzo').className = estado.noche ? 'noche' : '';
    $('lienzo').style.setProperty('--atenuar', (estado.atenuar / 100).toFixed(2));
    LIQUIDO = estado.noche ? 30 : 70;
    dibujarHora(horaDibujada || hora12(new Date(), false), true);
  }
  window.alternarNoche = function () { estado.noche = !estado.noche; guardar(); aplicarNoche(); avisar(estado.noche ? 'Modo noche' : 'Modo día'); };
  document.addEventListener('keydown', function (e) {
    var k = e.key, c = e.keyCode;
    if (k === 'Enter' || c === 13 || c === 23) { e.preventDefault(); if (!e.repeat) window.alternarNoche(); }
    else if (estado.noche && (k === 'ArrowUp' || c === 38 || k === 'ArrowDown' || c === 40)) {
      e.preventDefault();
      estado.atenuar = Math.max(0, Math.min(85, estado.atenuar + ((k === 'ArrowUp' || c === 38) ? -10 : 10)));
      guardar(); aplicarNoche(); avisar('Brillo ' + (100 - estado.atenuar) + ' %');
    }
  });

  // ------------------------------------------------------------ Tamaño y giro
  // Con la orilla de abajo a la derecha, la imagen se gira 90° a la derecha.
  // En una pantalla que ya es vertical (vista previa) no se gira.
  function acomodar() {
    var W = window.innerWidth, H = window.innerHeight, L = $('lienzo');
    if (W > H) {
      var e = Math.min(W / 1920, H / 1080);
      L.style.transform = L.style.webkitTransform = 'translate(' + (W / 2 + 960 * e) + 'px,' + (H / 2 - 540 * e) + 'px) rotate(90deg) scale(' + e + ')';
    } else {
      var s = Math.min(W / 1080, H / 1920);
      L.style.transform = L.style.webkitTransform = 'translate(' + ((W - 1080 * s) / 2) + 'px,' + ((H - 1920 * s) / 2) + 'px) scale(' + s + ')';
    }
  }
  window.addEventListener('resize', acomodar);
  acomodar();

  window.centroEjemplo = EJEMPLO;
  aplicarNoche();
  pintar(DATOS);
  setInterval(function () { pintar(DATOS); }, 20000);
})();
