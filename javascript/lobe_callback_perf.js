/* Local, opt-in callback timings. Never reads prompts, model names or settings. */
(() => {
    if (!new URLSearchParams(location.search).has('lobe_perf')) return;
    const wrapped = new WeakSet();
    const timings = new Map();
    const wrapQueue = (queue, kind) => {
        queue.forEach((callback, index) => {
            if (wrapped.has(callback)) return;
            const id = `${kind}:${index}:${callback.name || 'anonymous'}`;
            const measured = function (...args) {
                const start = performance.now();
                try {
                    return callback.apply(this, args);
                } finally {
                    const elapsed = performance.now() - start;
                    if (elapsed >= 10) {
                        const previous = timings.get(id);
                        timings.set(id, {
                            id,
                            calls: (previous?.calls || 0) + 1,
                            maxMs: Math.max(previous?.maxMs || 0, Math.round(elapsed)),
                            totalMs: (previous?.totalMs || 0) + Math.round(elapsed),
                            source: String(callback).slice(0, 180),
                        });
                        document.documentElement.setAttribute('data-lobe-callback-report', JSON.stringify([...timings.values()].sort((a, b) => b.totalMs - a.totalMs).slice(0, 10)));
                    }
                }
            };
            wrapped.add(measured);
            queue[index] = measured;
        });
    };
    const install = () => {
        if (typeof uiUpdateCallbacks !== 'undefined') wrapQueue(uiUpdateCallbacks, 'update');
        if (typeof uiAfterUpdateCallbacks !== 'undefined') wrapQueue(uiAfterUpdateCallbacks, 'after');
        if (typeof uiTabChangeCallbacks !== 'undefined') wrapQueue(uiTabChangeCallbacks, 'tab');
    };
    install();
    if (typeof onUiLoaded === 'function') onUiLoaded(install);
    setTimeout(install, 3000);
})();
