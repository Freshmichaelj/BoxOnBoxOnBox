// content.js

(function() {
  // 1) Fire a custom event whenever pushState/replaceState/popstate happens
  const origPush = history.pushState;
  history.pushState = function(...args) {
    origPush.apply(this, args);
    window.dispatchEvent(new Event('locationchange'));
  };
  const origReplace = history.replaceState;
  history.replaceState = function(...args) {
    origReplace.apply(this, args);
    window.dispatchEvent(new Event('locationchange'));
  };
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
  
  // 1a) Watch for URL changes by polling as a fallback
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      window.dispatchEvent(new Event('locationchange'));
    }
  }, 500);

  // 2) Helper: wait for an element to appear in the DOM
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (elapsed >= timeout) {
          clearInterval(timer);
          reject(new Error("Element not found: " + selector));
        }
        elapsed += interval;
      }, interval);
    });
  }
  
  // helper to get the user’s desired size
  function getDesiredSize() {
  	return new Promise(resolve => {
    	chrome.storage.local.get(['size'], ({ size }) => {
      		resolve(size || '8.0');  // fallback to 8.0 if nothing stored
      	});
    });
  }

  // 3) Your auto-checkout routine
  async function runAutoCheckout() {
    try {
      console.log("Auto-checkout triggered for", window.location.href);
      
      // 1) Select size “8.0” with up to 5 retries
      let sizeClicked = false;
      	for (let i = 0; i < 5; i++) {
      		
      		const desiredSize = await getDesiredSize();
      		const sizeButton = Array.from(document.querySelectorAll('button, div, span'))
      			.find(el =>
      				el.getAttribute('aria-label') === `Size: ${desiredSize}` ||
      				el.textContent.trim() === desiredSize
      			);
      		
      		//const sizeButton = Array.from(document.querySelectorAll('button, div, span'))
      		//	.find(el =>
      		//		el.getAttribute('aria-label') === 'Size: 8.0' ||
      		//		el.textContent.trim() === '8.0'
      		//	);
		if (sizeButton) {
			sizeButton.click();
			console.log(`Clicked size (attempt ${i+1}/5)`);
			sizeClicked = true;
			break;
  		}
		console.log(`Size not found, retrying in 2s (${i+1}/5)`);
		await new Promise(r => setTimeout(r, 2000));
	}
	if (!sizeClicked) {
  		console.warn("Size never appeared after 5 retries; aborting auto-checkout.");
  		return;  // stop here instead of proceeding to checkout
	}


      // Click “Add to Cart”
      const addToCartButton = await waitForElement('button.ProductDetails-form__ctaLargeFont');
      addToCartButton.click();
      console.log("Clicked Add to Cart");

      // Redirect to checkout after a short delay
      // minimal delay then jump straight to /checkout/
      setTimeout(() => {
      window.location.href = 'https://www.footlocker.com/checkout/';
      console.log('Redirecting immediately to /checkout/');
      }, 1500);

    } catch (err) {
      console.error("Automation failed:", err);
    }
  }

  // 4) On each URL change, if we’re on a product page, run the routine
  function onLocationChange() {
    if (window.location.pathname.includes('/product/')) {
      runAutoCheckout();
    }
  }
  window.addEventListener('locationchange', onLocationChange);

  // 5) Also run once on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLocationChange);
  } else {
    onLocationChange();
  }
})();
