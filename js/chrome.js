// /js/chrome.js — shared header, nav and footer. Edit SITE to rebrand.
const SITE = {
  name: 'Paraquel',
  // [label, href]
  nav: [
    ['First page', 'index.html?p=1'],
    ['Log', 'log.html'],
    ['Search', 'search.html'],
    // ['Discord', 'https://...'],
  ],
  credit: 'Paraquel is a fan-made webcomic inspired by <a href="https://www.prequeladventure.com/" target="_blank" rel="noopener">Prequel</a> by Kazerad and Ch\'marr. Original UI layout belongs to © MS Paint Fan Adventures. Built on <a href="https://github.com/noelledotjpg/MSPSA" target="_blank" rel="noopener">MSPSA</a>.',
};

// "Sep 29 2026" -> { mon: 'Sep', day: 29, suf: 'th', year: '2026' }
const dateParts = s => {
  const m = String(s || '').match(/^([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
  if (!m) return null;
  const d = +m[2];
  const suf = (d % 100 >= 11 && d % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[d % 10] || 'th');
  return { mon: m[1], day: d, suf, year: m[3] };
};

// "Sep 29th 2026" (used by log + search)
const fmtDate = s => {
  const d = dateParts(s);
  return d ? `${d.mon} ${d.day}${d.suf} ${d.year}` : (s || '');
};

const CHROME = (() => {
  function mount() {
    const head = document.getElementById('site-header');
    if (head) {
      const here = location.pathname.split('/').pop() || 'index.html';
      const links = SITE.nav
        .map(([t, h]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ''}>${t}</a>`)
        .join('<span class="vbar" aria-hidden="true"></span>');
      head.innerHTML = `
        <div class="umcontainer titlecard">
          <a href="index.html?p=1" class="logo-link">
            <img src="assets/images/logo.png" alt="${SITE.name}" width="600" height="131">
          </a>
        </div>
        <nav>${links}</nav>`;
    }
    const foot = document.getElementById('site-footer');
    if (foot) foot.innerHTML = `
      <div class="umcontainer titlecard">
        <a href="index.html?p=1" class="logo-link">
          <img src="assets/images/logo_small.png" alt="${SITE.name}" width="280" height="55">
        </a>
      </div>
      <div id="details" style="padding-top:6px;">${SITE.credit}</div>`;
  }
  return { mount };
})();