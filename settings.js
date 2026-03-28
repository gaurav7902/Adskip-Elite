const notify = document.getElementById("notify");

chrome.storage.local.get(["notify"], (res) => {
  notify.checked = res.notify || false;
});

notify.addEventListener("change", () => {
  chrome.storage.local.set({ notify: notify.checked });
});