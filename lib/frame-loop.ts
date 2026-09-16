type FrameClock = {
  request: (callback: (time: number) => void) => number;
  cancel: (handle: number) => void;
  now: () => number;
  visible: () => boolean;
};

export function createFrameLoop(
  render: (delta: number) => void,
  clock: FrameClock,
) {
  let started = false;
  let destroyed = false;
  let inView = true;

  let handle: number | null = null;
  let previous = clock.now();

  const running = () =>
    started &&
    inView &&
    clock.visible() &&
    !destroyed;

  function schedule() {
    if (running() && handle === null) {
      handle = clock.request(tick);
    }
  }

  function tick(now: number) {
    handle = null;

    if (destroyed) return;

    const delta = running()
      ? Math.min(
          Math.max((now - previous) / 1000, 0),
          0.05,
        )
      : 0;

    previous = now;

    render(delta);
    schedule();
  }

  function refresh() {
    if (destroyed) return;

    if (handle !== null) {
      clock.cancel(handle);
    }

    handle = null;
    previous = clock.now();

    render(0);
    schedule();
  }

  return {
    start() {
      if (started || destroyed) return;

      started = true;
      refresh();
    },

    setInView(value: boolean) {
      inView = value;
      refresh();
    },

    refresh,

    destroy() {
      destroyed = true;

      if (handle !== null) {
        clock.cancel(handle);
      }

      handle = null;
    },
  };
}