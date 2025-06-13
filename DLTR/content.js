(async () => {
  const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;

      const check = () => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);
        elapsed += interval;
        if (elapsed >= timeout) return reject(`Timeout waiting for: ${selector}`);
        setTimeout(check, interval);
      };

      check();
    });
  };

  // Get preferred size from Chrome storage
  const { preferredSize } = await chrome.storage.local.get("preferredSize");
  if (!preferredSize) return console.warn("No preferred size set.");

  try {
    // Wait for the swatch container to load
    await waitForElement('.swatch');

    // Find the label that matches the preferred size
    const labels = document.querySelectorAll('.swatch-element.available label');
    let matchedLabel = null;
    for (const label of labels) {
      const text = label.textContent.trim();
      if (text === preferredSize) {
        matchedLabel = label;
        break;
      }
    }

    if (!matchedLabel) {
      console.warn(`Size ${preferredSize} not found or sold out.`);
      return;
    }

    // Click the matching label to select the size
    matchedLabel.click();

    // Wait for the Add to Cart button
    const addToCartBtn = await waitForElement('button[name="add"]');
    addToCartBtn.click();

    // Wait a moment before redirecting to cart
    setTimeout(() => {
      window.location.href = "/cart";
    }, 1500);

  } catch (err) {
    console.error("Bot Error:", err);
  }
})();


// test test test