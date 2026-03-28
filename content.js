let adsSkipped = 0;

const observer = new MutationObserver(() => {
  const skipBtn = document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
  const adShowing = document.querySelector(".ad-showing");
  const video = document.querySelector("video");

  if (skipBtn) {
    skipBtn.click();
    adsSkipped++;

    chrome.storage.local.get(["notify"], (res) => {
      if (res.notify) {
        chrome.runtime.sendMessage({ type: "AD_SKIPPED" });
      }
    });
  }

  if (video && adShowing) {
    video.muted = true;
    video.playbackRate = 2;
  } else if (video) {
    video.muted = false;
    video.playbackRate = 1;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});