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

// --- Marquee: keep the rolling band full on any screen width ---
// The track must be at least 2x the viewport wide, or the words run out
// and the band goes blank until the loop restarts. Clone until safe.
(function () {
  const band = document.querySelector(".hero__marquee");
  const track = document.querySelector(".marquee__track");
  if (!band || !track) return;
  const original = track.innerHTML;
  let guard = 0;
  while (track.scrollWidth < band.offsetWidth * 2 && guard < 8) {
    track.innerHTML += original;
    guard += 1;
  }
})();

// --- DealDesk console: shows how the tool tailors output per practice ---
// Mirrors the three practices in the live tool's rules engine.
(function () {
  const btnWrap = document.getElementById("practiceBtns");
  const fileList = document.getElementById("consoleFiles");
  const readout = document.getElementById("consoleReadout");
  if (!btnWrap || !fileList || !readout) return;

  const practices = {
    strategy: {
      readout: "Weighted toward growth, market position, and where the combined business should compete.",
      files: [
        ["Business summary", "docx", "Company overview, financial summary, recent news, and key people."],
        ["Interview guide", "docx", "Questions built around growth levers and competitive position."],
        ["Opportunity deck", "pptx", "Where to play and how to win, with an appendix matrix."],
        ["Excel model", "xlsx", "Projections plus a value creation view you can edit."]
      ]
    },
    operations: {
      readout: "Weighted toward capacity, cost programs, and the margin math underneath them.",
      files: [
        ["Business summary", "docx", "Overview with the cost structure and margin trend up front."],
        ["Interview guide", "docx", "Questions built around network capacity and cost programs."],
        ["Opportunity deck", "pptx", "Efficiency moves ranked by impact and ease of execution."],
        ["Excel model", "xlsx", "Cost lines held at current ratios, with savings scenarios."]
      ]
    },
    ma: {
      readout: "Weighted toward deal thesis, synergy ranges, and valuation sensitivity.",
      files: [
        ["Business summary", "docx", "Target overview written for a deal team, answer first."],
        ["Interview guide", "docx", "Diligence questions tailored to the deal type."],
        ["Synergy deck", "pptx", "Qualitative synergies with a summary slide that signposts the rest."],
        ["Excel model", "xlsx", "Three synergy scenarios and a valuation sensitivity grid."]
      ]
    }
  };

  function render(key) {
    const p = practices[key];
    fileList.innerHTML = p.files
      .map(function (f) {
        return (
          '<li><span class="file__name">' + f[0] + "</span>" +
          '<span class="file__ext">.' + f[1] + "</span>" +
          '<span class="file__desc">' + f[2] + "</span></li>"
        );
      })
      .join("");
    readout.textContent = p.readout;
  }

  btnWrap.querySelectorAll(".practice__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btnWrap.querySelectorAll(".practice__btn").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      render(btn.dataset.practice);
    });
  });

  render("strategy");
})();

