const params = new URLSearchParams(window.location.search);
const pageNum = params.get('p') || '1';
const PAGE_PATH = `assets/pages/chapter-1/${pageNum}.json5`;

CHROME.mount();

fetch(PAGE_PATH + '?v=' + Date.now())
  .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
  .then(t => JSON5.parse(t))
  .then(d => renderPage(d))
  .catch(() => {
    document.title = 'Dead End ~ ' + SITE.name.toUpperCase();
    document.getElementById('command-text').textContent = 'Dead End';
    document.getElementById('page-content').innerHTML =
      '<p>This page doesn\'t exist yet. Sorry!</p>'+
      '<img src="assets/images/deadend.png"></img>';
    buildPager();
    buildLatest();
  });

function extractTextFromBlocks(blocks) {
  let out = [];

  blocks.forEach(block => {
    if (block.type === 'text' && Array.isArray(block.html)) {
      out.push(block.html.join(' ').replace(/<[^>]+>/g, ''));
    }

    if (block.type === 'spoiler' && block.children) {
      out.push(extractTextFromBlocks(block.children));
    }
  });

  return out.join(' ').trim();
}

function renderPage(data) {
  document.title = (data.title || 'Page') + ' ~ ' + SITE.name.toUpperCase();
  document.getElementById('command-text').textContent = data.command || '';
  const dateBox = document.getElementById('pagedate');
  const dp = dateParts(data.meta?.timestamp);
  dateBox.innerHTML = dp
    ? `<span class="d-mon">${dp.mon}</span><span class="d-day">${dp.day}<sup>${dp.suf}</sup></span><span class="d-year">${dp.year}</span>`
    : '';

  const content = document.getElementById('page-content');
  content.innerHTML = '';

  data.content?.blocks?.forEach(block =>
    renderBlock(block, content, data)
  );

  const meta = data.meta || {};
  const pageText = extractTextFromBlocks(data.content?.blocks || []);

  MSPFA_STATE.logPageVisit(
    meta.page,
    data.command || data.title,
    meta.timestamp,
    pageText
  );

  buildPager();
  buildLatest();
}

function buildPager() {
  const n = Number(pageNum);
  const nextLink = document.querySelector('#links a');
  const pager = document.getElementById('pager');
  pager.innerHTML = (n > 1 ? `<a id="prev" href="?p=${n - 1}">Previous<<</a>` : '<span></span>') +
    (nextLink ? `<a id="next" href="${nextLink.getAttribute('href')}">>>Next</a>` : '<span></span>');

  const prev = n > 1 ? `?p=${n - 1}` : null;
  document.getElementById('startover').hidden = n <= 1;
  document.getElementById('goback').hidden = n <= 1;
  if (prev) document.getElementById('goback').href = prev;
  document.getElementById('sep1').hidden = n <= 1;
}

document.addEventListener('keydown', e => {
  if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
  const el = document.getElementById(e.key === 'ArrowRight' ? 'next' : e.key === 'ArrowLeft' ? 'prev' : '');
  if (el) location.href = el.href;
});

async function buildLatest() {
  const list = document.getElementById('latest-list');
  try {
    const pages = await MSPFA_INDEX.load();
    list.innerHTML = [...pages].reverse().slice(0, 10).map(p =>
      `<li><a href="?p=${p.page}"${p.page === Number(pageNum) ? ' class="cur"' : ''}>${p.title}</a></li>`
    ).join('');
  } catch { document.getElementById('latest').hidden = true; }
}

