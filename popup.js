const adsEl = document.getElementById("ads");
const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");

function renderEnabled(enabled) {
  const isEnabled = enabled !== false;
  statusEl.innerText = isEnabled ? "Auto-Skip is ACTIVE" : "Auto-Skip is PAUSED";
  toggleBtn.innerText = isEnabled ? "Pause" : "Resume";
}

chrome.storage.local.get(["stats", "enabled"], (res) => {
  const adCount = res.stats && typeof res.stats.ads === "number" ? res.stats.ads : 0;
  adsEl.innerText = String(adCount);
  renderEnabled(res.enabled);
});

toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["enabled"], (res) => {
    const nextEnabled = res.enabled === false;
    chrome.storage.local.set({ enabled: nextEnabled }, () => {
      renderEnabled(nextEnabled);
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes.stats) {
    const nextStats = changes.stats.newValue;
    const adCount = nextStats && typeof nextStats.ads === "number" ? nextStats.ads : 0;
    adsEl.innerText = String(adCount);
  }

  if (changes.enabled) {
    renderEnabled(changes.enabled.newValue);
  }
});