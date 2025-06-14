(async () => {
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const start = performance.now();

      const element = document.querySelector(selector);
      if (element) {
        const elapsed = performance.now() - start;
        console.log(`✅ Found "${selector}" in ${elapsed.toFixed(2)} ms`);
        return resolve(element);
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          clearTimeout(timer);
          const elapsed = performance.now() - start;
          console.log(`✅ Found "${selector}" in ${elapsed.toFixed(2)} ms`);
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        const elapsed = performance.now() - start;
        console.warn(`⏰ Timeout waiting for "${selector}" after ${elapsed.toFixed(2)} ms`);
        reject(new Error(`Timeout waiting for: ${selector}`));
      }, timeout);
    });
  }

  // Get preferred size from storage (key: 'size')
  const { size } = await chrome.storage.local.get('size');

  if (!size) {
    console.warn('⚠️ No preferred size set in storage.');
    return;
  }

  console.log('👟 Preferred size loaded:', size);

  const swatches = Array.from(document.querySelectorAll('span.swatch-value'));
  const targetSwatch = swatches.find(span => span.innerText.trim() === size);

  if (!targetSwatch) {
    console.warn(`❌ Size ${size} not found on the page.`);
    return;
  }

  console.log(`🔘 Clicking on size: ${size}`);
  targetSwatch.click();

  // Wait for and click Buy Now button (adjust selector as needed)
  try {
    const buyNowBtn = await waitForElement('div.atc_checkout, button.buy-now, button[data-action="buy-now"]');
    buyNowBtn.click();
    console.log('🛒 Buy Now clicked!');
  } catch (err) {
    console.error('❌ Failed to click Buy Now:', err);
  }
})();