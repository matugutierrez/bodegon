(function () {
  "use strict";

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = window.matchMedia("(pointer: fine)").matches;

  function cabecera() {
    var barra = document.querySelector(".cabecera");
    function actualizar() {
      if (barra) barra.classList.toggle("fija", window.scrollY > 24);
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    actualizar();
  }

  function cursor() {
    if (reducido || !fino) return;
    var aro = document.querySelector(".cursor-aro");
    var punto = document.querySelector(".cursor-punto");
    if (!aro || !punto) return;
    window.addEventListener("mousemove", function (e) {
      punto.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      aro.animate({ transform: "translate3d(" + e.clientX + "px," + e.clientY + "px,0)" }, { duration: 380, fill: "forwards" });
    });
    var interactivos = document.querySelectorAll("a, button");
    [].forEach.call(interactivos, function (el) {
      el.addEventListener("mouseenter", function () {
        aro.style.transform += "";
        aro.style.borderColor = "rgba(21, 85, 106, 0.9)";
      });
      el.addEventListener("mouseleave", function () {
        aro.style.borderColor = "";
      });
    });
  }

  function menu() {
    var boton = document.querySelector("[data-menu-btn]");
    var panel = document.querySelector(".menu");
    if (!boton || !panel) return;
    var etiqueta = boton.querySelector("[data-menu-label]");
    var temporizador = null;
    var enlaces = panel.querySelectorAll(".menu-enlace");
    [].forEach.call(enlaces, function (item, i) {
      item.style.setProperty("--retraso-nav", (0.22 + i * 0.07).toFixed(2) + "s");
    });
    function abrir() {
      window.clearTimeout(temporizador);
      panel.classList.add("visible");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          panel.classList.add("abierto");
        });
      });
      boton.classList.add("abierto");
      boton.setAttribute("aria-expanded", "true");
      boton.setAttribute("aria-label", "Cerrar menú");
      if (etiqueta) etiqueta.textContent = "Cerrar";
      document.body.classList.add("menu-abierto");
    }
    function cerrar() {
      panel.classList.remove("abierto");
      boton.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
      if (etiqueta) etiqueta.textContent = "Menú";
      document.body.classList.remove("menu-abierto");
      temporizador = window.setTimeout(function () {
        panel.classList.remove("visible");
      }, 680);
    }
    boton.addEventListener("click", function () {
      if (panel.classList.contains("abierto")) cerrar();
      else abrir();
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("abierto")) cerrar();
    });
    window.sitioMenu = { cerrar: cerrar, abierto: function () { return panel.classList.contains("abierto"); } };
  }

  function revelar() {
    var nodos = document.querySelectorAll("[data-reveal]");
    [].forEach.call(nodos, function (el) {
      if (el.dataset.retraso) el.style.setProperty("--retraso", parseFloat(el.dataset.retraso) + "s");
    });
    if (reducido || !("IntersectionObserver" in window)) {
      [].forEach.call(nodos, function (el) { el.classList.add("animado"); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        io.unobserve(entrada.target);
        entrada.target.classList.add("animado");
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    [].forEach.call(nodos, function (el) { io.observe(el); });
  }

  function lineas() {
    var bloques = document.querySelectorAll("[data-split]");
    function sonar(bloque, base) {
      var lineasInternas = bloque.querySelectorAll("[data-linea]");
      [].forEach.call(lineasInternas, function (linea, i) {
        linea.style.setProperty("--retraso-linea", (base + i * 0.1).toFixed(2) + "s");
        linea.classList.add("animado");
      });
    }
    if (reducido || !("IntersectionObserver" in window)) {
      [].forEach.call(bloques, function (b) { sonar(b, 0); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        io.unobserve(entrada.target);
        sonar(entrada.target, parseFloat(entrada.target.dataset.retraso || "0"));
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    [].forEach.call(bloques, function (b) {
      if (b.dataset.disparo === "scroll") io.observe(b);
      else sonar(b, parseFloat(b.dataset.retraso || "0"));
    });
  }

  function filete() {
    var dibujos = document.querySelectorAll("svg[data-filete]");
    if (!dibujos.length) return;
    if (reducido || !("IntersectionObserver" in window)) return;
    [].forEach.call(dibujos, function (svg) {
      var trazos = svg.querySelectorAll("path, circle, line, polyline");
      [].forEach.call(trazos, function (trazo, i) {
        try {
          var largo = trazo.getTotalLength();
          trazo.style.strokeDasharray = largo.toFixed(1);
          trazo.style.strokeDashoffset = largo.toFixed(1);
          trazo.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1) " + (i * 0.12).toFixed(2) + "s";
        } catch (err) {
          return;
        }
      });
    });
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        io.unobserve(entrada.target);
        var trazos = entrada.target.querySelectorAll("path, circle, line, polyline");
        [].forEach.call(trazos, function (trazo) {
          trazo.style.strokeDashoffset = "0";
        });
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    [].forEach.call(dibujos, function (svg) { io.observe(svg); });
  }

  function flotar() {
    if (reducido || !fino) return;
    var nodos = document.querySelectorAll("[data-flota]");
    if (!nodos.length) return;
    var espera = null;
    function actualizar() {
      var alto = window.innerHeight;
      [].forEach.call(nodos, function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > alto + 100) return;
        var centro = (r.top + r.height / 2 - alto / 2) / alto;
        var cantidad = parseFloat(el.dataset.flota || "18");
        el.style.transform = "translate3d(0," + (-centro * cantidad).toFixed(2) + "px,0)";
      });
      espera = null;
    }
    window.addEventListener("scroll", function () {
      if (espera === null) espera = window.requestAnimationFrame(actualizar);
    }, { passive: true });
    actualizar();
  }

  function aMinutos(h) {
    var partes = h.split(":");
    return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
  }

  function estado() {
    var listas = document.querySelectorAll("[data-horarios]");
    [].forEach.call(listas, function (lista) {
      var filas = lista.querySelectorAll("li[data-dia]");
      var hoy = new Date().getDay();
      [].forEach.call(filas, function (li) {
        if (parseInt(li.dataset.dia, 10) === hoy) li.classList.add("hoy");
      });
    });
    var chip = document.querySelector("[data-estado]");
    var listaSalon = document.querySelector('[data-horarios="salon"]');
    if (!chip || !listaSalon) return;
    var texto = chip.querySelector("[data-estado-texto]");
    var dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    var mapa = {};
    [].forEach.call(listaSalon.querySelectorAll("li[data-dia]"), function (li) {
      var d = parseInt(li.dataset.dia, 10);
      var rangos = (li.dataset.rangos || "").split(",").filter(Boolean).map(function (x) {
        var p = x.split("-");
        return [aMinutos(p[0]), aMinutos(p[1])];
      });
      mapa[d] = rangos;
    });
    var ahora = new Date();
    var dia = ahora.getDay();
    var minutos = ahora.getHours() * 60 + ahora.getMinutes();
    var abierto = (mapa[dia] || []).some(function (r) { return minutos >= r[0] && minutos < r[1]; });
    if (abierto) {
      chip.classList.remove("cerrado");
      if (texto) texto.textContent = "Abierto ahora";
      return;
    }
    chip.classList.add("cerrado");
    var proximo = null;
    for (var i = 0; i < 7; i++) {
      var d = (dia + i) % 7;
      var rangos = mapa[d] || [];
      for (var j = 0; j < rangos.length; j++) {
        if (i === 0 && rangos[j][0] <= minutos) continue;
        proximo = { dia: d, inicio: rangos[j][0], hoy: i === 0, manana: i === 1 };
        break;
      }
      if (proximo) break;
    }
    if (!proximo || !texto) {
      if (texto) texto.textContent = "Cerrado";
      return;
    }
    var hh = String(Math.floor(proximo.inicio / 60)).padStart(2, "0") + ":" + String(proximo.inicio % 60).padStart(2, "0");
    var cuando = proximo.hoy ? "hoy" : proximo.manana ? "mañana" : dias[proximo.dia];
    texto.textContent = "Cerrado — abre " + cuando + " " + hh;
  }

  function transicion() {
    var cortina = document.querySelector(".cortina");
    if (!cortina) return;
    if (!reducido) {
      cortina.classList.add("activa");
      cortina.style.transition = "none";
      cortina.style.clipPath = "inset(0% 0% 0% 0%)";
      window.requestAnimationFrame(function () {
        cortina.style.transition = "clip-path 0.6s cubic-bezier(0.87,0,0.13,1)";
        cortina.style.clipPath = "inset(0% 0% 100% 0%)";
        window.setTimeout(function () {
          cortina.classList.remove("activa");
          cortina.style.transition = "";
          cortina.style.clipPath = "";
        }, 640);
      });
    }
    if (reducido) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href$=".html"]') : null;
      if (!a) return;
      var destino = a.getAttribute("href");
      if (!destino || destino.indexOf("http") === 0 || destino.charAt(0) === "#") return;
      if (a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      function viajar() {
        cortina.classList.add("activa");
        cortina.style.transition = "none";
        cortina.style.clipPath = "inset(100% 0% 0% 0%)";
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            cortina.style.transition = "clip-path 0.55s cubic-bezier(0.87,0,0.13,1)";
            cortina.style.clipPath = "inset(0% 0% 0% 0%)";
            window.setTimeout(function () {
              window.location.href = destino;
            }, 580);
          });
        });
      }
      if (window.sitioMenu && window.sitioMenu.abierto()) {
        window.sitioMenu.cerrar();
        window.setTimeout(viajar, 350);
      } else {
        viajar();
      }
    });
  }

  function saludo() {
    var h = new Date().getHours();
    if (h >= 6 && h < 12) return "buenos días";
    if (h >= 12 && h < 20) return "buenas tardes";
    return "buenas noches";
  }

  function whatsapp() {
    var numero = "5491167208644";
    var enlaces = document.querySelectorAll("a[data-wa]");
    [].forEach.call(enlaces, function (a) {
      var base = a.getAttribute("data-wa") || "Quiero hacer una consulta.";
      a.setAttribute("href", "https://wa.me/" + numero + "?text=" + encodeURIComponent("Hola, " + saludo() + ". " + base));
    });
  }

  function platos() {
    var numero = "5491167208644";
    function nombre(texto) {
      return texto.toLowerCase().replace(/(^|[\s"“(\/])(\S)/g, function (m, p1, p2) {
        return p1 + p2.toUpperCase();
      });
    }
    var filas = document.querySelectorAll(".plato, .fila-bebidas");
    [].forEach.call(filas, function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "link");
      function consultar() {
        var n = el.querySelector(".plato-nombre");
        if (!n) n = el.querySelector("span:last-child");
        var texto = n ? n.textContent : el.textContent;
        texto = nombre(texto.trim().replace(/\s+/g, " "));
        var mensaje = "Hola, " + saludo() + ". Quiero solicitar el precio de " + texto + ".";
        window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje), "_blank", "noopener");
      }
      el.addEventListener("click", consultar);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          consultar();
        }
      });
    });
  }

  function destino() {
    var id = window.location.hash;
    if (!id) return;
    var el = null;
    try {
      el = document.querySelector(id);
    } catch (err) {
      return;
    }
    if (!el) return;
    window.setTimeout(function () {
      el.scrollIntoView({ block: "center" });
      el.classList.add("destacado");
      window.setTimeout(function () {
        el.classList.remove("destacado");
      }, 3500);
    }, reducido ? 60 : 750);
  }

  function anio() {
    var nodos = document.querySelectorAll("[data-anio]");
    var actual = String(new Date().getFullYear());
    [].forEach.call(nodos, function (el) { el.textContent = actual; });
  }

  function iniciar() {
    cabecera();
    cursor();
    menu();
    revelar();
    lineas();
    filete();
    flotar();
    estado();
    transicion();
    platos();
    whatsapp();
    destino();
    anio();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
