// /js/log.js

window.MSPFA_LOG = (() => {
  async function build(container) {
    container.innerHTML = '';

    const visits = MSPFA_STATE.getVisited();

    if (!visits.length) {
      container.innerHTML = '<div class="empty">No pages read yet.</div>';
      return;
    }

    // Use each page's current title/date so renames show up in the log.
    // Falls back to what was saved if the page or the index isn't available.
    let current = new Map();
    try {
      current = new Map((await MSPFA_INDEX.load()).map(p => [p.page, p]));
    } catch (e) {
      console.warn('Could not load page index for log', e);
    }

    [...visits]
      .map(v => ({
        ...v,
        title: current.get(v.page)?.title || v.title,
        timestamp: current.get(v.page)?.timestamp || v.timestamp,
      }))
      .sort((a, b) => b.page - a.page)
      .forEach(v => {
        const line = document.createElement('div');
        line.className = 'entry';

        line.innerHTML = `
          <div class="when">${fmtDate(v.timestamp)}</div>
          <a href="index.html?p=${v.page}">${v.title || '==>'}</a>
        `;

        container.appendChild(line);
      });
  }

  return { build };
})();