function renderBlock(block, parent, data) {
  switch (block.type) {
    case 'text': {
      const span = document.createElement('span');
      span.innerHTML = Array.isArray(block.html)
        ? block.html.join('')
        : block.html || '';
      parent.appendChild(span);
      break;
    }

    case 'media': {
      block.items.forEach(m => {
        let el;

        if (m.type === 'image' || m.type === 'gif') {
          el = document.createElement('img');
          el.src = m.src;
          el.alt = m.alt || '';
        }

        // Draft stand-in: a described box where the art will go
        if (m.type === 'placeholder') {
          el = document.createElement('div');
          el.className = 'placeholder';
          el.setAttribute('role', 'img');
          el.setAttribute('aria-label', m.caption || 'Image');
          el.innerHTML = '<span>Image: ' + (m.caption || '') + '</span>';
        }

        if (m.type === 'video') {
          const video = document.createElement('video');
          const showControls = m.controls !== false;

          if (showControls) video.setAttribute('controls', '');

          if (m.loop) video.loop = true;
          if (m.muted) video.muted = true;
          if (m.autoplay) video.autoplay = true;

          video.preload = m.preload || 'metadata';
          if (m.poster) video.poster = m.poster;

          if (Array.isArray(m.sources)) {
            m.sources.forEach(s => {
              if (!s.src) return;
              const source = document.createElement('source');
              source.src = s.src;
              if (s.type) source.type = s.type;
              video.appendChild(source);
            });
          } else if (m.src) {
            video.src = m.src;
          }

          video.appendChild(
            document.createTextNode('Your browser does not support HTML5 video.')
          );

          let finalEl = video;

          if (!showControls) {
            const wrap = document.createElement('div');
            wrap.className = 'video-wrap';

            const overlay = document.createElement('div');
            overlay.className = 'video-play-btn';

            const img = document.createElement('img');
            img.src = 'assets/images/play_button.png';
            img.alt = 'Play video';
            img.tabIndex = 0;

            const play = () => video.play();

            video.addEventListener('click', () =>
              video.paused ? video.play() : video.pause()
            );

            img.addEventListener('click', e => {
              e.stopPropagation();
              play();
            });

            video.addEventListener('play', () =>
              wrap.classList.add('playing')
            );

            video.addEventListener('pause', () =>
              wrap.classList.remove('playing')
            );

            overlay.appendChild(img);
            wrap.appendChild(video);
            wrap.appendChild(overlay);
            finalEl = wrap;
          }

          el = finalEl;
        }

        if (m.type === 'iframe') {
          el = document.createElement('iframe');
          el.src = m.src;
          el.loading = 'lazy';
        }

        if (!el) return;

        if (m.class) el.classList.add(m.class);
        if (m.width) el.style.width = `${m.width}px`;
        if (m.height) el.style.height = `${m.height}px`;

        const wrap = document.createElement('div');
        wrap.className = 'panel-wrap';

        wrap.appendChild(el);
        parent.appendChild(wrap);
      });
      break;
    }

    case 'suggestions': {
      // one separate box per reader suggestion
      (block.items || []).forEach(it => {
        const box = document.createElement('div');
        box.className = 'contribution';

        const head = document.createElement('div');
        head.className = 'contribution-head';
        head.textContent = it.handle + ' wrote:';

        const body = document.createElement('div');
        body.className = 'contribution-body';
        body.innerHTML = it.text;

        box.appendChild(head);
        box.appendChild(body);
        parent.appendChild(box);
      });
      break;
    }

    case 'spoiler': {
      const wrapper = document.createElement('div');
      wrapper.className = 'spoiler closed';

      const btn = document.createElement('input');
      btn.type = 'button';
      btn.value = block.button?.open || 'OPEN';
      btn.dataset.open = btn.value;
      btn.dataset.close = block.button?.close || 'CLOSE';

      const btnWrap = document.createElement('div');
      btnWrap.style.textAlign = 'center';
      btnWrap.appendChild(btn);
      wrapper.appendChild(btnWrap);

      const inner = document.createElement('div');
      wrapper.appendChild(inner);

      block.children?.forEach(child =>
        renderBlock(child, inner, data)
      );

      parent.appendChild(wrapper);
      break;
    }

    case 'pesterlog': {
      renderPesterlog(data.pesterlog, parent);
      break;
    }

    case 'next': {
      const links = document.getElementById('links');
      if (!links) return;

      const a = document.createElement('a');
      a.href = `?p=${block.page}`;
      a.textContent = block.label || '';

      // No label given: use the next page's own title
      if (!block.label) {
        MSPFA_INDEX.load()
          .then(pages => {
            const next = pages.find(p => p.page === Number(block.page));
            a.textContent = next?.title || '==>';
          })
          .catch(() => { a.textContent = '==>'; });
      }

      const div = document.createElement('div');
      div.appendChild(a);
      links.appendChild(div);
      break;
    }
  }
}


function renderPesterlog(log, parent) {
  if (!log) return;

  const style = log.style || 'terminal';

  if (style === 'mspfa') {
    renderPesterlogMSPFA(log, parent);
  } else {
    renderPesterlogTerminal(log, parent);
  }
}

function renderPesterlogTerminal(log, parent) {
  const wrap = document.createElement('div');
  wrap.className = 'pesterlog terminal';

  if (log.title) {
    const t = document.createElement('div');
    t.className = 'pesterlog-title';
    t.textContent = log.title;
    wrap.appendChild(t);
  }

  log.lines.forEach(line => {
    const div = document.createElement('div');
    div.className = 'pesterlog-line';

    if (line.time) {
      const time = document.createElement('span');
      time.textContent = `[${line.time}] `;
      time.style.color = '#888';
      div.appendChild(time);
    }

    if (line.type === 'system') {
      div.classList.add('pesterlog-system');
      div.textContent += line.text;
    }

    if (line.type === 'narration') {
      div.classList.add('pesterlog-narration');
      div.textContent += line.text;
    }

    if (line.type === 'chat') {
      const h = document.createElement('span');
      h.style.color = line.color || '#fff';
      h.textContent = `${line.handle}: `;

      const m = document.createElement('span');
      m.innerHTML = line.text;

      div.appendChild(h);
      div.appendChild(m);
    }

    wrap.appendChild(div);
  });

  parent.appendChild(wrap);
}

function renderPesterlogMSPFA(log, parent) {
  const wrap = document.createElement('div');
  wrap.className = 'pesterlog mspfa';

  if (log.participants?.length && log.startTime) {
    const header = document.createElement('div');
    header.className = 'pesterlog-header';

    const names = log.participants
      .map(p =>
        `${p.handle} <span style="color:${p.color}">[${p.tag}]</span>`
      )
      .join(' began pestering ');

    header.innerHTML = `
      <strong>
        -- ${names} at ${log.startTime} --
      </strong>
    `;

    wrap.appendChild(header);
  }

  parent.appendChild(wrap);

  log.lines.forEach(line => {
    if (line.type === 'chat') {
      const p = log.participants?.find(p => p.handle === line.handle);
      const tag = p?.tag || line.handle;

      const span = document.createElement('span');
      span.style.color = p?.color || '#000';
      span.innerHTML = `<br>${tag}: ${line.text}`;
      wrap.appendChild(span);
    }

    if (line.type === 'system' || line.type === 'narration') {
      const span = document.createElement('span');
      span.className = `pesterlog-${line.type}`;
      span.innerHTML = `<br>${line.text}`;
      wrap.appendChild(span);
    }
  });

  parent.appendChild(wrap);
}


document.addEventListener('click', e => {
  const btn = e.target.closest('input[data-open][data-close]');
  if (!btn) return;

  const spoiler = btn.closest('.spoiler');
  if (!spoiler) return;

  const isClosed = spoiler.classList.contains('closed');
  spoiler.classList.toggle('closed', !isClosed);
  spoiler.classList.toggle('open', isClosed);

  btn.value = isClosed
    ? btn.dataset.close
    : btn.dataset.open;
});