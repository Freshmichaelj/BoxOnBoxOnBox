document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('size-input');
  const saveBtn = document.getElementById('save-size');

  // load stored size (default empty)
  chrome.storage.local.get(['size'], ({ size }) => {
    if (size) input.value = size;
  });

  saveBtn.addEventListener('click', () => {
    const size = input.value.trim();
    if (!size) return;
    chrome.storage.local.set({ size }, () => {
      console.log('Saved size:', size);
    });
  });

  // (optional) keep your existing run button handler here…
});
