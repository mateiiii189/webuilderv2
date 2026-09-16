/** Own reload restoration until the visitor actually navigates away. */
export const reloadScrollScript = `(() => {
  const key = () => 'webuilder:scroll:' + location.pathname;
  const navigation = performance.getEntriesByType('navigation')[0];
  const reloading = navigation && navigation.type === 'reload';
  let position = 0;
  let restoring = !!reloading;
  let frame = 0;

  // Fall back to native restoration if storage is unavailable.
  try {
    const stored = sessionStorage.getItem(key());
    const saved = Number(stored);
    if (Number.isFinite(saved) && saved >= 0) position = saved;
    sessionStorage.setItem(key(), stored ?? '0');
  } catch {
    history.scrollRestoration = 'auto';
    return;
  }

  history.scrollRestoration = reloading ? 'manual' : 'auto';

  const save = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (restoring) return;
    try {
      sessionStorage.setItem(key(), String(Math.max(0, window.scrollY)));
    } catch {}
  };

  // Keep the checkpoint current while scrolling, not only during page exit.
  window.addEventListener('scroll', () => {
    if (!restoring && !frame) frame = requestAnimationFrame(save);
  }, { passive: true });

  const allowHistoryRestoration = () => {
    restoring = false;
    history.scrollRestoration = 'auto';
  };

  // Next.js can leave this page without pagehide. Restore native ownership
  // before pushState snapshots the outgoing entry, not later in popstate.
  const pushState = history.pushState;
  history.pushState = function (...args) {
    const previousMode = history.scrollRestoration;
    const wasRestoring = restoring;
    allowHistoryRestoration();
    try {
      return pushState.apply(this, args);
    } catch (error) {
      history.scrollRestoration = previousMode;
      restoring = wasRestoring;
      throw error;
    }
  };

  window.addEventListener('pagehide', () => {
    save();
    // A later Back/Forward visit should retain native restoration.
    allowHistoryRestoration();
  });
  window.addEventListener('popstate', allowHistoryRestoration);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      allowHistoryRestoration();
      return;
    }
    if (!reloading) return;
    window.scrollTo({ top: position, behavior: 'instant' });
    restoring = false;
    // Do not switch to auto here: browser restoration can run after pageshow.
    save();
  });
})();`;
