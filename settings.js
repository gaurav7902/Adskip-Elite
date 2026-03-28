const notify = document.getElementById("notify");
const instant = document.getElementById("instant");

chrome.storage.local.get(["notify", "instant"], (res) => {
  notify.checked = res.notify || false;
  instant.checked = res.instant !== false;
});

notify.addEventListener("change", () => {
  chrome.storage.local.set({ notify: notify.checked });
});

instant.addEventListener("change", () => {
  chrome.storage.local.set({ instant: instant.checked });
});