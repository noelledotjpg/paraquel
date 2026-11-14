// /js/save_state.js

window.MSPFA_SAVE = (() => {
  const SAVE_KEY = "mspfa_manual_save";

  function save() {
    const data = MSPFA_STATE.getVisited();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    alert("Game saved.");
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return alert("No save found.");

    try {
      MSPFA_STATE.setVisited(JSON.parse(raw));
      alert("Game loaded.");
    } catch {
      alert("Save corrupted.");
    }
  }

  // Deletes the manual save slot AND the live page history the log page reads
  function wipe() {
    localStorage.removeItem(SAVE_KEY);
    MSPFA_STATE.setVisited([]);
  }

  // Two-step delete: first click arms it ("Are you sure?" in red),
  // second click actually deletes. Disarms itself after a few seconds.
  let armTimer = null;

  function disarm(link) {
    clearTimeout(armTimer);
    armTimer = null;
    if (!link) return;
    link.classList.remove("confirming");
    link.textContent = link.dataset.label || "Delete game data";
  }

  function clear() {
    const link = document.getElementById("deletegame");

    // Fallback if the link isn't on the page
    if (!link) {
      if (confirm("Are you sure?")) {
        wipe();
        alert("Save data deleted.");
      }
      return;
    }

    if (!link.classList.contains("confirming")) {
      link.dataset.label = link.textContent;
      link.classList.add("confirming");
      link.textContent = "Are you sure?";
      armTimer = setTimeout(() => disarm(link), 4000);
      return;
    }

    disarm(link);
    wipe();
    alert("Save data deleted.");
  }

  return { save, load, clear };
})();