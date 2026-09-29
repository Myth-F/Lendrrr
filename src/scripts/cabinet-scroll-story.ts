import { cabinetStoryChapter } from '../data/cabinet-story';
import { CabinetFrameCache } from './cabinet-frame-cache';

type SequenceVariant = { width: number; height: number; frames: string[] };
type SequenceManifest = { variants: { desktop: SequenceVariant; mobile: SequenceVariant } };

const root = document.querySelector<HTMLElement>('[data-scroll-story]');
if (root) {
  const stage = root.querySelector<HTMLElement>('[data-story-stage]');
  const visual = root.querySelector<HTMLElement>('[data-story-visual]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-story-canvas]');
  const indexLabel = root.querySelector<HTMLElement>('[data-story-index]');
  const title = root.querySelector<HTMLElement>('[data-story-title]');
  const body = root.querySelector<HTMLElement>('[data-story-body]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const manifestUrl = root.dataset.manifest;
  const controls = root.querySelector<HTMLElement>('[data-story-controls]');
  const enableButton = root.querySelector<HTMLButtonElement>('[data-story-enable]');
  const status = root.querySelector<HTMLElement>('[data-story-status]');
  let explicitMotion = false;
  let cache: CabinetFrameCache | undefined;
  let variant: SequenceVariant | undefined;
  let manifestData: SequenceManifest | undefined;
  let variantKey: 'desktop' | 'mobile' = 'desktop';
  let raf = 0;
  let lastRequested = 0;
  let lastDisplayed = -1;
  let modeEnabled = false;
  let closed = false;
  let nearby = false;
  let starting = false;
  let priming = false;
  let startFailed = false;
  let initialFrame: CanvasImageSource | undefined;
  let primeInitial: ((selected: SequenceVariant, frameCache: CabinetFrameCache) => void) | undefined;

  const isMobile = () => matchMedia('(max-width: 767px)').matches;
  const isSafeToAnimate = () => explicitMotion || (!reducedMotion.matches
    && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const showControls = (message: string) => {
    if (controls) controls.hidden = false;
    if (status) status.textContent = message;
  };
  if (!isSafeToAnimate()) showControls('Votre navigateur privilégie une présentation statique. Vous pouvez activer la vue éclatée au défilement.');

  const setChapter = (frameIndex: number) => {
    if (!variant?.frames.length || !indexLabel || !title || !body) return;
    const progress = frameIndex / Math.max(1, variant.frames.length - 1);
    const chapter = cabinetStoryChapter(progress);
    indexLabel.textContent = chapter.index;
    title.textContent = chapter.title;
    body.textContent = chapter.body;
  };

  const draw = (frame: CanvasImageSource, width: number, height: number, frameIndex: number) => {
    if (!canvas || !visual) return;
    const rect = visual.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const renderScale = Math.min(dpr, width / rect.width, height / rect.height);
    const bufferWidth = Math.max(1, Math.round(rect.width * renderScale));
    const bufferHeight = Math.max(1, Math.round(rect.height * renderScale));
    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
    }
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / width, canvas.height / height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    context.drawImage(frame, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
    canvas.dataset.frameIndex = String(frameIndex);
    root.dataset.canvasReady = 'true';
  };

  const schedule = () => {
    if (closed || document.hidden) return;
    if (!modeEnabled) {
      if (nearby && !cache && !starting && !startFailed && isSafeToAnimate()) void start();
      if (nearby && cache && variant && !initialFrame) primeInitial?.(variant, cache);
      if (cache && variant && initialFrame) activate();
      if (!modeEnabled) return;
    }
    if (!cache || !variant || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!root || !stage || !variant || !cache) return;
      const scrollable = Math.max(1, root.offsetHeight - stage.clientHeight);
      const progress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / scrollable));
      const requested = Math.round(progress * (variant.frames.length - 1));
      const direction = requested >= lastRequested ? 1 : -1;
      lastRequested = requested;
      void cache.setWindow(requested, direction).then((frame) => {
        const stillOnPath = requested === lastRequested
          || (direction > 0 && requested > lastDisplayed && requested < lastRequested && lastRequested - requested <= 10)
          || (direction < 0 && requested < lastDisplayed && requested > lastRequested && requested - lastRequested <= 10);
        if (!frame || closed || !stillOnPath || !variant) return;
        draw(frame, variant.width, variant.height, requested);
        lastDisplayed = requested;
        setChapter(lastDisplayed);
      });
    });
  };

  const activate = (): boolean => {
    if (!stage || !isSafeToAnimate() || modeEnabled || !variant || !cache || !initialFrame) return false;
    // Warm the first frames early, but only change section height as it enters view.
    const bounds = root.getBoundingClientRect();
    if (bounds.top > window.innerHeight * 0.72 || bounds.bottom <= 0) return false;
    root.dataset.mode = 'enhanced';
    modeEnabled = true;
    lastDisplayed = 0;
    setChapter(0);
    draw(initialFrame, variant.width, variant.height, 0);
    schedule();
    return true;
  };

  primeInitial = (selected, frameCache) => {
    if (priming || closed || !nearby || !isSafeToAnimate()) return;
    priming = true;
    void (async () => {
      const firstFrame = await frameCache.setWindow(0, 1);
      const secondFrame = selected.frames.length > 1 ? await frameCache.get(1, 1) : firstFrame;
      if (!firstFrame || !secondFrame || closed || frameCache !== cache || !isSafeToAnimate()) return;
      initialFrame = firstFrame;
      activate();
    })().catch(() => {}).finally(() => { priming = false; });
  };

  const start = async () => {
    if (!isSafeToAnimate() || !manifestUrl || closed || starting || cache || startFailed) return;
    starting = true;
    try {
      const response = await fetch(manifestUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Sequence manifest: ${response.status}`);
      const manifest = await response.json() as SequenceManifest;
      manifestData = manifest;
      variantKey = isMobile() ? 'mobile' : 'desktop';
      const selected = manifest.variants[variantKey];
      if (!selected?.frames?.length) throw new Error('Empty cabinet frame sequence');
      const frameCache = new CabinetFrameCache(selected.frames, variantKey === 'mobile' ? 4 : 6);
      const first = frameCache.setWindow(0, 1);
      const firstFrame = await first;
      const secondFrame = selected.frames.length > 1 ? await frameCache.get(1, 1) : firstFrame;
      if (!firstFrame || !secondFrame || closed || !isSafeToAnimate()) {
        frameCache.clear();
        if (!closed && isSafeToAnimate()) throw new Error('Unable to decode cabinet frames');
        return;
      }
      variant = selected;
      cache = frameCache;
      initialFrame = firstFrame;
      if (!nearby) cache.pause();
      else frameCache.warmHttpCache();
      activate();
    } catch {
      // Keep the server-rendered three-pose story if fetching or decoding fails.
      startFailed = true;
      showControls('La séquence n’a pas pu être chargée. Réessayez pour afficher la vue éclatée.');
    } finally {
      starting = false;
    }
  };

  enableButton?.addEventListener('click', async () => {
    explicitMotion = true;
    startFailed = false;
    nearby = true;
    enableButton.disabled = true;
    if (status) status.textContent = 'Chargement de la vue éclatée…';
    try {
      if (cache) { cache.resume(); schedule(); }
      else await start();
    } finally { enableButton.disabled = false; }
  });

  const visibility = () => {
    if (document.hidden) cache?.pause();
    else if (nearby) { cache?.resume(); schedule(); }
  };

  const resize = () => {
    if (!manifestData) { schedule(); return; }
    const nextKey = isMobile() ? 'mobile' : 'desktop';
    if (nextKey === variantKey) { schedule(); return; }
    const nextVariant = manifestData.variants[nextKey];
    if (!nextVariant?.frames.length) return;
    const wasEnabled = modeEnabled;
    cache?.clear();
    variantKey = nextKey;
    variant = nextVariant;
    cache = new CabinetFrameCache(nextVariant.frames, nextKey === 'mobile' ? 4 : 6);
    if (!nearby || document.hidden) cache.pause();
    initialFrame = undefined;
    delete root.dataset.canvasReady;
    if (!wasEnabled) {
      modeEnabled = false;
      root.dataset.mode = 'static';
      schedule();
      return;
    }
    requestAnimationFrame(() => {
      if (!root || !stage || !cache || !variant) return;
      const scrollable = Math.max(1, root.offsetHeight - stage.clientHeight);
      const progress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / scrollable));
      const requested = Math.round(progress * (variant.frames.length - 1));
      lastRequested = requested;
      void cache.setWindow(requested, 1).then((frame) => {
        if (frame && requested === lastRequested && variant) draw(frame, variant.width, variant.height, requested);
      });
    });
  };

  if (root && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      nearby = entry.isIntersecting;
      if (nearby && isSafeToAnimate()) {
        if (!cache) void start();
        else { cache.resume(); schedule(); }
      } else if (cache) cache.pause();
    }, { rootMargin: '180% 0px' });
    observer.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', () => {
      closed = true;
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      cache?.clear();
      root.dataset.mode = 'static';
      delete root.dataset.canvasReady;
    }, { once: true });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches && !explicitMotion) {
        modeEnabled = false;
        root.dataset.mode = 'static';
        delete root.dataset.canvasReady;
        cache?.clear();
        cache = undefined;
        initialFrame = undefined;
        showControls('Votre navigateur privilégie une présentation statique. Vous pouvez activer la vue éclatée au défilement.');
      } else if (nearby) {
        startFailed = false;
        void start();
      }
    });
  }
}
