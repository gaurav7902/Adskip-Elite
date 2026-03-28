let settings = {
  enabled: true,
  notify: true,
  instant: true
};

let skipScheduled = false;
let hasUserInteracted = false;
let pendingVideoToUnmute = null;
let activeVideo = null;
let previousMuted = null;
let previousPlaybackRate = 1;

function tryRestoreVideoState(video) {
  if (!video || video !== activeVideo) {
    return;
  }

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
  if (area !== "local") {
    return;
  }

  if (changes.enabled) {
    settings.enabled = changes.enabled.newValue !== false;
  }

  if (changes.notify) {
    settings.notify = changes.notify.newValue !== false;
  }

  if (changes.instant) {
    settings.instant = changes.instant.newValue !== false;
  }
});

const observer = new MutationObserver(() => {
  const skipBtn = document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
  const adShowing = document.querySelector(".ad-showing");
  const video = document.querySelector("video");

  if (!settings.enabled) {
    tryRestoreVideoState(video);
    return;
  }

  if (skipBtn && !skipScheduled) {
    skipScheduled = true;

    const delayMs = settings.instant ? 0 : 1000;

    setTimeout(() => {
      if (skipBtn.isConnected) {
        skipBtn.click();

        if (settings.notify) {
          chrome.runtime.sendMessage({ type: "AD_SKIPPED" });
        }
      }

      skipScheduled = false;
    }, delayMs);
  }

  if (video && adShowing) {
    if (activeVideo !== video) {
      activeVideo = video;
      previousMuted = video.muted;
      previousPlaybackRate = video.playbackRate || 1;
    }

    video.muted = true;
    video.playbackRate = 2;
  } else if (video) {
    tryRestoreVideoState(video);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});