/* Lector de calendarios .ics (el link público de iCloud).
   leerICS(texto, desde, hasta) -> [{ini: Date, fin: Date, titulo, lugar, todoElDia}]
   Entiende eventos que se repiten (RRULE diaria, semanal, mensual y anual con INTERVAL,
   BYDAY, UNTIL y COUNT), fechas quitadas (EXDATE) y cambios a una sola repetición
   (RECURRENCE-ID). Las horas con zona se toman como hora local de la tele. */
(function () {
  'use strict';

  function desdoblar(texto) {
    return texto.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
  }

  function texto(v) {
    return (v || '').replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
  }

  // "20261030T090000Z", "20261030T090000" o "20261030"
  function fecha(valor, params) {
    var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/.exec(valor || '');
    if (!m) return null;
    var todoElDia = !m[4] || /VALUE=DATE(?!-)/.test(params || '');
    if (todoElDia) return { d: new Date(+m[1], +m[2] - 1, +m[3]), dia: true };
    if (m[7]) return { d: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])), dia: false };
    return { d: new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]), dia: false };
  }

  function duracion(v) {
    var m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v || '');
    if (!m) return 0;
    var ms = ((+m[2] || 0) * 7 * 86400 + (+m[3] || 0) * 86400 + (+m[4] || 0) * 3600 + (+m[5] || 0) * 60 + (+m[6] || 0)) * 1000;
    return m[1] === '-' ? -ms : ms;
  }

  function clave(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + 'T' + d.getHours() + ':' + d.getMinutes(); }

  var DIAS = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

  function repetir(ev, desde, hasta, quitar) {
    var r = {};
    ev.rrule.split(';').forEach(function (p) { var kv = p.split('='); r[kv[0]] = kv[1]; });
    var frec = r.FREQ, cada = +(r.INTERVAL || 1), max = r.COUNT ? +r.COUNT : Infinity;
    var limite = r.UNTIL ? fecha(r.UNTIL).d : null;
    var dias = r.BYDAY ? r.BYDAY.split(',').map(function (x) { return DIAS[x.replace(/^[+-]?\d+/, '')]; }) : null;
    var dur = ev.fin - ev.ini, salida = [], cuenta = 0;
    var base = new Date(ev.ini);

    function agregar(d) {
      cuenta++;
      if (cuenta > max) return false;
      if (limite && d > limite) return false;
      if (d > hasta) return false;
      var f = new Date(d.getTime() + dur);
      if (f >= desde && !quitar[clave(d)]) salida.push({ ini: d, fin: f, titulo: ev.titulo, lugar: ev.lugar, todoElDia: ev.todoElDia });
      return true;
    }

    for (var paso = 0; paso < 40000; paso++) {
      var d;
      if (frec === 'WEEKLY' && dias) {
        // Semana de la repetición: de domingo a sábado
        var semana = new Date(base); semana.setDate(base.getDate() - base.getDay() + paso * 7 * cada);
        var seguir = true;
        for (var k = 0; k < 7 && seguir; k++) {
          if (dias.indexOf(k) < 0) continue;
          d = new Date(semana); d.setDate(semana.getDate() + k);
          d.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
          if (d < base) continue;
          seguir = agregar(d);
        }
        if (!seguir) break;
        continue;
      }
      d = new Date(base);
      if (frec === 'DAILY') d.setDate(base.getDate() + paso * cada);
      else if (frec === 'WEEKLY') d.setDate(base.getDate() + paso * 7 * cada);
      else if (frec === 'MONTHLY') d.setMonth(base.getMonth() + paso * cada);
      else if (frec === 'YEARLY') d.setFullYear(base.getFullYear() + paso * cada);
      else break;
      if (!agregar(d)) break;
    }
    return salida;
  }

  window.leerICS = function (contenido, desde, hasta) {
    var lineas = desdoblar(contenido || '');
    var eventos = [], ev = null, calNombre = '';
    lineas.forEach(function (l) {
      if (!ev && l.indexOf('X-WR-CALNAME:') === 0) calNombre = texto(l.slice(13));
      if (l === 'BEGIN:VEVENT') { ev = { exdate: [] }; return; }
      if (l === 'END:VEVENT') { if (ev && ev.ini) eventos.push(ev); ev = null; return; }
      if (!ev) return;
      var i = l.indexOf(':'); if (i < 0) return;
      var nombre = l.slice(0, i), valor = l.slice(i + 1);
      var params = '', j = nombre.indexOf(';');
      if (j >= 0) { params = nombre.slice(j + 1); nombre = nombre.slice(0, j); }
      if (nombre === 'DTSTART') { var f = fecha(valor, params); if (f) { ev.ini = f.d; ev.todoElDia = f.dia; } }
      else if (nombre === 'DTEND') { var g = fecha(valor, params); if (g) ev.finD = g.d; }
      else if (nombre === 'DURATION') ev.dur = duracion(valor);
      else if (nombre === 'SUMMARY') ev.titulo = texto(valor);
      else if (nombre === 'LOCATION') ev.lugar = texto(valor).split(',')[0];
      else if (nombre === 'RRULE') ev.rrule = valor;
      else if (nombre === 'EXDATE') valor.split(',').forEach(function (x) { var e = fecha(x, params); if (e) ev.exdate.push(clave(e.d)); });
      else if (nombre === 'RECURRENCE-ID') { var rr = fecha(valor, params); if (rr) ev.recId = clave(rr.d); }
      else if (nombre === 'UID') ev.uid = valor;
      else if (nombre === 'STATUS') ev.estado = valor;
    });

    // Cambios a una sola repetición: se quitan de la serie y se agregan como evento suelto
    var cambios = {};
    eventos.forEach(function (e) { if (e.recId) (cambios[e.uid] = cambios[e.uid] || {})[e.recId] = true; });

    var salida = [];
    eventos.forEach(function (e) {
      if (e.estado === 'CANCELLED') return;
      e.fin = e.finD || new Date(e.ini.getTime() + (e.dur || (e.todoElDia ? 86400000 : 3600000)));
      e.titulo = e.titulo || 'Sin título';
      if (e.rrule && !e.recId) {
        var quitar = {};
        e.exdate.forEach(function (k) { quitar[k] = true; });
        var c = cambios[e.uid] || {};
        for (var k in c) quitar[k] = true;
        salida = salida.concat(repetir(e, desde, hasta, quitar));
      } else if (e.fin >= desde && e.ini <= hasta) {
        salida.push({ ini: e.ini, fin: e.fin, titulo: e.titulo, lugar: e.lugar, todoElDia: e.todoElDia });
      }
    });
    salida.forEach(function (e) { e.calendario = calNombre; });
    salida.sort(function (a, b) { return a.ini - b.ini; });
    return salida;
  };
})();
