document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('size-input');
  const saveBtn = document.getElementById('save-size');

  // Load stored size
  chrome.storage.local.get(['size'], ({ size }) => {
    if (size) input.value = size;
  });

  saveBtn.addEventListener('click', () => {
    const size = input.value.trim();
    if (!/^\d+(\.\d+)?$/.test(size)) {
      alert('Please enter a valid size (e.g., 8, 9.5, 10.25)');
      return;
    }

    chrome.storage.local.set({ size }, () => {
      console.log('Saved size:', size);
      alert(`Size "${size}" saved!`);
    });
  });
});
