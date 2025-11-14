(function() {
  // Map Persian & Arabic digits to Western; strip non-digits; parse safely
  function normalizeNumber(text) {
    if (!text) return 0;
    const persian = { '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9' };
    const arabic  = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9' };
    const mapped = text
      .replace(/[۰-۹]/g, d => persian[d])
      .replace(/[٠-٩]/g, d => arabic[d]);
    const digitsOnly = mapped.replace(/[^\d]/g, '');
    return parseInt(digitsOnly, 10) || 0;
  }

  function formatFaIR(n) {
    return n.toLocaleString('fa-IR') + ' تومان';
  }

  // Find the "current" payable price: the numeric inside p.price
  function findCurrentPrice(card) {
    const priceBlock = card.querySelector('[data-sentry-element="Price"]');
    if (!priceBlock) return { value: 0, parentP: null };

    // Target the <p class="price"> container
    const pPrice = priceBlock.querySelector('p.price');
    if (!pPrice) return { value: 0, parentP: null };

    // Prefer numeric span inside p.price; fallback to all text within p.price
    const numericSpan = pPrice.querySelector('span[dir="ltr"]');
    const value = normalizeNumber(numericSpan ? numericSpan.textContent : pPrice.textContent);

    return { value, parentP: pPrice };
  }

  // Extract delivery fee robustly from the Delivery block
  function findDelivery(card) {
    const deliveryBlock = card.querySelector('[data-sentry-component="Delivery"]');
    if (!deliveryBlock) return 0;

    // First, check <p> tags in the delivery block and pick the first > 0
    const pTags = Array.from(deliveryBlock.querySelectorAll('p'));
    for (const p of pTags) {
      const val = normalizeNumber(p.textContent);
      if (val > 0) return val;
    }

    // Fallback: scan text of child divs for a number
    const divs = Array.from(deliveryBlock.querySelectorAll('div'));
    for (const div of divs) {
      const val = normalizeNumber(div.textContent);
      if (val > 0) return val;
    }

    return 0;
  }

  function upsertFinalPrice(card) {
    const { value: currentPrice, parentP } = findCurrentPrice(card);
    if (!parentP || currentPrice <= 0) return;

    const delivery = findDelivery(card);
    const final = currentPrice + delivery;

    // Find or create the final-price span
    let finalSpan = parentP.querySelector('span.final-price');
    if (!finalSpan) {
      finalSpan = document.createElement('span');
      finalSpan.className = 'final-price';
      finalSpan.style.color = 'red';
      finalSpan.style.marginLeft = '8px';
      finalSpan.setAttribute('data-final-price', 'true');

      // Insert before the currency token "تومانء" if present
      const currencyToken = parentP.querySelector('span.fipzEc');
      if (currencyToken && currencyToken.parentNode === parentP) {
        parentP.insertBefore(finalSpan, currencyToken);
      } else {
        parentP.appendChild(finalSpan);
      }
    }
    // Always update text, so re-renders adjust the value
    finalSpan.textContent = formatFaIR(final);
  }

  function scanAll() {
    const cards = document.querySelectorAll('#search-vendor-product');
    cards.forEach(upsertFinalPrice);
  }

  // Initial run
  scanAll();

  // Debounced observer to handle live DOM changes
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scanAll();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