// --- Signature piece: UPS diagnosis exhibit (interactive SVG chart) ---
// Figures match the UPS diagnosis model exactly (US Domestic Package,
// Q1 2025 to Q1 2026). Margins are adjusted operating profit / revenue.
//   ADV YoY:       n/a, -7.3%, -12.3%, -10.8%, -8.0%
//   RPP YoY:      +4.5%,  +5.5%,  +9.8%,  +8.3%, +6.5%
//   Adj op margin: 7.0%,   7.0%,   6.4%,  10.2%,  4.0%  (Q4 = holiday peak)
// Q1 2025 volume is null on purpose: the model does not verify it, so the
// chart shows a gap rather than asserting a number.
(function () {
  const svg = document.getElementById("exhibitChart");
  const readout = document.getElementById("exhibitReadout");
  const legend = document.getElementById("exhibitLegend");
  if (!svg || !readout || !legend) return;

  const labels = ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26"];
  const notes = ["", "", "", "holiday peak", ""];
  const series = {
    volume: { name: "Volume", color: "#ffad9b", unit: "% YoY",
              data: [null, -7.3, -12.3, -10.8, -8.0] },
    rpp:    { name: "Rev/piece", color: "#ffffff", unit: "% YoY",
              data: [4.5, 5.5, 9.8, 8.3, 6.5] },
    margin: { name: "Adj. margin", color: "#ff7759", unit: "%",
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
      stroke: isZero ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.12)",
      "stroke-width": isZero ? 1.5 : 1
    }));
    const t = el("text", { x: PAD.l - 8, y: y(v) + 4, "text-anchor": "end",
      fill: "rgba(255,255,255,.5)", "font-size": 11,
      "font-family": "IBM Plex Mono, monospace" });
    t.textContent = (v > 0 ? "+" : "") + v + "%";
    svg.appendChild(t);
  });

  // Quarter labels
  labels.forEach((lab, i) => {
    const t = el("text", { x: x(i), y: H - 12, "text-anchor": "middle",
      fill: "rgba(255,255,255,.55)", "font-size": 11,
      "font-family": "IBM Plex Mono, monospace" });
    t.textContent = lab;
    svg.appendChild(t);
  });

  // Series lines + dots
  const groups = {};
  for (const key in series) {
    const s = series[key];
    const g = el("g", { "data-series": key });
    // Nulls (unverified quarters) break the line rather than inventing a point
    const pts = s.data
      .map((v, i) => (v === null ? null : `${x(i)},${y(v)}`))
      .filter(Boolean)
      .join(" ");
    g.appendChild(el("polyline", { points: pts, fill: "none", stroke: s.color,
      "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    s.data.forEach((v, i) => {
      if (v === null) return;
      g.appendChild(el("circle", { cx: x(i), cy: y(v), r: 3.5, fill: s.color }));
    });
    svg.appendChild(g);
    groups[key] = g;
  }

  // Hover / tap: one hit zone per quarter
  const marker = el("line", { y1: PAD.t, y2: PAD.t + plotH,
    stroke: "rgba(255,173,155,.9)", "stroke-width": 1.5, opacity: 0 });
  svg.appendChild(marker);
  const baseText = readout.textContent;

  const fmt = (v, unit) =>
    v === null ? "n/a" : (v > 0 && unit.includes("YoY") ? "+" : "") + v + unit;
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
    ".section__head, .card, .post, .log__item, .featured__copy, .featured__interactive, .builtwith__card, .about__copy, .about__side"
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

  // Hiding is enabled only now that the script is running (see .js-reveal in CSS)
  document.documentElement.classList.add("js-reveal");

  let pending = targets.slice();
  let ticking = false;

  const revealAll = () => {
    targets.forEach((el) => el.classList.add("in"));
    pending = [];
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };

  const check = () => {
    ticking = false;
    const limit = window.innerHeight - 50;
    pending = pending.filter((el) => {
      // Reveal anything at or above the fold line, including elements
      // already scrolled past (negative top).
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

  // Failsafe: whatever has not revealed within 4 seconds gets shown anyway,
  // so a missed scroll event can never leave content invisible to a visitor.
  setTimeout(revealAll, 4000);
  window.addEventListener("beforeprint", revealAll);
})();

// --- Nav: soft shadow once the page is scrolled ---
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// --- Document preview: open deliverables in place instead of downloading ---
// Word, Excel, and PowerPoint files are rendered by Microsoft's free public
// document viewer, which needs a publicly reachable URL. On localhost (or if
// the viewer is unavailable) the links fall back to opening the file normally.
(function () {
  const modal = document.getElementById("previewModal");
  const frame = document.getElementById("previewFrame");
  const title = document.getElementById("previewTitle");
  const note = document.getElementById("previewNote");
  const dlBtn = document.getElementById("previewDownload");
  const closeBtn = document.getElementById("previewClose");
  const triggers = document.querySelectorAll("a[data-preview]");
  if (!modal || !frame || !triggers.length) return;

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  let lastFocus = null;

  const close = () => {
    modal.hidden = true;
    frame.src = "about:blank";
    document.body.classList.remove("preview-open");
    if (lastFocus) lastFocus.focus();
  };

  const open = (href, label, trigger) => {
    lastFocus = trigger;
    const fileUrl = new URL(href, location.href).href;
    title.textContent = label;
    dlBtn.href = fileUrl;
    if (isLocal) {
      // The viewer cannot reach a local address; skip the frame in local testing.
      note.innerHTML =
        'Document previews render on the published site. <a href="' +
        fileUrl +
        '" target="_blank" rel="noopener">Open this file directly</a>.';
      frame.src = "about:blank";
    } else {
      note.innerHTML =
        'Loading the preview. If it does not appear, <a href="' +
        fileUrl +
        '" target="_blank" rel="noopener">open the file directly</a>.';
      frame.src =
        "https://view.officeapps.live.com/op/embed.aspx?src=" +
        encodeURIComponent(fileUrl);
    }
    modal.hidden = false;
    document.body.classList.add("preview-open");
    closeBtn.focus();
  };

  triggers.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(a.getAttribute("href"), a.dataset.preview, a);
    });
  });

  closeBtn.addEventListener("click", close);
  modal.querySelector("[data-close]").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();

// --- Auto-update the footer year ---
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
