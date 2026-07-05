const scRoot = document.getElementById('scRoot');
const themeToggleBtn = document.getElementById('themeToggle');

const hero = document.getElementById('hero');
const statusTitle = document.getElementById('statusTitle');
const statusSub = document.getElementById('statusSub');
const enabledToggle = document.getElementById('enabledToggle');
const statsGrid = document.querySelector('.stats-grid');
const settingsSection = document.getElementById('settingsSection');

const refreshStatsBtn = document.getElementById('refreshStats');
const refreshIcon = document.getElementById('refreshIcon');
const currentVideoIdEl = document.getElementById('currentVideoId');
const currentWatchCountEl = document.getElementById('currentWatchCount');
const currentAudioEl = document.getElementById('currentAudio');
const totalTrackedEl = document.getElementById('totalTracked');
const watchProgressEl = document.getElementById('watchProgress');
const searchAudioBtn = document.getElementById('searchAudioBtn');

const maxWatchCountInput = document.getElementById('maxWatchCount');
const stepDownBtn = document.getElementById('stepDown');
const stepUpBtn = document.getElementById('stepUp');

const keywordInput = document.getElementById('keywordInput');
const addKeywordBtn = document.getElementById('addKeyword');
const keywordTags = document.getElementById('keywordTags');
const keywordEmpty = document.getElementById('keywordEmpty');

const audioInput = document.getElementById('audioInput');
const addAudioBtn = document.getElementById('addAudio');
const audioTags = document.getElementById('audioTags');
const audioEmpty = document.getElementById('audioEmpty');

const advancedToggleBtn = document.getElementById('advancedToggle');
const advancedPanel = document.getElementById('advancedPanel');
const advancedChevron = document.getElementById('advancedChevron');

const testIncrementBtn = document.getElementById('testIncrement');
const testScrollBtn = document.getElementById('testScroll');
const restartTabBtn = document.getElementById('restartTab');

const clearDataBtn = document.getElementById('clearData');
const clearLabel = document.getElementById('clearLabel');

const toastEl = document.getElementById('toast');

let isEnabled = true;
let toastTimer = null;
let confirmClearTimer = null;

function showToast(message, duration = 2200) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

function applyTheme(theme) {
  scRoot.dataset.theme = theme;
}

async function loadTheme() {
  try {
    const result = await chrome.storage.local.get('theme');
    applyTheme(result.theme === 'light' ? 'light' : 'dark');
  } catch (error) {}
}

async function toggleTheme() {
  const next = scRoot.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  await chrome.storage.local.set({ theme: next });
}

function applyEnabledUI(enabled) {
  isEnabled = enabled;
  hero.classList.toggle('disabled', !enabled);
  enabledToggle.classList.toggle('off', !enabled);
  enabledToggle.setAttribute('aria-checked', String(enabled));
  statsGrid.classList.toggle('disabled', !enabled);
  settingsSection.classList.toggle('disabled', !enabled);
  statusTitle.textContent = enabled ? 'Extension is on' : 'Extension is paused';
  statusSub.textContent = enabled
    ? 'Watching Shorts and enforcing your limits'
    : 'Not intervening on Shorts right now';
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get([
      'enabled',
      'maxWatchCount',
      'blockedKeywords',
      'blockedAudios'
    ]);

    applyEnabledUI(result.enabled !== false);
    maxWatchCountInput.value = result.maxWatchCount || 1;

    renderKeywords(result.blockedKeywords || []);
    renderAudios(result.blockedAudios || []);
  } catch (error) {}
}

async function saveSettings() {
  const keywords = Array.from(keywordTags.querySelectorAll('.tag'))
    .map(tag => tag.dataset.value);
  const audios = Array.from(audioTags.querySelectorAll('.tag'))
    .map(tag => tag.dataset.value);

  await chrome.storage.local.set({
    enabled: isEnabled,
    maxWatchCount: parseInt(maxWatchCountInput.value) || 1,
    blockedKeywords: keywords,
    blockedAudios: audios
  });
}

function toggleEnabled() {
  applyEnabledUI(!isEnabled);
  saveSettings();
}

function stepMax(delta) {
  const current = parseInt(maxWatchCountInput.value, 10) || 1;
  maxWatchCountInput.value = Math.max(1, Math.min(100, current + delta));
  saveSettings();
  loadStats();
}

function renderKeywords(keywords) {
  keywordTags.innerHTML = '';
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      addTag(keywordTags, keyword, () => saveSettings());
    }
  });
  keywordEmpty.classList.toggle('hidden', keywords.length > 0);
}

