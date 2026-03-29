let settings = {
  enabled: true,
  notify: true,
  instant: true,
};

let hasUserInteracted = false;
let pendingVideoToUnmute = null;
let activeVideo = null;
let previousMuted = null;
let previousPlaybackRate = 1;
let skipScheduled = false;
let pollInterval = null;
let lastAdId = null;

function tryRestoreVideoState(video) {
  if (!video) return;

  video.playbackRate = previousPlaybackRate;

  if (previousMuted === false) {
    if (hasUserInteracted) {
      video.muted = false;
      pendingVideoToUnmute = null;
    } else {
      pendingVideoToUnmute = video;
    }
  }

  if (previousMuted === true) {
    video.muted = true;
    pendingVideoToUnmute = null;
  }

  activeVideo = null;
  previousMuted = null;
  previousPlaybackRate = 1;
}

function markInteractionAndProcessPending() {
  hasUserInteracted = true;
  if (pendingVideoToUnmute && pendingVideoToUnmute.isConnected) {
    pendingVideoToUnmute.muted = false;
  }
  pendingVideoToUnmute = null;
}

document.addEventListener("pointerdown", markInteractionAndProcessPending, { passive: true });
document.addEventListener("keydown", markInteractionAndProcessPending, { passive: true });

chrome.storage.local.get(["enabled", "notify", "instant"], (res) => {
  settings.enabled = res.enabled !== false;
  settings.notify = res.notify !== false;
  settings.instant = res.instant !== false;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.enabled) settings.enabled = changes.enabled.newValue !== false;
  if (changes.notify) settings.notify = changes.notify.newValue !== false;
  if (changes.instant) settings.instant = changes.instant.newValue !== false;
});

function doSkipClick(skipBtn) {
  const rect = skipBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Simulate realistic mouse movement to button position
  const moveAndClick = () => {
    // Mouse move to button
    const moveEvent = new MouseEvent("mousemove", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: centerX,
      clientY: centerY
    });
    document.dispatchEvent(moveEvent);

    // Small delay then mouse over
    setTimeout(() => {
      const overEvent = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      });
      skipBtn.dispatchEvent(overEvent);

      // Then mouse enter
      setTimeout(() => {
        const enterEvent = new MouseEvent("mouseenter", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY
        });
        skipBtn.dispatchEvent(enterEvent);

        // Then actual click
        setTimeout(() => {
          skipBtn.click();
          // Also try the container
          const container = skipBtn.closest(".ytp-skip-ad");
          if (container) container.click();
        }, 50);
      }, 50);
    }, 50);
  };

  const randomDelay = Math.floor(Math.random() * 800) + 200;
  setTimeout(moveAndClick, randomDelay);
}

function confirmSkipAndNotify() {
  if (!settings.enabled) return;

  // Check if ad is gone — either .ad-showing is gone or no skip button
  const adShowing = document.querySelector(".ad-showing");
  const skipBtn = document.querySelector(".ytp-skip-ad-button");

  if (!adShowing && !skipBtn) {
    // Ad was successfully skipped
    chrome.runtime.sendMessage({ type: "AD_SKIPPED" });
    return true;
  }
  return false;
}

function trySkipAd() {
  if (!settings.enabled || skipScheduled) return;

  // Find skip button by text content, not by class/id
  const allButtons = document.querySelectorAll("button");
  let skipBtn = null;
  for (const btn of allButtons) {
    const text = btn.textContent.trim().toLowerCase();
    if (text === "skip" || text === "skip ad" || text === "skip ads") {
      skipBtn = btn;
      break;
    }
  }
  if (!skipBtn || !skipBtn.isConnected) return;

  // Only click if button is actually visible on screen
  const style = window.getComputedStyle(skipBtn);
  const isVisible = style.display !== "none"
    && style.visibility !== "hidden"
    && style.opacity !== "0"
    && skipBtn.offsetWidth > 0
    && skipBtn.offsetHeight > 0;

  if (!isVisible) return;

  const btnText = skipBtn.textContent.trim();
  const skipAdContainer = skipBtn.closest(".ytp-skip-ad");
  const adId = skipAdContainer ? skipAdContainer.id + btnText : btnText;

  if (adId === lastAdId) return;
  lastAdId = adId;
  skipScheduled = true;

  const video = document.querySelector("video");
  if (video && activeVideo !== video) {
    activeVideo = video;
    previousMuted = video.muted;
    previousPlaybackRate = video.playbackRate || 1;
  }

  const delay = settings.instant ? 0 : 600;

  setTimeout(() => {
    if (!settings.enabled) {
      skipScheduled = false;
      lastAdId = null;
      return;
    }

    doSkipClick(skipBtn);

    setTimeout(() => {
      if (confirmSkipAndNotify()) {
        if (video && video.isConnected) tryRestoreVideoState(video);
      }
      skipScheduled = false;
      lastAdId = null;
    }, 300);

  }, delay);
}

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(trySkipAd, 1000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  const video = document.querySelector("video");
  tryRestoreVideoState(video);
  lastAdId = null;
}

const urlObserver = new MutationObserver(() => {
  if (location.href.includes("/watch")) {
    startPolling();
  } else {
    stopPolling();
  }
});
urlObserver.observe(document.documentElement, { childList: true, subtree: true });

if (location.href.includes("/watch")) {
  startPolling();
}
