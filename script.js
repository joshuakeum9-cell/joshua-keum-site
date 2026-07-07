/* =========================================================
   PORTFOLIO — script.js
   Small, dependency-free interactions.
   ========================================================= */

// --- Mobile nav toggle ---
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  // Close the menu when a link is tapped
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// --- Signature piece: UPS diagnosis exhibit (interactive SVG chart) ---
// All figures verified against UPS quarterly earnings releases /
// earnings calls (US Domestic Package segment, Q1 2025 – Q1 2026):
//   ADV YoY:      -3.5%, -7.3%, -12.3%, -10.8%, -8.0%
//   RPP YoY:      +4.5%, +5.5%, +9.8%, +8.3%, +6.5%
//   Adj op margin: 7.0%,  7.0%,  6.4%, 10.2%,  4.0%  (Q4 = holiday peak)
(function () {
  const svg = document.getElementById("exhibitChart");
  const readout = document.getElementById("exhibitReadout");
  const legend = document.getElementById("exhibitLegend");
  if (!svg || !readout || !legend) return;

  const labels = ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26"];
  const notes = ["", "", "", "holiday peak", ""];
  const series = {
    volume: { name: "Volume", color: "#E8B04B", unit: "% YoY",
              data: [-3.5, -7.3, -12.3, -10.8, -8.0] },
    rpp:    { name: "Rev/piece", color: "#FAF8F4", unit: "% YoY",
              data: [4.5, 5.5, 9.8, 8.3, 6.5] },
    margin: { name: "Adj. margin", color: "#FF8B66", unit: "%",
              data: [7.0, 7.0, 6.4, 10.2, 4.0] }
  };

  // One shared percent axis for all three series
  const MIN = -16, MAX = 14;
  const W = 560, H = 290, PAD = { t: 16, r: 30, b: 34, l: 44 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (plotW * i) / (labels.length - 1);
  const y = (v) => PAD.t + plotH - (plotH * (v - MIN)) / (MAX - MIN);
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  };

  // Horizontal percent gridlines
  [-15, -10, -5, 0, 5, 10].forEach((v) => {
    const isZero = v === 0;
    svg.appendChild(el("line", {
      x1: PAD.l, y1: y(v), x2: W - PAD.r, y2: y(v),
      stroke: isZero ? "rgba(250,249,246,.4)" : "rgba(250,249,246,.12)",
      "stroke-width": isZero ? 1.5 : 1
    }));
    const t = el("text", { x: PAD.l - 8, y: y(v) + 4, "text-anchor": "end",
      fill: "rgba(250,249,246,.5)", "font-size": 11,
      "font-family": "IBM Plex Mono, monospace" });
    t.textContent = (v > 0 ? "+" : "") + v + "%";
    svg.appendChild(t);
  });

  // Quarter labels
  labels.forEach((lab, i) => {
    const t = el("text", { x: x(i), y: H - 12, "text-anchor": "middle",
      fill: "rgba(250,249,246,.55)", "font-size": 11,
      "font-family": "IBM Plex Mono, monospace" });
    t.textContent = lab;
    svg.appendChild(t);
  });

  // Series lines + dots
  const groups = {};
  for (const key in series) {
    const s = series[key];
    const g = el("g", { "data-series": key });
    const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    g.appendChild(el("polyline", { points: pts, fill: "none", stroke: s.color,
      "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    s.data.forEach((v, i) => {
      g.appendChild(el("circle", { cx: x(i), cy: y(v), r: 3.5, fill: s.color }));
    });
    svg.appendChild(g);
    groups[key] = g;
  }

  // Hover / tap: one hit zone per quarter
  const marker = el("line", { y1: PAD.t, y2: PAD.t + plotH,
    stroke: "rgba(199,154,74,.9)", "stroke-width": 1.5, opacity: 0 });
  svg.appendChild(marker);
  const baseText = readout.textContent;

  const fmt = (v, unit) => (v > 0 && unit.includes("YoY") ? "+" : "") + v + unit;
  const show = (i) => {
    marker.setAttribute("x1", x(i));
    marker.setAttribute("x2", x(i));
    marker.setAttribute("opacity", 1);
    const parts = [];
    for (const key in series) {
      if (groups[key].style.display === "none") continue;
      const s = series[key];
      parts.push(`${s.name} ${fmt(s.data[i], s.unit)}`);
    }
    const note = notes[i] ? ` (${notes[i]})` : "";
    readout.textContent = `${labels[i]}${note}: ${parts.join(" · ")}`;
  };
  const hide = () => { marker.setAttribute("opacity", 0); readout.textContent = baseText; };

  labels.forEach((_, i) => {
    const zone = el("rect", {
      x: x(i) - plotW / (labels.length - 1) / 2, y: PAD.t,
      width: plotW / (labels.length - 1), height: plotH,
      fill: "transparent", style: "cursor:pointer"
    });
    zone.addEventListener("mouseenter", () => show(i));
    zone.addEventListener("click", () => show(i));
    svg.appendChild(zone);
  });
  svg.addEventListener("mouseleave", hide);

  // Legend: toggle series on/off
  legend.querySelectorAll(".legend__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.series;
      const off = btn.classList.toggle("off");
      groups[key].style.display = off ? "none" : "";
    });
  });
})();

// --- Scroll-reveal: sections and cards rise into view ---
// Applied via JS so nothing is hidden if JavaScript is unavailable.
// Uses simple viewport checks (rAF-throttled) for maximum compatibility.
(function () {
  const targets = Array.from(document.querySelectorAll(
    ".section__head, .card, .post, .log__item, .featured__copy, .featured__interactive, .builtwith__card, .about__photo, .about__copy"
  ));
  if (!targets.length) return;

  targets.forEach((el) => el.classList.add("reveal"));

  // Gentle stagger for grid cards and list rows
  document.querySelectorAll(".work__grid .card").forEach((el, i) => {
    el.style.transitionDelay = (i % 2) * 90 + "ms";
  });
  document.querySelectorAll(".log__item, .post").forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 70 + "ms";
  });

  let pending = targets.slice();
  let ticking = false;

  const check = () => {
    ticking = false;
    const limit = window.innerHeight - 50;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("in");
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(check);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  check(); // reveal anything already in view on load
})();

// --- Nav: soft shadow once the page is scrolled ---
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// --- Auto-update the footer year ---
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
