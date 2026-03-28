let stats = {
  ads: 0
};

const NOTIFICATION_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAV0lEQVR4Ae3PAQ0AAAgDoGf/zhrDzUEBOkldmJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ2V5f2QABifzQWgAAAABJRU5ErkJggg==";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AD_SKIPPED") {
    stats.ads++;

    chrome.notifications.create({
      type: "basic",
      iconUrl: NOTIFICATION_ICON,
      title: "Ad Skipped",
      message: "Skipped an ad 🎉"
    });

    chrome.storage.local.set({ stats });
  }
});