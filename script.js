const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Mouse reactive glow (updates CSS variables)
let raf = 0;
window.addEventListener(
  "pointermove",
  (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mx", `${x}%`);
      document.documentElement.style.setProperty("--my", `${y}%`);
    });
  },
  { passive: true }
);

// Mobile nav
const menuToggle = $(".menu-toggle");
const navWrap = $(".nav-links-wrap");
const navLinks = $$(".nav-link");

function setMenuOpen(open) {
  if (!menuToggle || !navWrap) return;
  navWrap.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

if (menuToggle && navWrap) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!navWrap.classList.contains("open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
      setMenuOpen(false);
    });
  });

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 820) setMenuOpen(false);
    },
    { passive: true }
  );

  document.addEventListener("click", (e) => {
    if (!navWrap.classList.contains("open")) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(".navbar")) return;
    setMenuOpen(false);
  });
}

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
);
$$(".reveal").forEach((el) => revealObserver.observe(el));

// Active nav + pill
const pill = $(".nav-active-pill");

function setActiveLink(el) {
  if (!el) return;
  navLinks.forEach((a) => a.classList.toggle("is-active", a === el));

  if (!pill) return;
  const parent = el.closest(".nav-links-inner");
  if (!parent) return;
  const parentRect = parent.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const x = rect.left - parentRect.left;
  pill.style.setProperty("--pill-x", `${x}px`);
  pill.style.width = `${rect.width}px`;
}

function initPill() {
  if (!navLinks.length) return;
  const current = navLinks.find((a) => a.getAttribute("href") === "#home") || navLinks[0];
  setActiveLink(current);
}

initPill();
window.addEventListener("resize", () => initPill(), { passive: true });

const sectionIds = navLinks
  .map((a) => (a.getAttribute("href") || "").replace("#", ""))
  .filter(Boolean);

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter((el) => el && el.tagName);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    const link = navLinks.find((a) => a.getAttribute("href") === `#${id}`);
    if (link) setActiveLink(link);
  },
  { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -55% 0px" }
);

sections.forEach((s) => sectionObserver.observe(s));

// Testimonials carousel
const track = $("[data-carousel-track]");
const dotsWrap = $("[data-carousel-dots]");
const nextBtn = $("[data-carousel='next']");
const prevBtn = $("[data-carousel='prev']");
const slides = track ? $$(".testimonial-card", track) : [];
let idx = 0;
let autoplayTimer = 0;

function goTo(i, { focus = false } = {}) {
  if (!track || slides.length === 0) return;
  idx = (i + slides.length) % slides.length;
  track.style.transform = `translateX(${-idx * 100}%)`;
  if (dotsWrap) {
    $$(".t-dot", dotsWrap).forEach((d, di) => d.setAttribute("aria-current", di === idx ? "true" : "false"));
  }
  if (focus && slides[idx]) slides[idx].focus?.();
}

function buildDots() {
  if (!dotsWrap || slides.length === 0) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "t-dot";
    b.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    b.setAttribute("aria-current", i === idx ? "true" : "false");
    b.addEventListener("click", () => {
      stopAutoplay();
      goTo(i);
      startAutoplay();
    });
    dotsWrap.appendChild(b);
  });
}

function startAutoplay() {
  stopAutoplay();
  autoplayTimer = window.setInterval(() => goTo(idx + 1), 6500);
}

function stopAutoplay() {
  if (!autoplayTimer) return;
  window.clearInterval(autoplayTimer);
  autoplayTimer = 0;
}

if (track && slides.length) {
  buildDots();
  goTo(0);
  startAutoplay();

  nextBtn?.addEventListener("click", () => {
    stopAutoplay();
    goTo(idx + 1);
    startAutoplay();
  });
  prevBtn?.addEventListener("click", () => {
    stopAutoplay();
    goTo(idx - 1);
    startAutoplay();
  });

  track.addEventListener("pointerenter", stopAutoplay);
  track.addEventListener("pointerleave", startAutoplay);
}

// Demo contact form (prevent navigation)
const form = $(".contact-form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = $(".submit", form);
  if (btn) {
    const prev = btn.textContent;
    btn.textContent = "Sent (demo)";
    btn.setAttribute("disabled", "true");
    window.setTimeout(() => {
      btn.textContent = prev || "Send Message";
      btn.removeAttribute("disabled");
      form.reset();
    }, 1800);
  }
});
