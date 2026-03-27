(() => {
  const header = document.getElementById("site-header");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header transparency -> solid on scroll
  const onScroll = () => {
    const solid = window.scrollY > 20;
    header?.classList.toggle("is-solid", solid);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Fade-in animations
  const animateEls = Array.from(document.querySelectorAll("[data-animate]"));
  if (prefersReducedMotion) {
    animateEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    animateEls.forEach((el) => io.observe(el));
  }

  // Stat counter animation (runs once per stat)
  const statValues = Array.from(document.querySelectorAll(".stat-value[data-target]"));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function animateStat(el) {
    if (el.dataset.done === "true") return;
    el.dataset.done = "true";

    const target = Number(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    const duration = Number(el.dataset.duration || "1200");

    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const start = performance.now();
    const from = 0;

    const frame = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const value = Math.round(from + (target - from) * eased);
      el.textContent = `${value}${suffix}`;

      if (t < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }

  if (statValues.length > 0) {
    const statsIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animateStat(entry.target);
          statsIo.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    statValues.forEach((el) => statsIo.observe(el));
  }

})();

