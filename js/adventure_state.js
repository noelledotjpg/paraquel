// /js/adventure_state.js

const MSPFA_STATE = (() => {
  const STORAGE_KEY = "mspfa_state";

  let state = {
    visited: [],
  };

  // load on init
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.visited)) {
      state.visited = saved.visited;
    }
  } catch (e) {
    console.warn("Failed to load MSPFA state", e);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function logPageVisit(page, title, timestamp, text) {
    if (!page) return;
    if (state.visited.some(v => v.page === page)) return;

    state.visited.push({
      page,
      title: title || '',
      timestamp: timestamp || '',
      text: text || ''
    });

    save();
  }

  function getVisited() {
    return [...state.visited];
  }

  function setVisited(newVisited) {
    if (!Array.isArray(newVisited)) return;
    state.visited = newVisited;
    save();
  }

  function getPreviousPage() {
    if (state.visited.length < 2) return null;
    return state.visited[state.visited.length - 2];
  }

  return {
    logPageVisit,
    getVisited,
    setVisited,
    getPreviousPage,
  };
})();