function renderAudios(audios) {
  audioTags.innerHTML = '';
  audios.forEach(audio => {
    if (audio.trim()) {
      addTag(audioTags, audio, () => saveSettings());
    }
  });
  audioEmpty.classList.toggle('hidden', audios.length > 0);
}

function addTag(container, value, onRemove) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.dataset.value = value;

  const text = document.createElement('span');
  text.className = 'tag-text';
  text.textContent = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'tag-remove';
  removeBtn.setAttribute('aria-label', 'Remove');
  removeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  removeBtn.addEventListener('click', () => {
    tag.remove();
    container.parentElement.querySelector('.empty-hint').classList.toggle('hidden', container.children.length > 0);
    if (onRemove) onRemove();
  });

  tag.appendChild(text);
  tag.appendChild(removeBtn);
  container.appendChild(tag);
}

function addKeyword() {
  const value = keywordInput.value.trim();
  if (!value) return;

  const existing = Array.from(keywordTags.querySelectorAll('.tag'))
    .some(tag => tag.dataset.value.toLowerCase() === value.toLowerCase());

  if (existing) {
    keywordInput.value = '';
    return;
  }

  addTag(keywordTags, value, () => saveSettings());
  keywordEmpty.classList.add('hidden');
  keywordInput.value = '';
  saveSettings();
}

function addAudio() {
  const value = audioInput.value.trim();
  if (!value) return;

  const existing = Array.from(audioTags.querySelectorAll('.tag'))
    .some(tag => tag.dataset.value.toLowerCase() === value.toLowerCase());

  if (existing) {
    audioInput.value = '';
    return;
  }

  addTag(audioTags, value, () => saveSettings());
  audioEmpty.classList.add('hidden');
  audioInput.value = '';
  saveSettings();
}

async function clearAllData() {
  if (!clearDataBtn.classList.contains('confirm')) {
    clearDataBtn.classList.add('confirm');
    clearLabel.textContent = 'Tap again to confirm';
    clearTimeout(confirmClearTimer);
    confirmClearTimer = setTimeout(() => {
      clearDataBtn.classList.remove('confirm');
      clearLabel.textContent = 'Clear all data';
    }, 3500);
    return;
  }

  clearTimeout(confirmClearTimer);
  clearDataBtn.classList.remove('confirm');
  clearLabel.textContent = 'Clear all data';

  await chrome.storage.local.set({
    enabled: true,
    maxWatchCount: 1,
    blockedKeywords: [],
    blockedAudios: [],
    videoData: {}
  });

  await loadSettings();
  await loadStats();
  showToast('All data cleared');
}

enabledToggle.addEventListener('click', toggleEnabled);
themeToggleBtn.addEventListener('click', toggleTheme);

maxWatchCountInput.addEventListener('change', () => { saveSettings(); loadStats(); });
maxWatchCountInput.addEventListener('input', () => { saveSettings(); loadStats(); });
stepDownBtn.addEventListener('click', () => stepMax(-1));
stepUpBtn.addEventListener('click', () => stepMax(1));

addKeywordBtn.addEventListener('click', addKeyword);
keywordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addKeyword();
  }
});

addAudioBtn.addEventListener('click', addAudio);
audioInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addAudio();
  }
});

clearDataBtn.addEventListener('click', clearAllData);

keywordInput.addEventListener('blur', () => {
  const value = keywordInput.value.trim();
  if (value.includes(',')) {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    keywords.forEach(keyword => {
      const existing = Array.from(keywordTags.querySelectorAll('.tag'))
        .some(tag => tag.dataset.value.toLowerCase() === keyword.toLowerCase());
      if (!existing) {
        addTag(keywordTags, keyword, () => saveSettings());
      }
    });
    keywordEmpty.classList.toggle('hidden', keywordTags.children.length > 0);
    keywordInput.value = '';
    saveSettings();
  }
});

advancedToggleBtn.addEventListener('click', () => {
  const isOpen = advancedPanel.classList.toggle('open');
  advancedChevron.classList.toggle('open', isOpen);
});

function updateAudioSearchButton(audioName) {
  if (audioName) {
    searchAudioBtn.dataset.audio = audioName;
    searchAudioBtn.classList.remove('hidden');
  } else {
    delete searchAudioBtn.dataset.audio;
    searchAudioBtn.classList.add('hidden');
  }
}

searchAudioBtn.addEventListener('click', () => {
  const audioName = searchAudioBtn.dataset.audio;
  if (!audioName) return;
  chrome.tabs.create({ url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(audioName) });
});

