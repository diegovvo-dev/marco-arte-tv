/* Marco Arte: pinturas de dominio público, hora y clima para el Fire TV.
   Obras: API abierta del Art Institute of Chicago (sin cuenta ni llave).
   Clima: Open-Meteo (sin cuenta ni llave). */
(function () {
  'use strict';

  // ---------------------------------------------------------------- Opciones
  // Obras favoritas de Diego. La imagen se pide a Wikipedia desde la tele;
  // si no responde, se usan los archivos de Wikimedia Commons de respaldo.
  var COMMONS = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  var FAVORITAS = [
    { id: 'fav-cana', favorita: true, title: 'Las bodas de Caná', artist_title: 'Paolo Veronese', date_display: '1562–1563',
      medium_display: 'Óleo sobre lienzo · 6.77 × 9.94 m', credito: 'Museo del Louvre, París · Sala 711, frente a la Mona Lisa',
      wiki: 'The_Wedding_at_Cana_(Veronese)',
      respaldo: [COMMONS + encodeURIComponent('Paolo Veronese 008.jpg') + '?width=1920'] },
    { id: 'fav-atenas', favorita: true, title: 'La escuela de Atenas', artist_title: 'Rafael Sanzio', date_display: '1509–1511',
      medium_display: 'Fresco · Platón, Aristóteles, Sócrates y otros filósofos griegos', credito: 'Museos Vaticanos · Estancias de Rafael',
      wiki: 'The_School_of_Athens',
      respaldo: [COMMONS + encodeURIComponent('"The School of Athens" by Raffaello Sanzio da Urbino.jpg') + '?width=1920',
                 COMMONS + encodeURIComponent('Sanzio 01.jpg') + '?width=1920'] }
  ];

  // Fotos propias: el instalador las copia de la carpeta marco-arte\fotos de la compu.
  // El nombre del archivo es el título ("Los Primos - Ferrari.jpg").
  var FOTOS = [];
  function cargarFotos() {
    var lista = [];
    try { lista = JSON.parse((window.Android && Android.fotos()) || '[]'); } catch (e) { lista = []; }
    FOTOS = lista.map(function (par) {
      var i = par.indexOf('|');
      var nombre = par.slice(0, i).replace(/\.[^.]+$/, '').replace(/_/g, ' ');
      var marca = /^los primos\s*[-–·]\s*/i.test(nombre);
      return { id: 'foto-' + nombre, foto: true, src: par.slice(i + 1),
        title: marca ? nombre.replace(/^los primos\s*[-–·]\s*/i, '') : nombre,
        artist_title: marca ? 'Mezcal Los Primos' : 'Mis fotos', credito: marca ? 'Mis fotos' : '' };
    });
  }
  cargarFotos();

  var COLECCIONES = [
    { id: 'favoritas', nombre: 'Mis favoritas', favoritas: true },
    { id: 'fotos', nombre: 'Mis fotos', fotos: true },
    { id: 'impresionismo', nombre: 'Impresionismo', q: 'impressionism', pintura: true },
    { id: 'postimpresionismo', nombre: 'Van Gogh y postimpresionismo', q: 'post-impressionism', pintura: true },
    { id: 'monet', nombre: 'Monet', q: 'Claude Monet', pintura: true },
    { id: 'paisajes', nombre: 'Paisajes', q: 'landscape', pintura: true },
    { id: 'retratos', nombre: 'Retratos', q: 'portrait', pintura: true },
    { id: 'bodegones', nombre: 'Bodegones', q: 'still life', pintura: true },
    { id: 'japones', nombre: 'Grabado japonés', q: 'ukiyo-e', pintura: false },
    { id: 'mezcla', nombre: 'Todo mezclado', q: '', pintura: true }
  ];

  var CIUDADES = [
    { nombre: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
    { nombre: 'Madrid', lat: 40.4168, lon: -3.7038 },
    { nombre: 'Guadalajara', lat: 20.6597, lon: -103.3496 },
    { nombre: 'Monterrey', lat: 25.6866, lon: -100.3161 },
    { nombre: 'Puebla', lat: 19.0414, lon: -98.2063 },
    { nombre: 'Querétaro', lat: 20.5888, lon: -100.3899 },
    { nombre: 'Oaxaca', lat: 17.0732, lon: -96.7266 },
    { nombre: 'Mérida', lat: 20.9674, lon: -89.5926 },
    { nombre: 'Cancún', lat: 21.1619, lon: -86.8515 }
  ];

  var FILAS = [
    { clave: 'coleccion', etiqueta: 'Colección', opciones: COLECCIONES.map(function (c) { return { v: c.id, t: c.nombre }; }) },
    { clave: 'intervalo', etiqueta: 'Cambiar obra cada', opciones: [
      { v: 1, t: '1 minuto' }, { v: 5, t: '5 minutos' }, { v: 15, t: '15 minutos' }, { v: 30, t: '30 minutos' },
      { v: 60, t: '1 hora' }, { v: 180, t: '3 horas' }, { v: 1440, t: '1 día' }, { v: 0, t: 'Nunca (dejarla fija)' }] },
    { clave: 'ciudad', etiqueta: 'Clima de', opciones: CIUDADES.map(function (c, i) { return { v: i, t: c.nombre }; }) },
    { clave: 'estilo', etiqueta: 'Estilo', opciones: [{ v: 'vidrio', t: 'Pantalla completa' }, { v: 'galeria', t: 'Galería' }] },
    { clave: 'liquido', etiqueta: 'Vidrio líquido', barra: true, opciones: [0,10,20,30,40,50,60,70,80,90,100].map(function (n) { return { v: n, t: n + ' %' }; }) },
    { clave: 'posReloj', etiqueta: 'Lugar de la hora', opciones: [{ v: 'arriba', t: 'Arriba, como el iPhone' }, { v: 'centro', t: 'Centro de la pantalla' }] },
    { clave: 'ajuste', etiqueta: 'La obra', opciones: [{ v: 'llenar', t: 'Llenar la pantalla' }, { v: 'completa', t: 'Verla entera' }] },
    { clave: 'formato24', etiqueta: 'Hora', opciones: [{ v: false, t: '12 h (a. m. / p. m.)' }, { v: true, t: '24 h' }] },
    { clave: 'misFotos', etiqueta: 'Mis fotos de vez en cuando', opciones: [{ v: true, t: 'Sí' }, { v: false, t: 'No' }] },
    { clave: 'mezclarFavoritas', etiqueta: 'Mis favoritas de vez en cuando', opciones: [{ v: true, t: 'Sí' }, { v: false, t: 'No' }] },
    { clave: 'horizontales', etiqueta: 'Solo obras horizontales', opciones: [{ v: true, t: 'Sí' }, { v: false, t: 'No' }] },
    { clave: 'brillo', etiqueta: 'Brillo', barra: true, opciones: [10,20,30,40,50,60,70,80,90,100].map(function (n) { return { v: n, t: n + ' %' }; }) },
    { clave: 'brilloNoche', etiqueta: 'Brillo de noche', barra: true, opciones: [10,20,30,40,50,60,70,80,90,100].map(function (n) { return { v: n, t: n + ' %' }; }) },
    { clave: 'cerrar', etiqueta: 'Cerrar', boton: true }
  ];

  var PREDETERMINADO = { coleccion: 'impresionismo', intervalo: 15, ciudad: 0, estilo: 'vidrio', ajuste: 'llenar', liquido: 70, posReloj: 'arriba', formato24: false, horizontales: true, brillo: 100, brilloNoche: 50, mezclarFavoritas: true, misFotos: true };

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  var API = 'https://api.artic.edu/api/v1/artworks/search';
  var IIIF = 'https://www.artic.edu/iiif/2/';
  var CAMPOS = 'id,title,artist_title,artist_display,date_display,medium_display,main_reference_number,image_id,thumbnail,artwork_type_title,is_public_domain';

  // ---------------------------------------------------------------- Estado
  var ajustes = cargarAjustes();
  var pila = [];          // obras por mostrar
  var historial = [];     // obras ya mostradas (para "anterior")
  var posHistorial = -1;
  var capa = 'a';         // capa visible de la doble imagen
  var obraActual = null;
  var temporizador = null;
  var pausado = false;
  var cargando = false;
  var panelAbierto = false;
  var filaActiva = 0;

  function $(id) { return document.getElementById(id); }

  // ---------------------------------------------------------------- Ajustes guardados
  function cargarAjustes() {
    var a = {};
    var k;
    for (k in PREDETERMINADO) a[k] = PREDETERMINADO[k];
    try {
      var g = JSON.parse(localStorage.getItem('marcoArte.ajustes') || '{}');
      for (k in g) if (k in a) a[k] = g[k];
      // Versión 2: el estilo nuevo de pantalla completa es el de fábrica.
      if (g.version !== 2) a.estilo = 'vidrio';
      if (g.noche === false && g.brilloNoche === undefined) a.brilloNoche = 100;
    } catch (e) { /* sin almacenamiento: se usan los valores de fábrica */ }
    return a;
  }
  function guardarAjustes() {
    ajustes.version = 2;
    try { localStorage.setItem('marcoArte.ajustes', JSON.stringify(ajustes)); } catch (e) { /* nada */ }
  }
  function coleccionActual() {
    for (var i = 0; i < COLECCIONES.length; i++) if (COLECCIONES[i].id === ajustes.coleccion) return COLECCIONES[i];
    return COLECCIONES[0];
  }

  // ---------------------------------------------------------------- Red
  function pedirJson(url, ms) {
    return new Promise(function (ok, falla) {
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.timeout = ms || 20000;
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) {
          try { ok(JSON.parse(x.responseText)); } catch (e) { falla(e); }
        } else falla(new Error('HTTP ' + x.status));
      };
      x.onerror = function () { falla(new Error('red')); };
      x.ontimeout = function () { falla(new Error('tiempo')); };
      x.send();
    });
  }

  function barajar(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = lista[i]; lista[i] = lista[j]; lista[j] = t;
    }
    return lista;
  }

  // Búsqueda completa (filtro de dominio público y de pintura en el servidor).
  function urlAvanzada(col, pagina) {
    var must = [{ term: { is_public_domain: true } }];
    if (col.pintura) must.push({ term: { artwork_type_id: 1 } });
    var cuerpo = { query: { bool: { must: must } }, fields: CAMPOS.split(','), limit: 100, page: pagina };
    if (col.q) cuerpo.q = col.q;
    return API + '?params=' + encodeURIComponent(JSON.stringify(cuerpo));
  }
  // Respaldo sencillo por si la búsqueda completa no responde: se filtra aquí.
  function urlSencilla(col, pagina) {
    return API + '?' + (col.q ? 'q=' + encodeURIComponent(col.q) + '&' : '') +
      'query[term][is_public_domain]=true&fields=' + CAMPOS + '&limit=100&page=' + pagina;
  }

  function sirve(o, col) {
    if (!o || !o.image_id || o.is_public_domain === false) return false;
    if (col.pintura && o.artwork_type_title && o.artwork_type_title !== 'Painting') return false;
    var t = o.thumbnail;
    if (ajustes.horizontales && t && t.width && t.height && t.width < t.height * 1.05) return false;
    return true;
  }

  function rellenarPila() {
    var col = coleccionActual();
    if (col.favoritas || col.fotos) {
      var lista = barajar((col.fotos && FOTOS.length ? FOTOS : FAVORITAS).slice());
      if (obraActual && lista[0].id === obraActual.id) lista.push(lista.shift());
      pila = pila.concat(lista);
      return Promise.resolve();
    }
    var pagina = 1 + Math.floor(Math.random() * 4);
    var vistos = {};
    historial.forEach(function (o) { vistos[o.id] = true; });

    function procesar(r) {
      var lista = (r && r.data) ? r.data.filter(function (o) { return sirve(o, col) && !vistos[o.id]; }) : [];
      return lista;
    }

    return pedirJson(urlAvanzada(col, pagina))
      .then(procesar)
      .then(function (lista) { return lista.length ? lista : pedirJson(urlAvanzada(col, 1)).then(procesar); })
      .catch(function () { return []; })
      .then(function (lista) { return lista.length ? lista : pedirJson(urlSencilla(col, pagina)).then(procesar); })
      .then(function (lista) { return lista.length ? lista : pedirJson(urlSencilla(col, 1)).then(procesar); })
      .then(function (lista) {
        if (!lista.length) throw new Error('vacío');
        pila = pila.concat(barajar(lista));
      });
  }

  // ---------------------------------------------------------------- Imagen
  function urlImagen(o, ancho) { return IIIF + o.image_id + '/full/' + ancho + ',/0/default.jpg'; }

  function urlWikipedia(titulo) {
    return 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=1920&titles=' + encodeURIComponent(titulo);
  }

  function candidatas(o) {
    if (o.foto) return Promise.resolve([o.src]);
    if (!o.favorita) return Promise.resolve([urlImagen(o, 1686), urlImagen(o, 843)]);
    return pedirJson(urlWikipedia(o.wiki), 12000).then(function (r) {
      var urls = [];
      var paginas = (r && r.query && r.query.pages) || {};
      for (var k in paginas) if (paginas[k].thumbnail && paginas[k].thumbnail.source) urls.push(paginas[k].thumbnail.source);
      return urls.concat(o.respaldo);
    }, function () { return o.respaldo.slice(); });
  }

  function precargar(o) {
    return candidatas(o).then(function (lista) { return cargarPrimera(lista); });
  }

  function cargarPrimera(lista) {
    return new Promise(function (ok, falla) {
      var intentos = lista.slice();
      function probar() {
        if (!intentos.length) { falla(new Error('imagen')); return; }
        var url = intentos.shift();
        var img = new Image();
        img.onload = function () { ok({ url: url, w: img.naturalWidth, h: img.naturalHeight }); };
        img.onerror = probar;
        img.src = url;
      }
      probar();
    });
  }

  function acomodar(marco, w, h) {
    var lienzo = $('lienzo');
    var inmersivo = ajustes.estilo === 'inmersivo';
    var W = lienzo.clientWidth, H = lienzo.clientHeight;
    var vh = window.innerHeight / 100, vw = window.innerWidth / 100;
    var padT = inmersivo ? 4 * vh : 8 * vh, padB = inmersivo ? 4 * vh : 9 * vh;
    var padL = inmersivo ? 3 * vw : 6 * vw, padR = inmersivo ? 3 * vw : 4 * vw;
    var borde = inmersivo ? 0 : 0.9 * vh;
    var maxW = W - padL - padR - 2 * borde, maxH = H - padT - padB - 2 * borde;
    var esc = Math.min(maxW / w, maxH / h);
    var ancho = Math.round(w * esc), alto = Math.round(h * esc);
    marco.style.width = (ancho + 2 * borde) + 'px';
    marco.style.height = (alto + 2 * borde) + 'px';
    marco.style.left = Math.round(padL + (maxW - ancho) / 2) + 'px';
    // Un poco por encima del centro, como se cuelga en un museo.
    marco.style.top = Math.round(padT + (maxH - alto) * 0.42) + 'px';
    marco.setAttribute('data-w', w);
    marco.setAttribute('data-h', h);
  }

  function texto(v) { return v ? String(v) : ''; }

  // Técnicas más comunes, en español; si no está en la lista se deja como viene.
  var TECNICAS = [
    [/^oil on canvas$/i, 'Óleo sobre lienzo'], [/^oil on panel$/i, 'Óleo sobre tabla'], [/^oil on board$/i, 'Óleo sobre cartón'],
    [/^oil on wood$/i, 'Óleo sobre madera'], [/^oil on paper$/i, 'Óleo sobre papel'], [/^oil on cradled panel$/i, 'Óleo sobre tabla'],
    [/^tempera on panel$/i, 'Temple sobre tabla'], [/^watercolor/i, 'Acuarela'], [/^pastel/i, 'Pastel'],
    [/^color woodblock print/i, 'Xilografía a color'], [/^woodblock print/i, 'Xilografía'], [/^gouache/i, 'Gouache']
  ];
  function traducirTecnica(t) {
    t = texto(t).trim();
    for (var i = 0; i < TECNICAS.length; i++) if (TECNICAS[i][0].test(t)) return TECNICAS[i][1];
    return t;
  }

  function mostrarCartela(o) {
    var c = $('cartela');
    c.className = 'cambiando';
    setTimeout(function () {
      $('obra-titulo').textContent = texto(o.title) || 'Sin título';
      var artista = texto(o.artist_title) || (texto(o.artist_display).split('\n')[0]) || 'Artista desconocido';
      $('obra-artista').textContent = artista;
      $('obra-fecha').textContent = texto(o.date_display);
      $('obra-tecnica').textContent = traducirTecnica(o.medium_display);
      $('obra-credito').textContent = o.foto ? (o.credito || '') : o.credito ? '♥ ' + o.credito :
        'Art Institute of Chicago' + (o.main_reference_number ? ' · Núm. ' + o.main_reference_number : '');
      c.className = '';
    }, 700);
  }

  function colgar(o, img) {
    var siguiente = capa === 'a' ? 'b' : 'a';
    var marco = $('marco-' + siguiente);
    $('img-' + siguiente).src = img.url;
    acomodar(marco, img.w, img.h);
    $('atm-' + siguiente).style.backgroundImage = 'url("' + img.url + '")';

    marco.className = 'marco visible';
    $('atm-' + siguiente).className = 'capa visible';
    $('marco-' + capa).className = 'marco';
    $('atm-' + capa).className = 'capa';
    capa = siguiente;
    obraActual = o;
    $('espera').className = 'oculto';
    mostrarCartela(o);
  }

  var obrasNuevas = 0;
  var turnoFavorita = 0;
  function obtenerSiguiente() {
    obrasNuevas++;
    var col = coleccionActual();
    var especiales = [];
    if (!col.favoritas && !col.fotos) {
      if (ajustes.mezclarFavoritas) especiales = especiales.concat(FAVORITAS);
      if (ajustes.misFotos) especiales = especiales.concat(FOTOS);
    }
    if (especiales.length && (obrasNuevas === 1 || obrasNuevas % 3 === 0)) {
      var esp = especiales[turnoFavorita++ % especiales.length];
      if (!obraActual || obraActual.id !== esp.id) return Promise.resolve(esp);
    }
    if (pila.length) return Promise.resolve(pila.shift());
    return rellenarPila().then(function () { return pila.shift(); });
  }

  function mostrarObra(o) {
    return precargar(o).then(function (img) { colgar(o, img); });
  }

  function siguiente() {
    if (cargando) return;
    // Si regresamos en el historial, avanzamos por él antes de pedir obras nuevas.
    if (posHistorial < historial.length - 1) {
      posHistorial++;
      cargando = true;
      mostrarObra(historial[posHistorial]).then(listo, listo);
      return;
    }
    cargando = true;
    var intentos = 0;
    (function intentar() {
      obtenerSiguiente().then(function (o) {
        return mostrarObra(o).then(function () {
          historial.push(o);
          if (historial.length > 60) historial.shift();
          posHistorial = historial.length - 1;
          listo();
        });
      }).catch(function () {
        intentos++;
        if (intentos < 4) { intentar(); return; }
        cargando = false;
        if (!obraActual) {
          $('espera-nota').textContent = 'Sin conexión con el museo. Reintento en un minuto.';
        }
        programar(60 * 1000);
      });
    })();
  }

  function anterior() {
    if (cargando || posHistorial <= 0) { avisar('Esta es la primera obra'); return; }
    posHistorial--;
    cargando = true;
    mostrarObra(historial[posHistorial]).then(listo, listo);
  }

  var cambioPendiente = false;
  function listo() {
    cargando = false;
    if (cambioPendiente) { cambioPendiente = false; siguiente(); return; }
    programar();
  }

  function programar(ms) {
    clearTimeout(temporizador);
    if ((pausado || !+ajustes.intervalo) && !ms) return;
    temporizador = setTimeout(siguiente, ms || ajustes.intervalo * 60 * 1000);
  }

  function reiniciarColeccion() {
    pila = [];
    historial = obraActual ? [obraActual] : [];
    posHistorial = historial.length - 1;
    if (cargando) cambioPendiente = true;
    else siguiente();
  }

  // ---------------------------------------------------------------- Reloj
  function dosDigitos(n) { return n < 10 ? '0' + n : String(n); }

  function actualizarReloj() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    if (ajustes.formato24) {
      $('hora-num').textContent = dosDigitos(h) + ':' + dosDigitos(m);
      $('hora-ampm').textContent = '';
    } else {
      var h12 = h % 12 === 0 ? 12 : h % 12;
      $('hora-num').textContent = h12 + ':' + dosDigitos(m);
      $('hora-ampm').textContent = h < 12 ? 'a. m.' : 'p. m.';
    }
    $('fecha').textContent = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    $('reloj-fecha').textContent = DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    dibujarHora(false);
    aplicarBrillo();
  }

  // ---------------------------------------------------------------- Brillo
  // La tele no deja que una app cambie su luz de fondo por HDMI, así que
  // oscurecemos la imagen con una capa negra encima.
  function esDeNoche() { var h = new Date().getHours(); return h >= 23 || h < 7; }
  function nivelBrillo() {
    var dia = +ajustes.brillo || 100;
    return esDeNoche() ? Math.min(dia, +ajustes.brilloNoche || 100) : dia;
  }
  function aplicarBrillo() {
    $('noche').style.opacity = (Math.min(0.9, 1 - nivelBrillo() / 100)).toFixed(2);
  }
  function cambiarBrillo(dir) {
    var clave = esDeNoche() ? 'brilloNoche' : 'brillo';
    ajustes[clave] = Math.max(10, Math.min(100, (+ajustes[clave] || 100) + dir * 10));
    guardarAjustes();
    aplicarBrillo();
    avisar((clave === 'brilloNoche' ? 'Brillo de noche ' : 'Brillo ') + '<b>' + ajustes[clave] + ' %</b>', 1800);
  }

  // ---------------------------------------------------------------- Spotify (solo control)
  // El instalador deja en la tele un spotify.json con el client_id y una llave
  // (refresh_token) que se obtuvo iniciando sesión desde la compu.
  var sp = { cfg: null, token: '', vence: 0, estado: null, ocupado: false, temporizador: null };

  function guardaSp() {
    try { localStorage.setItem('marcoArte.spotify', JSON.stringify({ semilla: sp.cfg.refresh_token, actual: sp.refresh })); } catch (e) {}
  }

  function iniciarSpotify() {
    var t = '';
    try { t = (window.Android && Android.spotify()) || ''; } catch (e) {}
    if (!t) return;
    try { sp.cfg = JSON.parse(t); } catch (e) { return; }
    if (!sp.cfg.client_id || !sp.cfg.refresh_token) { sp.cfg = null; return; }
    sp.refresh = sp.cfg.refresh_token;
    try {
      var g = JSON.parse(localStorage.getItem('marcoArte.spotify') || '{}');
      if (g.semilla === sp.cfg.refresh_token && g.actual) sp.refresh = g.actual;
    } catch (e) {}
    leerReproduccion();
    setInterval(leerReproduccion, 5000);
    setInterval(pintarProgreso, 1000);
  }

  function spPedir(metodo, url, cuerpo, cabeceras) {
    return new Promise(function (ok, falla) {
      var x = new XMLHttpRequest();
      x.open(metodo, url, true);
      x.timeout = 12000;
      for (var k in (cabeceras || {})) x.setRequestHeader(k, cabeceras[k]);
      x.onload = function () { ok(x); };
      x.onerror = function () { falla(new Error('red')); };
      x.ontimeout = function () { falla(new Error('tiempo')); };
      x.send(cuerpo || null);
    });
  }

  function spToken(forzar) {
    if (!forzar && sp.token && Date.now() < sp.vence) return Promise.resolve(sp.token);
    var cuerpo = 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(sp.refresh) +
      '&client_id=' + encodeURIComponent(sp.cfg.client_id);
    return spPedir('POST', 'https://accounts.spotify.com/api/token', cuerpo,
      { 'Content-Type': 'application/x-www-form-urlencoded' }).then(function (x) {
      var r = {};
      try { r = JSON.parse(x.responseText); } catch (e) {}
      if (x.status !== 200 || !r.access_token) {
        // Si la llave guardada ya no sirve, probamos con la que dejó el instalador.
        if (sp.refresh !== sp.cfg.refresh_token) { sp.refresh = sp.cfg.refresh_token; return spToken(true); }
        throw new Error('llave');
      }
      sp.token = r.access_token;
      sp.vence = Date.now() + ((r.expires_in || 3600) - 120) * 1000;
      if (r.refresh_token) { sp.refresh = r.refresh_token; guardaSp(); }
      return sp.token;
    });
  }

  function spApi(metodo, ruta) {
    return spToken(false).then(function (tok) {
      return spPedir(metodo, 'https://api.spotify.com/v1' + ruta, metodo === 'GET' ? null : '',
        { 'Authorization': 'Bearer ' + tok });
    }).then(function (x) {
      if (x.status === 401) { sp.token = ''; }
      return x;
    });
  }

  function leerReproduccion() {
    if (!sp.cfg || document.hidden) return;
    spApi('GET', '/me/player').then(function (x) {
      if (x.status === 204 || !x.responseText) { sp.estado = null; pintarMusica(); return; }
      if (x.status !== 200) return;
      var r = JSON.parse(x.responseText);
      sp.estado = (r && r.item) ? { sonando: !!r.is_playing, item: r.item, progreso: r.progress_ms || 0, duracion: r.item.duration_ms || 1, leido: Date.now() } : null;
      pintarMusica();
    }).catch(function () {});
  }

  function pintarMusica() {
    var barra = $('musica');
    var e = sp.estado;
    if (!e) { barra.className = ''; return; }
    var it = e.item;
    $('musica-titulo').textContent = it.name || '';
    $('musica-artista').textContent = (it.artists || []).map(function (a) { return a.name; }).join(', ') ||
      (it.show && it.show.name) || '';
    var imgs = (it.album && it.album.images) || it.images || [];
    var portada = imgs.length ? imgs[Math.min(1, imgs.length - 1)].url : '';
    var img = $('musica-portada');
    if (portada && img.getAttribute('src') !== portada) img.src = portada;
    img.style.visibility = portada ? 'visible' : 'hidden';
    $('musica-pausa').innerHTML = e.sonando ? ICONO_PAUSA : ICONO_PLAY;
    barra.className = 'visible' + (e.sonando ? '' : ' en-pausa');
    pintarProgreso();
  }

  function pintarProgreso() {
    var e = sp.estado;
    if (!e) return;
    var p = e.progreso + (e.sonando ? Date.now() - e.leido : 0);
    $('musica-avance').style.width = Math.min(100, p / e.duracion * 100).toFixed(2) + '%';
  }

  var ICONO_PAUSA = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>';
  var ICONO_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';

  function iluminar(id) {
    var b = $(id);
    b.className = 'boton-musica activo';
    setTimeout(function () { b.className = 'boton-musica'; }, 350);
  }

  function musica(accion) {
    if (!sp.cfg) return false;
    if (sp.ocupado) return true;
    var ruta, metodo = 'POST';
    if (accion === 'pausa') {
      var sonando = sp.estado && sp.estado.sonando;
      ruta = sonando ? '/me/player/pause' : '/me/player/play';
      metodo = 'PUT';
      iluminar('musica-pausa');
      if (sp.estado) { sp.estado.progreso += sonando ? Date.now() - sp.estado.leido : 0; sp.estado.leido = Date.now(); sp.estado.sonando = !sonando; pintarMusica(); }
    } else if (accion === 'siguiente') { ruta = '/me/player/next'; iluminar('musica-siguiente'); }
    else { ruta = '/me/player/previous'; iluminar('musica-anterior'); }
    sp.ocupado = true;
    spApi(metodo, ruta).then(function (x) {
      sp.ocupado = false;
      if (x.status === 404) avisar('Abre Spotify en tu cel o iPad y pon algo a sonar');
      else if (x.status === 403) avisar('Spotify no dejó hacer eso en esta bocina');
      setTimeout(leerReproduccion, 700);
    }, function () {
      sp.ocupado = false;
      avisar('No se pudo hablar con Spotify');
    });
    return true;
  }

  // ---------------------------------------------------------------- Reloj de vidrio líquido
  var horaDibujada = '';
  var medidor = document.createElement('canvas');

  function textoHora() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    if (ajustes.formato24) return dosDigitos(h) + ':' + dosDigitos(m);
    return (h % 12 === 0 ? 12 : h % 12) + ':' + dosDigitos(m);
  }

  function dibujarHora(forzar) {
    if (ajustes.estilo === 'galeria') return;
    var txt = textoHora();
    if (!forzar && txt === horaDibujada) return;
    horaDibujada = txt;

    var g = Math.max(0, Math.min(100, +ajustes.liquido || 0)) / 100;
    var fs = Math.round(window.innerHeight * 0.25);
    var dpr = window.devicePixelRatio || 1;
    var fuente = '600 ' + fs + 'px InterVar, "Helvetica Neue", Arial, sans-serif';
    var m = medidor.getContext('2d');
    m.font = fuente;
    var espacio = -0.025 * fs;
    var letras = txt.split('');
    var anchos = letras.map(function (c) { return m.measureText(c).width; });
    var total = anchos.reduce(function (a, b) { return a + b; }, 0) + espacio * (letras.length - 1);
    var pad = Math.round(fs * 0.14);
    var alto = Math.round(fs * 0.74);          // altura de los números en Inter
    var W = Math.ceil(total + pad * 2), H = alto + pad * 2;
    var base = pad + alto;

    function preparar(c) {
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      var x = c.getContext('2d');
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, W, H);
      x.font = fuente;
      x.textBaseline = 'alphabetic';
      return x;
    }
    function escribir(x, pinta, dx) {
      var px = pad;
      for (var i = 0; i < letras.length; i++) { pinta(x, letras[i], px + (dx || 0), base); px += anchos[i] + espacio; }
    }

    // 1) Máscara con la forma de los números para el vidrio
    var mascara = document.createElement('canvas');
    var xm = preparar(mascara);
    xm.fillStyle = '#fff';
    escribir(xm, function (x, c, px, py) { x.fillText(c, px, py); });
    var url = 'url(' + mascara.toDataURL('image/png') + ')';
    var vidrio = $('hora-vidrio');
    vidrio.style.width = W + 'px'; vidrio.style.height = H + 'px';
    vidrio.style.webkitMaskImage = url; vidrio.style.maskImage = url;
    var reloj = $('reloj');
    // 0 % = blanco sólido · 50 % = vidrio esmerilado · 100 % = vidrio claro, casi transparente
    reloj.style.setProperty('--blur', (window.innerHeight * (0.018 - 0.013 * g)).toFixed(1) + 'px');
    reloj.style.setProperty('--brillo', (1.38 - 0.24 * g).toFixed(2));
    reloj.style.setProperty('--tinte', (0.03 + 0.2 * (1 - g)).toFixed(3));

    // 2) Sombra suave debajo, para que los números floten sobre la pintura
    var xs = preparar($('hora-sombra'));
    xs.shadowColor = 'rgba(0,0,0,' + (0.14 + 0.2 * g).toFixed(2) + ')';
    xs.shadowBlur = fs * 0.09;
    xs.shadowOffsetY = fs * 0.02;
    xs.shadowOffsetX = 10000;
    xs.fillStyle = '#000';
    escribir(xs, function (x, c, px, py) { x.fillText(c, px, py); }, -10000);

    // 3) Relleno blanco (más sólido con poco vidrio) y borde brillante
    var xt = preparar($('hora-texto'));
    xt.fillStyle = 'rgba(255,255,255,' + (1 - g).toFixed(3) + ')';
    escribir(xt, function (x, c, px, py) { x.fillText(c, px, py); });
    // Borde brillante: la forma de los números menos la misma forma movida un poco.
    // Así no aparecen las líneas internas de la fuente, y la luz pega más arriba.
    var aBorde = 0.2 + 0.8 * g;
    var grosor = Math.max(1, fs * (0.007 + 0.007 * g));
    function filo(dx, dy, alfa) {
      var c = document.createElement('canvas');
      var x = preparar(c);
      x.fillStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')';
      escribir(x, function (k, ch, px, py) { k.fillText(ch, px, py); });
      x.globalCompositeOperation = 'destination-out';
      x.fillStyle = '#000';
      escribir(x, function (k, ch, px, py) { k.fillText(ch, px + dx, py + dy); });
      xt.drawImage(c, 0, 0, W, H);
    }
    filo(0, grosor, aBorde);               // arriba, la luz principal
    filo(0, -grosor, aBorde * 0.55);       // abajo
    filo(grosor, 0, aBorde * 0.4);         // izquierda
    filo(-grosor, 0, aBorde * 0.4);        // derecha
  }

  // ---------------------------------------------------------------- Clima
  function describirClima(c) {
    if (c === 0) return 'Despejado';
    if (c === 1) return 'Casi despejado';
    if (c === 2) return 'Parcialmente nublado';
    if (c === 3) return 'Nublado';
    if (c === 45 || c === 48) return 'Neblina';
    if (c >= 51 && c <= 57) return 'Llovizna';
    if (c >= 61 && c <= 67) return 'Lluvia';
    if (c >= 71 && c <= 77) return 'Nieve';
    if (c >= 80 && c <= 82) return 'Chubascos';
    if (c === 85 || c === 86) return 'Chubascos de nieve';
    if (c >= 95) return 'Tormenta';
    return '';
  }

  function actualizarClima() {
    var c = CIUDADES[ajustes.ciudad] || CIUDADES[0];
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
    pedirJson(url, 15000).then(function (r) {
      var t = Math.round(r.current.temperature_2m);
      $('clima-temp').textContent = t + '°';
      $('clima-texto').textContent = describirClima(r.current.weather_code) + ' en ' + c.nombre;
      $('reloj-clima').textContent = c.nombre + ' · ' + t + '° ' + describirClima(r.current.weather_code);
      $('clima-rango').textContent = 'máx. ' + Math.round(r.daily.temperature_2m_max[0]) + '° · mín. ' + Math.round(r.daily.temperature_2m_min[0]) + '°';
    }).catch(function () {
      if (!$('clima-temp').textContent) $('clima-texto').textContent = 'Clima no disponible';
    });
  }

  // ---------------------------------------------------------------- Aviso
  var avisoT = null;
  function avisar(html, ms) {
    var a = $('aviso');
    a.innerHTML = html;
    a.className = 'visible';
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { a.className = ''; }, ms || 3000);
  }

  // ---------------------------------------------------------------- Panel de ajustes
  function valorTexto(fila) {
    for (var i = 0; i < fila.opciones.length; i++) if (fila.opciones[i].v === ajustes[fila.clave]) return fila.opciones[i].t;
    return fila.opciones[0].t;
  }

  function pintarPanel() {
    var ul = $('ajustes-lista');
    ul.innerHTML = '';
    FILAS.forEach(function (f, i) {
      var li = document.createElement('li');
      if (f.boton) {
        li.className = 'boton' + (i === filaActiva ? ' activo' : '');
        li.textContent = f.etiqueta;
      } else {
        li.className = i === filaActiva ? 'activo' : '';
        var et = document.createElement('span');
        et.textContent = f.etiqueta;
        var val = document.createElement('span');
        val.className = 'valor';
        var barra = '';
        if (f.barra) {
          var pct = ajustes[f.clave];
          barra = '<span class="barra"><i style="width:' + pct + '%"></i><b style="left:' + pct + '%"></b></span>';
        }
        val.innerHTML = '<span class="flecha">◀</span>' + barra + '<span class="t"></span>' + '<span class="flecha">▶</span>';
        val.querySelector('.t').textContent = valorTexto(f);
        li.appendChild(et);
        li.appendChild(val);
      }
      ul.appendChild(li);
      if (i === filaActiva && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    });
  }

  function abrirPanel() {
    panelAbierto = true;
    filaActiva = 0;
    $('ajustes').hidden = false;
    pintarPanel();
  }

  function cerrarPanel() {
    panelAbierto = false;
    $('ajustes').hidden = true;
  }

  function cambiarValor(dir) {
    var f = FILAS[filaActiva];
    if (f.boton) return;
    var idx = 0;
    for (var i = 0; i < f.opciones.length; i++) if (f.opciones[i].v === ajustes[f.clave]) idx = i;
    idx = (idx + dir + f.opciones.length) % f.opciones.length;
    var antes = ajustes[f.clave];
    ajustes[f.clave] = f.opciones[idx].v;
    guardarAjustes();
    pintarPanel();
    aplicarCambio(f.clave, antes);
  }

  var cambioColeccionT = null;
  function aplicarCambio(clave) {
    if (clave === 'coleccion' || clave === 'horizontales' || clave === 'misFotos' || clave === 'mezclarFavoritas') {
      // Esperamos a que deje de cambiar para no pedir obras de cada opción.
      clearTimeout(cambioColeccionT);
      cambioColeccionT = setTimeout(reiniciarColeccion, 1200);
    } else if (clave === 'intervalo') {
      programar();
    } else if (clave === 'ciudad') {
      actualizarClima();
    } else if (clave === 'liquido') {
      dibujarHora(true);
    } else if (clave === 'estilo' || clave === 'ajuste' || clave === 'posReloj') {
      aplicarEstilo();
    } else if (clave === 'brillo' || clave === 'brilloNoche') {
      aplicarBrillo();
    } else if (clave === 'formato24') {
      actualizarReloj();
    }
  }

  function aplicarEstilo() {
    $('app').className = ajustes.estilo === 'galeria' ? 'galeria' :
      ('vidrio' + (ajustes.ajuste === 'completa' ? ' completa' : '') + (ajustes.posReloj === 'centro' ? ' reloj-centro' : ''));
    dibujarHora(true);
    reacomodar();
  }

  function reacomodar() {
    ['a', 'b'].forEach(function (k) {
      var m = $('marco-' + k);
      var w = +m.getAttribute('data-w'), h = +m.getAttribute('data-h');
      if (w && h) acomodar(m, w, h);
    });
  }

  // ---------------------------------------------------------------- Control remoto
  var TECLAS = { 37: 'izq', 38: 'arriba', 39: 'der', 40: 'abajo', 13: 'ok', 23: 'ok', 32: 'ok', 179: 'pausa', 27: 'atras', 8: 'atras', 93: 'menu' };

  function nombreTecla(e) {
    var porNombre = { ArrowLeft: 'izq', ArrowRight: 'der', ArrowUp: 'arriba', ArrowDown: 'abajo', Enter: 'ok',
      MediaPlayPause: 'pausa', Escape: 'atras', ContextMenu: 'menu', MediaTrackNext: 'der', MediaTrackPrevious: 'izq' };
    return porNombre[e.key] || TECLAS[e.keyCode] || null;
  }

  document.addEventListener('keydown', function (e) {
    var t = nombreTecla(e);
    if (!t) return;
    e.preventDefault();
    if (panelAbierto) {
      if (t === 'arriba') { filaActiva = (filaActiva - 1 + FILAS.length) % FILAS.length; pintarPanel(); }
      else if (t === 'abajo') { filaActiva = (filaActiva + 1) % FILAS.length; pintarPanel(); }
      else if (t === 'izq') cambiarValor(-1);
      else if (t === 'der') cambiarValor(1);
      else if (t === 'ok') { if (FILAS[filaActiva].boton) cerrarPanel(); else cambiarValor(1); }
      else if (t === 'atras' || t === 'menu') cerrarPanel();
      return;
    }
    if (t === 'der') siguiente();
    else if (t === 'izq') anterior();
    else if (t === 'ok' || t === 'menu') abrirPanel();
    else if (t === 'pausa') window.alPausa();
    else if (t === 'arriba') cambiarBrillo(1);
    else if (t === 'abajo') cambiarBrillo(-1);
  });

  function alternarPausa() {
    pausado = !pausado;
    if (pausado) { clearTimeout(temporizador); avisar('Obra fija. <b>⏯</b> para volver a rotar'); }
    else { programar(); avisar('Rotación activada'); }
  }

  function mostrarAyuda() {
    avisar('<b>◀ ▶</b> cambiar obra &nbsp;·&nbsp; <b>▲ ▼</b> brillo &nbsp;·&nbsp; <b>OK</b> ajustes' +
      (sp.cfg ? ' &nbsp;·&nbsp; <b>⏪ ⏯ ⏩</b> música' : ''), 6000);
  }

  // Botones que la app de Android reenvía (Menú, Atrás, adelantar, regresar, pausa).
  window.alMenu = function () { if (panelAbierto) cerrarPanel(); else abrirPanel(); };
  window.alSiguiente = function () { if (!panelAbierto && !musica('siguiente')) siguiente(); };
  window.alAnterior = function () { if (!panelAbierto && !musica('anterior')) anterior(); };
  window.alPausa = function () { if (!musica('pausa')) alternarPausa(); };
  window.alAtras = function () {
    if (panelAbierto) { cerrarPanel(); return true; }
    return false;
  };

  window.addEventListener('resize', function () { reacomodar(); dibujarHora(true); });
  if (document.fonts && document.fonts.load) {
    document.fonts.load('600 100px InterVar').then(function () { dibujarHora(true); }, function () {});
  }

  // ---------------------------------------------------------------- Arranque
  aplicarEstilo();
  actualizarReloj();
  setInterval(actualizarReloj, 5000);
  actualizarClima();
  setInterval(actualizarClima, 20 * 60 * 1000);
  iniciarSpotify();
  siguiente();
  setTimeout(mostrarAyuda, 2500);
})();
