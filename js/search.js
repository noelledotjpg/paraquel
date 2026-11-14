window.MSPFA_SEARCH = (() => {
  function render(container, pages, query = '') {
    container.innerHTML = '';
    const q = query.trim().toLowerCase();

    if (q) {
      const n = pages.filter(p => p.text.toLowerCase().includes(q)).length;
      const count = document.createElement('div');
      count.className = 'count';
      count.textContent = n ? `${n} ${n === 1 ? 'match' : 'matches'}` : 'No matches';
      container.appendChild(count);
    }

    pages.forEach(p => {
      const i = q ? p.text.toLowerCase().indexOf(q) : -1;
      const entry = document.createElement('div');
      entry.className = 'entry' + (q && i < 0 ? ' dim' : '');

      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = fmtDate(p.timestamp);

      const link = document.createElement('a');
      link.href = `index.html?p=${p.page}`;
      link.textContent = p.title;

      const snip = document.createElement('div');
      snip.className = 'snippet';
      if (i >= 0) {
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        snip.innerHTML = esc(p.text.slice(Math.max(0, i - 40), i)) +
          `<mark>${esc(p.text.slice(i, i + q.length))}</mark>` +
          esc(p.text.slice(i + q.length, i + q.length + 120)) + '…';
      } else {
        snip.textContent = p.text.slice(0, 160) + '…';
      }

      entry.append(when, link, snip);
      container.appendChild(entry);
    });
  }

  async function init(container) { render(container, await MSPFA_INDEX.load()); }
  async function search(query, container) { render(container, await MSPFA_INDEX.load(), query); }
  return { init, search };
})();