async function loadStats() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      currentVideoIdEl.textContent = 'Not on YouTube';
      currentWatchCountEl.textContent = '-';
      currentAudioEl.textContent = '-';
      watchProgressEl.style.width = '0%';
      updateAudioSearchButton(null);
      return;
    }

    let videoId = null;
    const shortsMatch = tab.url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    } else {
      const urlParams = new URLSearchParams(new URL(tab.url).search);
      videoId = urlParams.get('v');
    }

    const result = await chrome.storage.local.get('videoData');
    const videoData = result.videoData || {};
    const max = parseInt(maxWatchCountInput.value, 10) || 1;

    if (videoId) {
      const videoInfo = videoData[videoId] || { watchCount: 0, audio: null };
      currentVideoIdEl.textContent = videoId.substring(0, 11) + '...';
      currentVideoIdEl.title = videoId;
      currentWatchCountEl.textContent = `${videoInfo.watchCount || 0} / ${max}`;
      currentAudioEl.textContent = videoInfo.audio || 'None detected';
      updateAudioSearchButton(videoInfo.audio || null);
      const pct = Math.min(100, Math.round(((videoInfo.watchCount || 0) / max) * 100));
      watchProgressEl.style.width = pct + '%';
    } else {
      currentVideoIdEl.textContent = 'No video';
      currentWatchCountEl.textContent = '-';
      currentAudioEl.textContent = '-';
      watchProgressEl.style.width = '0%';
      updateAudioSearchButton(null);
    }

    const totalTracked = Object.keys(videoData).length;
    totalTrackedEl.textContent = `${totalTracked} video${totalTracked !== 1 ? 's' : ''}`;
  } catch (error) {
    currentVideoIdEl.textContent = 'Error';
    currentWatchCountEl.textContent = '-';
    currentAudioEl.textContent = '-';
    updateAudioSearchButton(null);
  }
}

async function refreshStats() {
  refreshIcon.classList.add('spinning');
  await loadStats();
  setTimeout(() => {
    refreshIcon.classList.remove('spinning');
    showToast('Stats re-synced');
  }, 700);
}

async function testIncrement() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      showToast('Navigate to YouTube Shorts first');
      return;
    }

    let videoId = null;
    const shortsMatch = tab.url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    } else {
      const urlParams = new URLSearchParams(new URL(tab.url).search);
      videoId = urlParams.get('v');
    }

    if (!videoId) {
      showToast('No video ID found on this page');
      return;
    }

    const result = await chrome.storage.local.get('videoData');
    const videoData = result.videoData || {};

    if (!videoData[videoId]) {
      videoData[videoId] = { watchCount: 0, audio: null };
    }

    videoData[videoId].watchCount++;

    await chrome.storage.local.set({ videoData });

    await loadStats();

    try {
      chrome.tabs.sendMessage(tab.id, { action: 'refreshIndicator' }).catch(() => {});
    } catch (e) {}

    showToast(`Watch count incremented to ${videoData[videoId].watchCount}`);
  } catch (error) {
    showToast('Error: ' + error.message);
  }
}

async function testScroll() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      showToast('Navigate to YouTube Shorts first');
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'scrollToNext' });
      showToast('Scrolled to next Short');
      return;
    } catch (msgError) {
      if (chrome.scripting && chrome.scripting.executeScript) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const container = document.querySelector('#shorts-container, ytd-shorts #shorts-inner-container, ytd-shorts')
                || document.body;
              const video = document.querySelector('video');

              const wheelEvent = new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true });
              container.dispatchEvent(wheelEvent);

              setTimeout(() => {
                const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true });
                (video || document.activeElement || document).dispatchEvent(arrowEvent);
                document.dispatchEvent(arrowEvent);
              }, 200);
            }
          });
          showToast('Scrolled to next Short');
        } catch (scriptError) {
          showToast('Content script not loaded - reload the page');
        }
      } else {
        showToast('Content script not loaded - reload the page');
      }
    }
  } catch (error) {
    showToast('Error: ' + error.message);
  }
}

async function restartTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      showToast('Navigate to YouTube first');
      return;
    }

    await chrome.tabs.reload(tab.id);
    showToast('Extension restarted on this tab');
  } catch (error) {
    showToast('Error: ' + error.message);
  }
}

refreshStatsBtn.addEventListener('click', refreshStats);
testIncrementBtn.addEventListener('click', testIncrement);
testScrollBtn.addEventListener('click', testScroll);
restartTabBtn.addEventListener('click', restartTab);

loadTheme();
loadSettings().then(loadStats);

const statsInterval = setInterval(loadStats, 2000);

window.addEventListener('beforeunload', () => {
  if (statsInterval) clearInterval(statsInterval);
});
