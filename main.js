(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SECTION_ORDER = ["hero", "about", "experience", "technologies", "ai-testing", "contact"];

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const header = document.getElementById("site-header");
  const headerHeight = () => (header ? header.offsetHeight : 80);

  const toggle = document.querySelector("[data-mobile-menu-toggle]");
  const panel = document.getElementById("mobile-menu");
  const closeBtn = document.querySelector("[data-mobile-menu-close]");

  let menuPreviouslyFocused = null;
  let menuKeydownHandler = null;

  function focusablesIn(el) {
    if (!el) return [];
    return Array.from(el.querySelectorAll('button[data-mobile-menu-close], nav a[href^="#"]'));
  }

  function isMenuOpen() {
    return panel?.classList.contains("is-open");
  }

  function setMobileMenuOpen(open) {
    if (!panel || !toggle) return;
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      menuPreviouslyFocused = document.activeElement;
      const focusables = focusablesIn(panel);
      const first = focusables[0];
      window.requestAnimationFrame(() => first?.focus());

      menuKeydownHandler = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setMobileMenuOpen(false);
          return;
        }
        if (e.key !== "Tab" || !isMenuOpen()) return;
        const items = focusablesIn(panel);
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      };
      panel.addEventListener("keydown", menuKeydownHandler);
    } else {
      if (menuKeydownHandler) {
        panel.removeEventListener("keydown", menuKeydownHandler);
        menuKeydownHandler = null;
      }
      const restore = menuPreviouslyFocused;
      menuPreviouslyFocused = null;
      if (restore && typeof restore.focus === "function") {
        window.requestAnimationFrame(() => restore.focus());
      }
    }
  }

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      setMobileMenuOpen(!isMenuOpen());
    });
    closeBtn?.addEventListener("click", () => {
      setMobileMenuOpen(false);
    });
    panel.querySelectorAll("nav a").forEach((a) => {
      a.addEventListener("click", () => {
        setMobileMenuOpen(false);
      });
    });
  }

  const contactForm = document.querySelector("#contact-form");
  const formStatusEl = document.getElementById("contact-form-status");
  const CONTACT_MAIL = "pablo.cespedc@gmail.com";

  function setFormStatus(message) {
    if (formStatusEl) formStatusEl.textContent = message;
  }

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    const fd = new FormData(contactForm);
    if (String(fd.get("_gotcha") || "").trim() !== "") {
      setFormStatus("");
      return;
    }

    const endpoint = (contactForm.getAttribute("data-form-endpoint") || "").trim();
    const btn = contactForm.querySelector('button[type="submit"]');
    const defaultLabel = btn?.textContent?.trim() || "Send message";

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const useHttpEndpoint = /^https:\/\//i.test(endpoint);
    if (useHttpEndpoint && btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
      setFormStatus("Sending your message.");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        let data = {};
        try {
          data = await res.json();
        } catch {
          /* non-JSON response */
        }
        if (res.ok) {
          btn.textContent = "Sent — thank you!";
          setFormStatus("Message sent successfully. Thank you.");
          contactForm.reset();
          window.setTimeout(() => {
            btn.textContent = defaultLabel;
            btn.disabled = false;
            setFormStatus("");
          }, 3500);
        } else {
          throw new Error((data && data.error) || "Request failed");
        }
      } catch {
        btn.textContent = "Couldn’t send — use email below";
        setFormStatus("Could not send the form. Please use the email address below.");
        window.setTimeout(() => {
          btn.textContent = defaultLabel;
          btn.disabled = false;
          setFormStatus("");
        }, 4500);
      }
      return;
    }

    setFormStatus("Opening your email app with the message.");
    const subject = encodeURIComponent(`Contact from ${name || "website"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${CONTACT_MAIL}?subject=${subject}&body=${body}`;
    window.setTimeout(() => setFormStatus(""), 3000);
  });

  function computeActiveSection() {
    const line = headerHeight() + 12;
    let active = "hero";
    for (const id of SECTION_ORDER) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) active = id;
    }
    return active;
  }

  function setActiveSection(id) {
    document.querySelectorAll("header nav a.nav-header-link").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });

    document.querySelectorAll("aside nav a.sidebar-nav-item").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });

    document.querySelectorAll("#mobile-menu nav a[data-section]").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });

    document.querySelectorAll(".nav-mobile-bottom-link[data-section]").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });
  }

  let navTicking = false;
  function updateNavFromScroll() {
    setActiveSection(computeActiveSection());
    navTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!navTicking) {
        navTicking = true;
        requestAnimationFrame(updateNavFromScroll);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateNavFromScroll, { passive: true });
  updateNavFromScroll();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.length < 2) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    a.addEventListener("click", (e) => {
      if (reduceMotion) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
      requestAnimationFrame(updateNavFromScroll);
    });
  });
})();
