/* Centro de control del cuarto — pantalla vertical.
   Esta primera versión pinta el diseño con datos de ejemplo; las fuentes reales
   (iCloud, Atajos del iPhone, Claude, aparatos) se conectan después. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }

  // ------------------------------------------------------------ Íconos
  var I = {
    sol: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="6.5" fill="#f2b663"/><g stroke="#f2b663" stroke-width="2.4" stroke-linecap="round"><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/></g></svg>',
    luna: '<svg viewBox="0 0 32 32"><path d="M20.5 4.5a11.5 11.5 0 1 0 7 19.6A10 10 0 0 1 20.5 4.5z" fill="#cfd8ff"/></svg>',
    nube: '<svg viewBox="0 0 32 32"><path d="M9.5 25h14a5.5 5.5 0 0 0 .7-10.96A8 8 0 0 0 8.9 15.1 5 5 0 0 0 9.5 25z" fill="#dfe5f5"/></svg>',
    parcial: '<svg viewBox="0 0 32 32"><circle cx="11" cy="11" r="5.5" fill="#f2b663"/><path d="M12.5 26h12a4.8 4.8 0 0 0 .6-9.56 7 7 0 0 0-13.2 1.04A4.3 4.3 0 0 0 12.5 26z" fill="#dfe5f5"/></svg>',
    lluvia: '<svg viewBox="0 0 32 32"><path d="M9.5 20h14a5.5 5.5 0 0 0 .7-10.96A8 8 0 0 0 8.9 10.1 5 5 0 0 0 9.5 20z" fill="#c9d2ea"/><g stroke="#8fb8ff" stroke-width="2.4" stroke-linecap="round"><path d="M11 23l-1.5 4M17 23l-1.5 4M23 23l-1.5 4"/></g></svg>',
    tormenta: '<svg viewBox="0 0 32 32"><path d="M9.5 19h14a5.5 5.5 0 0 0 .7-10.96A8 8 0 0 0 8.9 9.1 5 5 0 0 0 9.5 19z" fill="#aeb8d6"/><path d="M17 19l-4 6h4l-2 5 6-8h-4l2-3z" fill="#f2b663"/></svg>',
    alarma: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="16" cy="17.5" r="10"/><path d="M16 12v6l3.5 2.5M5 6.5l4-3M27 6.5l-4-3"/></svg>',
    avion: '<svg viewBox="0 0 32 32"><path d="M29 14.5c0-1.2-1-2-2.2-2H20L13 3h-3l3.6 9.5H7.4L5 9.5H3l1.6 6.5L3 22.5h2l2.4-3h6.2L10 29h3l7-9.5h6.8c1.2 0 2.2-.8 2.2-2z" fill="currentColor" transform="rotate(-45 16 16)"/></svg>',
    calendario: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="4.5" y="6.5" width="23" height="21" rx="4"/><path d="M4.5 13h23M10.5 3.5v6M21.5 3.5v6"/></svg>',
    check: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="12"/><path d="M10.5 16.5l3.8 3.8 7.4-8"/></svg>',
    chispa: '<svg viewBox="0 0 32 32"><path d="M16 3c.9 6.6 3.4 10.9 13 13-9.6 2.1-12.1 6.4-13 13-.9-6.6-3.4-10.9-13-13 9.6-2.1 12.1-6.4 13-13z" fill="#e9895f"/></svg>',
    casa: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4.5 14.5L16 5l11.5 9.5V27a1 1 0 0 1-1 1h-6.5v-8h-8v8H5.5a1 1 0 0 1-1-1z"/></svg>',
    laptop: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="6" y="7" width="20" height="13.5" rx="2"/><path d="M3 24.5h26"/></svg>',
    consola: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h14a6 6 0 0 1 5.8 7.5l-1.2 4.8a3 3 0 0 1-5.1 1.3L19.6 21h-7.2l-2.9 2.6a3 3 0 0 1-5.1-1.3l-1.2-4.8A6 6 0 0 1 9 10z"/><path d="M10.5 14v4M8.5 16h4"/><circle cx="21.5" cy="15" r=".8" fill="currentColor"/><circle cx="23.5" cy="17.5" r=".8" fill="currentColor"/></svg>',
    tele: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3.5" y="6" width="25" height="16.5" rx="2"/><path d="M11 27h10"/></svg>',
    tablet: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6.5" y="3.5" width="19" height="25" rx="3"/><circle cx="16" cy="24.5" r=".9" fill="currentColor"/></svg>',
    bocina: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="8.5" y="3.5" width="15" height="25" rx="3"/><circle cx="16" cy="18.5" r="5"/><circle cx="16" cy="9" r="1.4" fill="currentColor"/></svg>',
    telefono: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="3.5" width="14" height="25" rx="3.5"/><path d="M14 7h4"/></svg>'
  };
  function icono(nombre) { return '<span class="icono">' + (I[nombre] || '') + '</span>'; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-i]'), function (el) { el.innerHTML = I[el.getAttribute('data-i')] || ''; });

  // ------------------------------------------------------------ Datos de ejemplo
  function hoyA(h, m) { var d = new Date(); d.setHours(h, m || 0, 0, 0); return d; }
  function enDias(n, h, m) { var d = hoyA(h, m); d.setDate(d.getDate() + n); return d; }
  var EJEMPLO = {
    clima: { temp: 17, texto: 'Casi despejado', icono: 'luna', ciudad: 'Ciudad de México',
      horas: [{ h: 'Ahora', i: 'luna', t: 17 }, { h: '1 a. m.', i: 'luna', t: 16 }, { h: '3 a. m.', i: 'nube', t: 15 },
              { h: '6 a. m.', i: 'nube', t: 13 }, { h: '9 a. m.', i: 'parcial', t: 17 }, { h: '12 p. m.', i: 'sol', t: 23 }] },
    alarma: enDias(1, 7, 0),
    cuenta: { titulo: 'Madrid', fecha: new Date(2027, 0, 11), nota: 'Comillas · ICADE' },
    eventos: [
      { ini: hoyA(9, 0), fin: hoyA(10, 30), titulo: 'Taller de Algoritmos y Programación', lugar: 'IBERO', color: '#8fb8ff' },
      { ini: hoyA(13, 0), fin: hoyA(14, 0), titulo: 'Comida con distribuidor', lugar: 'Polanco', color: '#f2b663' },
      { ini: hoyA(19, 0), fin: hoyA(20, 0), titulo: 'Junta Los Primos', lugar: 'Videollamada', color: '#ff8a72' },
      { ini: hoyA(23, 30), fin: enDias(1, 0, 30), titulo: 'Terminar app de la tele', lugar: 'Cuarto', color: '#7fe0c0' }
    ],
    manana: [
      { ini: enDias(1, 8, 0), titulo: 'Negocios Globales', color: '#8fb8ff' },
      { ini: enDias(1, 17, 0), titulo: 'Entrega de muestras a restaurante', color: '#f2b663' }
    ],
    pendientes: [
      { titulo: 'Agendar cita de visa en BLS', vence: 'Hoy', urgente: true },
      { titulo: 'Mandar cotización a Mesa de Noche', vence: 'Mañana 10:00' },
      { titulo: 'Subir ejercicio de Colab', vence: 'Viernes' },
      { titulo: 'Comprar cable USB‑C a HDMI', vence: '' }
    ],
    claude: { cuando: 'hace 12 min', temas: [
      { titulo: 'App Marco Arte para la tele', nota: 'Control de Sonos, obra fija y centro de control vertical' },
      { titulo: 'Venta a restaurantes CDMX', nota: 'Guion de primer contacto y seguimiento' },
      { titulo: 'Intercambio en Madrid', nota: 'Seguro médico listo; sigue la cita de visa' }
    ] },
    musica: { titulo: 'Vagabundo', artista: 'Sebastián Yatra, Manuel Turizo, Beéle', avance: 0.38, sonando: true, portada: '' },
    aparatos: [
      { nombre: 'Laptop', icono: 'laptop', on: true, estado: 'Cargando', bateria: 66 },
      { nombre: 'Xbox', icono: 'consola', on: false, estado: 'Apagado' },
      { nombre: 'Sharp · Marco Arte', icono: 'tele', on: true, estado: 'Las bodas de Caná' },
      { nombre: 'Sonos Diego', icono: 'bocina', on: true, estado: 'Sonando' },
      { nombre: 'iPhone', icono: 'telefono', on: true, estado: 'En casa · 82 %' },
      { nombre: 'iPad', icono: 'tablet', on: false, estado: 'Fuera del Wi‑Fi' }
    ],
    cambio: 'EUR 1 = MXN 21.48',
    actualizado: new Date()
  };

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

  // ------------------------------------------------------------ Pintar
  function pintar(D) {
    var ahora = new Date();
    $('fecha').textContent = DIAS[ahora.getDay()] + ', ' + ahora.getDate() + ' de ' + MESES[ahora.getMonth()];
    dibujarHora(hora12(ahora, false), false);

    var c = D.clima;
    $('clima-icono').innerHTML = I[c.icono] || '';
    $('clima-temp').textContent = c.temp + '°';
    $('clima-texto').textContent = c.texto + ' · ' + c.ciudad;
    $('horas').innerHTML = c.horas.map(function (x) {
      return '<li>' + esc(x.h) + icono(x.i) + '<b>' + x.t + '°</b></li>';
    }).join('');

    if (D.alarma) {
      $('alarma-hora').textContent = hora12(D.alarma, true);
      var dia = D.alarma.toDateString() === ahora.toDateString() ? 'Hoy' : 'Mañana';
      $('alarma-falta').textContent = dia + ' · ' + falta(D.alarma - ahora);
    }

    var dias = Math.ceil((D.cuenta.fecha - ahora) / 86400000);
    $('cuenta-titulo').textContent = D.cuenta.titulo;
    $('cuenta-dias').textContent = dias;
    $('cuenta-nota').textContent = D.cuenta.nota;

    // Hoy: lo que sigue (máximo 3); si ya pasó casi todo, se completa con lo último que pasó.
    var siguen = D.eventos.filter(function (e) { return e.fin >= ahora; });
    var pasaron = D.eventos.filter(function (e) { return e.fin < ahora; });
    var visibles = pasaron.slice(Math.max(0, pasaron.length - Math.max(0, 3 - siguen.length))).concat(siguen).slice(0, 3);
    var pendientesHoy = 0;
    $('eventos').innerHTML = visibles.map(function (e) {
      var clase = e.fin < ahora ? 'pasado' : (e.ini <= ahora && e.fin > ahora ? 'ahora' : '');

      var pil = clase === 'ahora' ? '<span class="pildora ahora">Ahora</span>' : '';
      return '<li class="' + clase + '"><span class="barra" style="background:' + e.color + '"></span>' +
        '<span class="cuando">' + hora12(e.ini, false) + '<br><small>' + hora12(e.fin, false) + '</small></span>' +
        '<span class="que">' + esc(e.titulo) + pil + '<small>' + esc(e.lugar || '') + '</small></span></li>';
    }).join('');
    pendientesHoy = siguen.length;
    $('hoy-resumen').textContent = pendientesHoy ? (pendientesHoy === 1 ? '1 por delante' : pendientesHoy + ' por delante') : 'Nada más hoy';
    $('eventos-manana').innerHTML = D.manana.slice(0, 2).map(function (e) {
      return '<li><span class="barra" style="background:' + e.color + '"></span><span class="cuando">Mañana ' + hora12(e.ini, false) + '</span><span class="que">' + esc(e.titulo) + '</span></li>';
    }).join('');

    $('pendientes').innerHTML = D.pendientes.slice(0, 3).map(function (p) {
      var pil = p.vence ? '<small' + (p.urgente ? ' style="color:var(--coral)"' : '') + '>' + esc(p.vence) + '</small>' : '';
      return '<li><span class="circulo' + (p.urgente ? ' urgente' : '') + '"></span><span class="que">' + esc(p.titulo) + pil + '</span></li>';
    }).join('');
    $('pend-resumen').textContent = D.pendientes.length + ' en total';

    $('claude-cuando').textContent = D.claude.cuando;
    $('claude').innerHTML = D.claude.temas.slice(0, 2).map(function (t) {
      return '<li><span class="marca"></span><span class="que"><b>' + esc(t.titulo) + '</b><small>' + esc(t.nota) + '</small></span></li>';
    }).join('');

    var m = D.musica;
    $('t-musica').className = 'tarjeta' + (m.sonando ? '' : ' pausa');
    $('m-titulo').textContent = m.titulo;
    $('m-artista').textContent = m.artista;
    $('m-avance').style.width = Math.round(m.avance * 100) + '%';
    if (m.portada) $('m-portada').src = m.portada;
    $('m-portada').style.visibility = m.portada ? 'visible' : 'hidden';

    $('aparatos').innerHTML = D.aparatos.map(function (a) {
      var bat = a.bateria != null ? ' <span class="bateria"><i style="width:' + a.bateria + '%"></i></span> ' + a.bateria + ' %' : '';
      return '<li class="' + (a.on ? 'on' : 'off') + '">' + icono(a.icono) +
        '<div><div class="nombre">' + esc(a.nombre) + '</div><div class="estado"><span class="punto"></span><span class="texto">' + esc(a.estado) + '</span>' + bat + '</div></div></li>';
    }).join('');

    $('pie-cambio').textContent = D.cambio;
    $('pie-actualizado').textContent = 'Actualizado ' + hora12(D.actualizado, true);
  }

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

  // ------------------------------------------------------------ Fondo: obras y fotos
  var capaFondo = 'a';
  window.centroFondo = function (url) {
    var sig = capaFondo === 'a' ? 'b' : 'a';
    var img = new Image();
    img.onload = function () {
      var el = $('fondo-' + sig);
      el.style.backgroundImage = 'url("' + url + '")';
      el.className = 'capa visible';
      $('fondo-' + capaFondo).className = 'capa';
      capaFondo = sig;
    };
    img.src = url;
  };

  // ------------------------------------------------------------ Tamaño y giro
  // La Atvio está parada con su orilla de abajo a la derecha: la imagen se gira 90° a la derecha.
  // En una pantalla que ya es vertical (vista previa) no se gira.
  function acomodar() {
    var W = window.innerWidth, H = window.innerHeight, L = $('lienzo');
    if (W > H) {
      var e = Math.min(W / 1920, H / 1080);
      L.style.transform = L.style.webkitTransform = 'translate(' + ((W + 1920 * e) / 2) + 'px,' + ((H - 1080 * e) / 2) + 'px) rotate(90deg) scale(' + e + ')';
    } else {
      var s = Math.min(W / 1080, H / 1920);
      L.style.transform = L.style.webkitTransform = 'translate(' + ((W - 1080 * s) / 2) + 'px,' + ((H - 1920 * s) / 2) + 'px) scale(' + s + ')';
    }
  }
  window.addEventListener('resize', acomodar);
  acomodar();

  window.centroEjemplo = EJEMPLO;
  pintar(EJEMPLO);
  setInterval(function () { pintar(EJEMPLO); }, 20000);
})();
