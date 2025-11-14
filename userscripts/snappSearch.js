(function() {
  // Convert Persian/Arabic digits to Western and parse int safely
  function normalizeNumber(text) {
    if (!text) return 0;
    const persianMap = {
      '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
    };
    const arabicMap = {
      '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'
    };
    const mapped = text.replace(/[۰-۹]/g, d => persianMap[d])
                       .replace(/[٠-٩]/g, d => arabicMap[d]);
    const digitsOnly = mapped.replace(/[^\d]/g, '');
    return parseInt(digitsOnly, 10) || 0;
  }

  function findBasePrice(card) {
    // Primary: span[dir="ltr"] inside Price block
    const priceBlock = card.querySelector('[data-sentry-element="Price"]');
    if (!priceBlock) return { value: 0, node: null, parentP: null };

    let priceSpan = priceBlock.querySelector('span[dir="ltr"]');
    // Fallback: any number inside p.price
    if (!priceSpan) {
      const pPrice = priceBlock.querySelector('p.price');
      if (pPrice) {
        const numbers = pPrice.textContent || '';
        const value = normalizeNumber(numbers);
        return { value, node: pPrice, parentP: pPrice };
      }
      return { value: 0, node: null, parentP: null };
    }

    const value = normalizeNumber(priceSpan.textContent);
    const parentP = priceSpan.closest('p.price') || priceBlock.querySelector('p.price') || priceSpan.parentElement;
    return { value, node: priceSpan, parentP };
  }

  function findDelivery(card) {
    const deliveryBlock = card.querySelector('[data-sentry-component="Delivery"]');
    if (!deliveryBlock) return 0;

    // Prefer the numeric <p> inside the value container
    // e.g., <div class="..."><p>21٬000</p><p>تومانء</p></div>
    const candidatePs = Array.from(deliveryBlock.querySelectorAll('p'));
    // Choose the first <p> that yields a number > 0
    for (const p of candidatePs) {
      const val = normalizeNumber(p.textContent);
      if (val > 0) return val;
    }

    // Fallback: look for numeric text in immediate child divs
    const candidateDivs = Array.from(deliveryBlock.querySelectorAll('div'));
    for (const div of candidateDivs) {
      const val = normalizeNumber(div.textContent);
      if (val > 0) return val;
    }

    return 0;
  }

  function formatFaIR(n) {
    // Force Persian locale formatting, with currency word following
    return n.toLocaleString('fa-IR') + ' تومان';
  }

  function upsertFinalPrice(card) {
    const { value: basePrice, parentP } = findBasePrice(card);
    if (!parentP || basePrice <= 0) return; // need a base price and container

    const delivery = findDelivery(card);
    const final = basePrice + delivery;

    // Find existing injected span
    let finalSpan = parentP.querySelector('span.final-price');
    if (!finalSpan) {
      finalSpan = document.createElement('span');
      finalSpan.className = 'final-price';
      finalSpan.style.color = 'red';
      finalSpan.style.marginLeft = '8px';
      finalSpan.setAttribute('data-final-price', 'true');

      // Insert before the "تومانء" span if present; else append
      const oldPriceSpan = parentP.querySelector('span.fipzEc');
      if (oldPriceSpan && oldPriceSpan.parentNode === parentP) {
        parentP.insertBefore(finalSpan, oldPriceSpan);
      } else {
        parentP.appendChild(finalSpan);
      }
    }
    // Update text every time (covers re-renders)
    finalSpan.textContent = formatFaIR(final);
  }

  function scanAll() {
    const cards = document.querySelectorAll('#search-vendor-product');
    cards.forEach(upsertFinalPrice);
  }

  // Initial scan
  scanAll();

  // Mutation observer with light debounce to avoid thrashing
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
