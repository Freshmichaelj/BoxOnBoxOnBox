document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('size-input');
  const saveBtn = document.getElementById('save-size');

  // Load stored preferredSize
  chrome.storage.local.get(['preferredSize'], ({ preferredSize }) => {
    if (preferredSize) input.value = preferredSize;
  });

  saveBtn.addEventListener('click', () => {
    const size = input.value.trim();
    if (!/^\d+(\.\d)?$/.test(size)) {
      alert('Please enter a valid size (e.g., 8, 9.5, 10.5)');
      return;
    }

    chrome.storage.local.set({ preferredSize: size }, () => {
      console.log('Saved size:', size);
      alert(`Size "${size}" saved!`);
    });
  });
});
