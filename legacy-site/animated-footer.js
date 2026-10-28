(() => {
  const year = document.getElementById('tt-year');
  if (year) year.textContent = String(new Date().getFullYear());
  const items = document.querySelectorAll('.tt-reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('tt-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('tt-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  items.forEach(el => observer.observe(el));
})();
