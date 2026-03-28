let stats = {
  ads: 0
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AD_SKIPPED") {
    stats.ads++;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Ad Skipped",
      message: "Skipped an ad 🎉"
    });

    chrome.storage.local.set({ stats });
  }
});