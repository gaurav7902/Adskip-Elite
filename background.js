let stats = {
  ads: 0,
};

const NOTIFICATION_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR4nGO4Y2T0nxLMMGrAqAGjBgwXAwAMAD8f/JQG9gAAAABJRU5ErkJggg==";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AD_SKIPPED") {
    stats.ads++;

    chrome.notifications.create({
      type: "basic",
      iconUrl: NOTIFICATION_ICON,
      title: "Ad Skipped",
      message: "An ad was automatically skipped.",
    });

    chrome.storage.local.set({ stats });
  }
});
