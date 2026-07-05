chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    theme: 'dark',
    maxWatchCount: 1,
    blockedKeywords: [],
    blockedAudios: [],
    videoData: {}
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['enabled', 'maxWatchCount', 'blockedKeywords', 'blockedAudios'])
      .then(result => sendResponse(result));
    return true;
  }
});
