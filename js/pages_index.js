// /js/pages_index.js — loads assets/pages/index.json5 and every page's summary once.
window.MSPFA_INDEX = (() => {
  let cache = null;

  function textOf(blocks = []) {
    return blocks.map(b => {
      if (b.type === 'text') return (Array.isArray(b.html) ? b.html.join(' ') : b.html || '').replace(/<[^>]+>/g, '');
      if (b.type === 'suggestions') return (b.items || []).map(i => i.text).join(' ');
      if (b.type === 'spoiler') return textOf(b.children);
      return '';
    }).join(' ').replace(/\s+/g, ' ').trim();
  }

  async function load() {
    if (cache) return cache;
    const idx = JSON5.parse(await (await fetch('assets/pages/index.json5')).text());
    const jobs = [];
    for (const [chapter, nums] of Object.entries(idx.chapters || {})) {
      for (const n of nums) {
        jobs.push(fetch(`assets/pages/${chapter}/${n}.json5`)
          .then(r => r.text()).then(t => JSON5.parse(t))
          .then(d => ({
            page: d.meta?.page ?? n,
            timestamp: d.meta?.timestamp ?? '',
            title: d.command || d.title || '',
            text: textOf(d.content?.blocks),
          })).catch(() => null));
      }
    }
    cache = (await Promise.all(jobs)).filter(Boolean).sort((a, b) => a.page - b.page);
    return cache;
  }

  return { load };
})();
