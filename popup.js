const adsEl = document.getElementById("ads");

chrome.storage.local.get(["stats"], (res) => {
  if (res.stats) {
    adsEl.innerText = res.stats.ads;
  }
});