/** Runs before hydration so native restoration cannot replay a stale section. */
export const reloadScrollScript = `(() => {
  const key = () => 'webuilder:scroll:' + location.pathname;
  const navigation = performance.getEntriesByType('navigation')[0];
  const reloading = navigation && navigation.type === 'reload';
  let position = 0;
  let restoring = !!reloading;

  if (reloading) {
    try {
      const saved = Number(sessionStorage.getItem(key()));
      if (Number.isFinite(saved) && saved >= 0) position = saved;
    } catch {}
    history.scrollRestoration = 'manual';
  }

  const save = () => {
    if (restoring) return;
    try { sessionStorage.setItem(key(), String(window.scrollY)); } catch {}
  };

  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      restoring = false;
      history.scrollRestoration = 'auto';
      return;
    }
    if (!reloading) return;
    window.scrollTo({ top: position, behavior: 'instant' });
    restoring = false;
    // Native restoration resumes for subsequent Back/Forward navigation.
    history.scrollRestoration = 'auto';
  });
})();`;
