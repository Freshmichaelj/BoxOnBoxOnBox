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

  const autofillCheckout = async () => {
    try {
      const firstName = await waitForElement('input[name="checkout[shipping_address][first_name]"]');
      const lastName = document.querySelector('input[name="checkout[shipping_address][last_name]"]');
      const email = document.querySelector('input[name="checkout[email]"]');
      const address1 = document.querySelector('input[name="checkout[shipping_address][address1]"]');
      const city = document.querySelector('input[name="checkout[shipping_address][city]"]');
      const zip = document.querySelector('input[name="checkout[shipping_address][zip]"]');
      const phone = document.querySelector('input[name="checkout[shipping_address][phone]"]');

      // Fill in your info
      firstName.value = "Diego";
      lastName.value = "Gonzalez";
      email.value = "diego@example.com";
      address1.value = "1234 My Street";
      city.value = "My City";
      zip.value = "12345";
      phone.value = "555-123-4567";

      [firstName, lastName, email, address1, city, zip, phone].forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      console.log("Checkout autofilled!");
    } catch (e) {
      console.warn("Failed to autofill checkout:", e);
    }
  };

  if (window.location.pathname.startsWith('/checkouts')) {
    setTimeout(autofillCheckout, 2000);
  } else {
    const { size } = await chrome.storage.local.get("size");
    if (!size) return console.warn("No size saved in Chrome storage.");

    try {
      await waitForElement('.swatch');

      const labels = document.querySelectorAll('.swatch-element.available label');
      let matchedLabel = null;

      for (const label of labels) {
        const span = label.querySelector('.swatch-value');
        if (!span) continue;

        const labelText = span.textContent.trim().replace(/[^\d.]/g, '');
        const normalizedSize = size.replace(/[^\d.]/g, '');

        if (labelText === normalizedSize) {
          matchedLabel = label;
          break;
        }
      }

      if (!matchedLabel) {
        console.warn(`Size ${size} not found or sold out.`);
        return;
      }

      matchedLabel.click();
      console.log(`Selected size ${size}`);

      // Wait for and click Buy Now button
      const buyNowBtn = await waitForElement('div.atc_checkout');
      buyNowBtn.click();
      console.log("Clicked Buy Now");

    } catch (err) {
      console.error("Bot Error:", err);
    }
  }
})();