(function () {
  const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

  function freezeMotionStyles() {
    document.querySelectorAll("[data-reveal-x]").forEach((el) => el.classList.add("is-revealed"));
    document.querySelectorAll("[data-parallax-x], [data-section-parallax], [data-marquee-scroll]").forEach((el) => {
      el.style.transform = "";
    });
  }

  reduceMotionMq.addEventListener("change", (e) => {
    if (e.matches) freezeMotionStyles();
  });

  if (reduceMotionMq.matches) {
    freezeMotionStyles();
    return;
  }

  let scrollY = 0;
  let marqueeX = 0;
  let animActive = false;

  function motionReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function readScroll() {
    scrollY = window.scrollY || document.documentElement.scrollTop;
  }

  function applyParallax() {
    if (motionReduced()) return;
    document.querySelectorAll("[data-parallax-x]").forEach((el) => {
      const factor = parseFloat(el.getAttribute("data-parallax-x"), 10) || 0;
      const offset = scrollY * factor;
      el.style.transform = `translate3d(${offset}px, 0, 0)`;
    });
  }

  function applySectionParallax() {
    if (motionReduced()) return;
    document.querySelectorAll("[data-section-parallax]").forEach((el) => {
      const section = document.querySelector(el.getAttribute("data-section-parallax"));
      if (!section) return;
      const factor = parseFloat(el.getAttribute("data-section-factor"), 10) || 0.15;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const progress = (vh / 2 - center) / (vh + rect.height);
      const offset = progress * 120 * factor;
      el.style.transform = `translate3d(${offset}px, 0, 0)`;
    });
  }

  function computeMarqueeTarget(el) {
    const speed = parseFloat(el.getAttribute("data-marquee-speed"), 10) || 0.35;
    const clip = el.closest(".marquee-scroll-clip");
    let relative = scrollY;
    if (clip) {
      const rect = clip.getBoundingClientRect();
      const clipTopDoc = scrollY + rect.top;
      const vh = window.innerHeight;
      const anchorRatio = parseFloat(el.getAttribute("data-marquee-anchor-vh"), 10);
      const ratio = Number.isFinite(anchorRatio) ? anchorRatio : 0.82;
      const anchor = clipTopDoc - vh * ratio;
      relative = Math.max(0, scrollY - anchor);
    }
    return -relative * speed;
  }

  function applyMarqueeSmooth() {
    if (motionReduced()) return false;
    const el = document.querySelector("[data-marquee-scroll]");
    if (!el) return false;
    const dampAttr = parseFloat(el.getAttribute("data-marquee-damp"), 10);
    const damp = Number.isFinite(dampAttr) ? dampAttr : 0.14;
    const target = computeMarqueeTarget(el);
    marqueeX += (target - marqueeX) * damp;
    el.style.transform = `translate3d(${marqueeX}px, 0, 0)`;
    return Math.abs(target - marqueeX) > 0.06;
  }

  function frame() {
    if (motionReduced()) {
      animActive = false;
      return;
    }
    readScroll();
    applyParallax();
    applySectionParallax();
    const marqueeFollow = applyMarqueeSmooth();

    if (marqueeFollow) {
      requestAnimationFrame(frame);
    } else {
      animActive = false;
    }
  }

  function kick() {
    if (motionReduced()) return;
    if (!animActive) {
      animActive = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  kick();

  const revealEls = document.querySelectorAll("[data-reveal-x]");
  if (!revealEls.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  revealEls.forEach((el) => io.observe(el));
})();
