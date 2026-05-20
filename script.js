/**
 * script.js — Silly Stitches
 */

/* ============================================================
   1. MOBILE NAVIGATION TOGGLE
   ============================================================ */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const bars = toggle.querySelectorAll('span');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    });
  });
})();


/* ============================================================
   2. SCROLL REVEAL ANIMATION
   ============================================================ */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. ORDER FORM — Delivery toggle, validation & submission
   ============================================================ */
(function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const submitBtn       = document.getElementById('submitBtn');
  const errorMsg        = document.getElementById('errorMsg');
  const deliveryCheck   = document.getElementById('deliveryCheck');
  const addressGroup    = document.getElementById('addressGroup');
  const collectionOpts  = document.getElementById('collectionOptions');

  // ── Delivery checkbox: show/hide address vs collection ─────
  function applyDeliveryUI(isDelivery) {
    if (addressGroup)   addressGroup.style.display   = isDelivery ? 'block' : 'none';
    if (collectionOpts) collectionOpts.style.display = isDelivery ? 'none'  : 'block';
  }

  if (deliveryCheck) {
    deliveryCheck.addEventListener('change', function () {
      applyDeliveryUI(this.checked);
    });
  }

  // ── Success modal ──────────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'orderSuccessModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'osm-title');
  modal.setAttribute('aria-hidden', 'true');
  modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:9000;background:rgba(58,46,40,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:24px;';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;border:1.5px solid #e8d9c5;max-width:480px;width:100%;padding:48px 40px 40px;text-align:center;position:relative;box-shadow:0 24px 60px rgba(58,46,40,0.18);animation:osmSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;">
      <button id="osmClose" aria-label="Close" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;font-size:1.4rem;color:#a08070;line-height:1;padding:4px 8px;">&times;</button>
      <div style="font-size:2.8rem;margin-bottom:12px;">🎀</div>
      <h2 id="osm-title" style="font-family:var(--font-display,Georgia,serif);font-size:1.55rem;color:#3a2e28;margin:0 0 12px;font-weight:700;">Order sent!</h2>
      <p style="color:#5a4a42;font-size:0.97rem;line-height:1.65;margin:0 0 8px;">Your order has been received 🧵</p>
      <p style="color:#5a4a42;font-size:0.97rem;line-height:1.65;margin:0 0 24px;">
        Check your inbox — I've sent you a confirmation email.<br>
        I'll follow up within <strong>1–2 business days</strong> with a payment link,
        and once payment reflects I'll begin making your pieces!
      </p>
      <button id="osmDone" style="background:#c4706a;color:#fff;border:none;border-radius:50px;padding:14px 36px;font-size:0.95rem;font-weight:700;cursor:pointer;letter-spacing:0.02em;">✦ Got it — thank you! ✦</button>
      <p style="margin:20px 0 0;font-size:0.82rem;color:#a08070;">
        Questions? DM <a href="https://www.instagram.com/sillystitches.za" target="_blank" rel="noopener noreferrer" style="color:#c4706a;font-weight:700;">@sillystitches.za</a>
        or email <a href="mailto:sillystitchesza@gmail.com" style="color:#c4706a;font-weight:700;">sillystitchesza@gmail.com</a>
      </p>
    </div>
    <style>
      @keyframes osmSlideIn {
        from { opacity:0; transform:translateY(24px) scale(0.96); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
    </style>
  `;
  document.body.appendChild(modal);

  function openModal() {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('osmDone').focus();
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('osmClose').addEventListener('click', closeModal);
  document.getElementById('osmDone').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // ── Form submission ────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    submitBtn.textContent  = 'Sending…';
    submitBtn.disabled     = true;
    errorMsg.style.display = 'none';

    try {
      const data = new URLSearchParams(new FormData(form)).toString();

      const response = await fetch(form.action, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    data,
      });

      if (response.ok) {
        // ── Full reset ──────────────────────────────────────
        form.reset();

        // Reset delivery UI back to collection view
        if (deliveryCheck) deliveryCheck.checked = false;
        applyDeliveryUI(false);

        // Use the exposed reset function from section 9 to clear
        // the item rows, preview strip, and order total
        if (typeof window._ssResetOrderDisplay === 'function') {
          window._ssResetOrderDisplay();
        }

        // Scroll to top, then show popup
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(openModal, 400);

      } else {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${response.status}`);
      }

    } catch (err) {
      console.error('Order submission error:', err);
      errorMsg.style.display = 'block';
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      submitBtn.textContent = '✦ Send My Order ✦';
      submitBtn.disabled    = false;
    }
  });

  function validateForm(form) {
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';

      // Skip fields whose parent is hidden (e.g. address when delivery unchecked)
      if (!field.offsetParent) return;

      const value = field.value.trim();
      if (!value) {
        markInvalid(field, 'This field is required.');
        valid = false;
      } else if (field.type === 'email' && !isValidEmail(value)) {
        markInvalid(field, 'Please enter a valid email address.');
        valid = false;
      } else if (field.type === 'number' && (parseInt(value) < 1 || parseInt(value) > 20)) {
        markInvalid(field, 'Quantity must be between 1 and 20.');
        valid = false;
      }
    });

    return valid;
  }

  function markInvalid(field) {
    field.style.borderColor = 'var(--red-muted)';
    field.style.boxShadow   = '0 0 0 4px rgba(196,112,106,0.2)';
    field.focus();
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    }, { once: true });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();


/* ============================================================
   4. PRE-FILL PRODUCT FROM URL QUERY PARAM
   ============================================================ */
(function prefillProductFromURL() {
  const select = document.getElementById('product');
  if (!select) return;

  const params      = new URLSearchParams(window.location.search);
  const productName = params.get('product');
  if (!productName) return;

  const match = Array.from(select.options).find(opt =>
    opt.value.toLowerCase() === productName.toLowerCase()
  );
  if (match) select.value = match.value;
})();


/* ============================================================
   5. SHOP FILTER BUTTONS
   ============================================================ */
(function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!cards.length) return;

  const filterBar = document.querySelector('.shop-filter');
  const countEl   = document.createElement('p');
  countEl.id        = 'filterCount';
  countEl.className = 'filter-count';
  filterBar.insertAdjacentElement('afterend', countEl);

  function applyFilter(value) {
    let visible = 0;
    cards.forEach(card => {
      const match = value === 'all' || card.dataset.category === value;
      card.classList.toggle('card-hidden', !match);
      if (match) visible++;
    });
    if (value === 'all') {
      countEl.textContent = '';
    } else {
      const label = filterBtns[[...filterBtns].findIndex(b => b.dataset.filter === value)].textContent;
      countEl.textContent = `${visible} product${visible !== 1 ? 's' : ''} in ${label}`;
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  const initial = document.querySelector('.filter-btn.active[data-filter]');
  if (initial) applyFilter(initial.dataset.filter);
})();


/* ============================================================
   Shared helper — look up a product's image array, or []
   ============================================================ */
function _getProductImages(name) {
  const data = window.SILLY_STITCHES_PRODUCTS;
  if (!data || !data.products || !name) return [];
  return data.products[name] || [];
}


/* ============================================================
   6. HERO IMAGE CAROUSEL
   ============================================================ */
(function initHeroCarousel() {
  const wrap = document.querySelector('.hero-image-wrap');
  if (!wrap) return;

  const data = window.SILLY_STITCHES_PRODUCTS && window.SILLY_STITCHES_PRODUCTS.hero;
  if (!data || !Array.isArray(data.images) || data.images.length < 2) return;

  const existing = wrap.querySelector('img');
  const altText  = existing ? existing.alt : 'Hero image';

  wrap.innerHTML = '';
  wrap.classList.add('hero-carousel');
  wrap.classList.add(data.animation === 'flip' ? 'anim-flip' : 'anim-fade');

  data.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src     = src;
    img.alt     = altText;
    img.loading = i === 0 ? 'eager' : 'lazy';
    if (i === 0) img.classList.add('active');
    wrap.appendChild(img);
  });

  const imgs = wrap.querySelectorAll('img');
  let current = 0;

  function advance() {
    const next    = (current + 1) % imgs.length;
    const cur     = imgs[current];
    const nextImg = imgs[next];

    if (data.animation === 'flip') {
      cur.classList.add('flipping-out');
      setTimeout(() => {
        cur.classList.remove('active', 'flipping-out');
        nextImg.classList.add('active', 'flipping-in');
        void nextImg.offsetWidth;
        nextImg.classList.remove('flipping-in');
      }, 350);
    } else {
      cur.classList.remove('active');
      nextImg.classList.add('active');
    }
    current = next;
  }

  setInterval(advance, data.intervalMs || 4500);
})();


/* ============================================================
   7. PRODUCT CARD HOVER SLIDESHOW
   ============================================================ */
(function initProductCardCarousels() {
  const cards = document.querySelectorAll('.product-card[data-product]');
  if (!cards.length) return;

  cards.forEach(card => {
    const name     = card.getAttribute('data-product');
    const images   = _getProductImages(name);
    if (!images.length) return;

    const imageBox = card.querySelector('.product-image');
    if (!imageBox) return;

    if (images.length < 2) {
      imageBox.style.cursor = 'zoom-in';
      imageBox.addEventListener('click', e => {
        if (e.target.closest('a, button')) return;
        window.SillyStitchesLightbox.open(images, 0, name);
      });
      return;
    }

    const badge   = imageBox.querySelector('.product-badge');
    const origImg = imageBox.querySelector('img');
    const altText = origImg ? origImg.alt : name;

    imageBox.querySelectorAll('img').forEach(el => el.remove());
    imageBox.classList.add('has-carousel');
    if (badge && !imageBox.contains(badge)) imageBox.appendChild(badge);

    images.forEach((src, i) => {
      const img     = document.createElement('img');
      img.src       = src;
      img.alt       = altText;
      img.loading   = i === 0 ? 'eager' : 'lazy';
      img.className = 'carousel-layer' + (i === 0 ? ' active' : '');
      imageBox.appendChild(img);
    });

    let idx = 0;
    imageBox.style.cursor = 'zoom-in';
    imageBox.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      window.SillyStitchesLightbox.open(images, idx, name);
    });

    const layers = imageBox.querySelectorAll('.carousel-layer');
    let timer = null;

    function show(i) {
      layers[idx].classList.remove('active');
      idx = i % layers.length;
      layers[idx].classList.add('active');
    }

    card.addEventListener('mouseenter', () => { timer = setInterval(() => show(idx + 1), 900); });
    card.addEventListener('mouseleave', () => { clearInterval(timer); show(0); });
  });
})();


/* ============================================================
   8. LIGHTBOX MODAL
   ============================================================ */
(function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'ss-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <button class="ss-lb-close" aria-label="Close gallery">&times;</button>
    <button class="ss-lb-prev"  aria-label="Previous image">&lsaquo;</button>
    <button class="ss-lb-next"  aria-label="Next image">&rsaquo;</button>
    <div class="ss-lb-dots" role="tablist"></div>
    <figure class="ss-lb-stage">
      <div class="ss-lb-img-wrap">
        <img class="ss-lb-img" alt="" />
        <button class="ss-lb-zone ss-lb-zone-l" tabindex="-1" aria-hidden="true"></button>
        <button class="ss-lb-zone ss-lb-zone-r" tabindex="-1" aria-hidden="true"></button>
      </div>
      <figcaption class="ss-lb-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const imgEl     = overlay.querySelector('.ss-lb-img');
  const captionEl = overlay.querySelector('.ss-lb-caption');
  const dotsEl    = overlay.querySelector('.ss-lb-dots');
  const prevBtn   = overlay.querySelector('.ss-lb-prev');
  const nextBtn   = overlay.querySelector('.ss-lb-next');
  const closeBtn  = overlay.querySelector('.ss-lb-close');
  const zoneL     = overlay.querySelector('.ss-lb-zone-l');
  const zoneR     = overlay.querySelector('.ss-lb-zone-r');

  let state = { images: [], idx: 0, title: '' };

  function render() {
    imgEl.src = state.images[state.idx];
    imgEl.alt = `${state.title} — image ${state.idx + 1} of ${state.images.length}`;
    captionEl.textContent = state.images.length > 1
      ? `${state.title} · ${state.idx + 1} / ${state.images.length}`
      : state.title;

    const multi = state.images.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
    dotsEl.style.display  = multi ? '' : 'none';
    zoneL.style.display   = multi ? '' : 'none';
    zoneR.style.display   = multi ? '' : 'none';

    dotsEl.innerHTML = '';
    if (multi) {
      state.images.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'ss-lb-dot' + (i === state.idx ? ' active' : '');
        d.setAttribute('aria-label', `Go to image ${i + 1}`);
        d.addEventListener('click', () => { state.idx = i; render(); });
        dotsEl.appendChild(d);
      });
    }
  }

  function open(images, startIndex, title) {
    if (!images || !images.length) return;
    state = { images, idx: startIndex || 0, title: title || '' };
    render();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function next() { state.idx = (state.idx + 1) % state.images.length; render(); }
  function prev() { state.idx = (state.idx - 1 + state.images.length) % state.images.length; render(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  zoneL.addEventListener('click', prev);
  zoneR.addEventListener('click', next);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  window.SillyStitchesLightbox = { open, close };
})();


/* ============================================================
   9. ORDER PAGE — item rows, preview, total & delivery
   ============================================================ */
(function initOrderItems() {
  const list      = document.getElementById('orderItemsList');
  const addBtn    = document.getElementById('addItemBtn');
  const host      = document.getElementById('orderProductPreview');
  const totalHost = document.getElementById('orderTotal');
  if (!list || !addBtn || !host) return;

  const optionsHTML = list.querySelector('select').innerHTML;

  function getPrice(name) {
    const data = window.SILLY_STITCHES_PRODUCTS;
    if (!data || !data.prices) return undefined;
    return data.prices[name];
  }

  function syncRemoveButtons() {
    const rows = list.querySelectorAll('.order-item-row');
    list.classList.toggle('single-row', rows.length === 1);
  }

  function getItems() {
    const items = [];
    list.querySelectorAll('.order-item-row').forEach(row => {
      const sel = row.querySelector('select');
      const qty = row.querySelector('input[type="number"]');
      if (!sel || !qty) return;
      const name   = sel.value;
      const qtyVal = Math.max(1, parseInt(qty.value, 10) || 1);
      if (name) items.push({ name, qty: qtyVal });
    });
    return items;
  }

  function updatePreview() {
    const items = getItems();

    if (!items.length) {
      host.classList.remove('visible');
      host.innerHTML = '';
      return;
    }

    host.innerHTML = `
      <div class="op-header"><strong>You're ordering:</strong></div>
      <div class="op-strip">
        ${items.map(({ name, qty }) => {
          const images = _getProductImages(name);
          const src    = images[0] || '';
          if (!src) return '';
          return `
            <div class="op-item">
              <button type="button" class="op-thumb" data-product="${name}" aria-label="View ${name}">
                <img src="${src}" alt="${name}" loading="lazy" />
                ${qty > 1 ? `<span class="op-qty-badge">&times;${qty}</span>` : ''}
              </button>
              <span class="op-item-label">${name}</span>
            </div>`;
        }).join('')}
      </div>
      <p class="op-hint">Click any image to enlarge</p>
    `;
    host.classList.add('visible');

    host.querySelectorAll('.op-thumb').forEach(btn => {
      const name   = btn.getAttribute('data-product');
      const images = _getProductImages(name);
      btn.addEventListener('click', () => {
        window.SillyStitchesLightbox.open(images.length ? images : [btn.querySelector('img').src], 0, name);
      });
    });
  }

  function updateTotal() {
    if (!totalHost) return;
    const items       = getItems();
    const hasDelivery = document.getElementById('deliveryCheck')?.checked || false;

    if (!items.length) {
      totalHost.classList.remove('visible');
      totalHost.innerHTML = '';
      return;
    }

    let fixedSum = 0;
    let hasFrom  = false;
    let hasPOA   = false;

    const lineHtml = items.map(({ name, qty }) => {
      const price = getPrice(name);

      if (price === null || price === undefined) {
        hasPOA = true;
        return `<div class="ot-line">
          <span class="ot-name">${name}${qty > 1 ? ` ×${qty}` : ''}</span>
          <span class="ot-price ot-poa">price on request</span>
        </div>`;
      }
      if (typeof price === 'object' && price.from) {
        hasFrom = true;
        const lineTotal = price.amount * qty;
        fixedSum += lineTotal;
        return `<div class="ot-line">
          <span class="ot-name">${name}${qty > 1 ? ` ×${qty}` : ''}</span>
          <span class="ot-price ot-from">from R${lineTotal.toFixed(2)}</span>
        </div>`;
      }
      const lineTotal = price * qty;
      fixedSum += lineTotal;
      return `<div class="ot-line">
        <span class="ot-name">${name}${qty > 1 ? ` ×${qty}` : ''}</span>
        <span class="ot-price">R${lineTotal.toFixed(2)}</span>
      </div>`;
    }).join('');

    // Delivery line
    const deliveryLine = hasDelivery ? `
      <div class="ot-line">
        <span class="ot-name">Delivery</span>
        <span class="ot-price ot-poa">To be confirmed</span>
      </div>` : '';

    // Summary label
    let totalLabel, totalClass;
    if (hasPOA && fixedSum === 0) {
      totalLabel = hasDelivery ? 'To be confirmed + Delivery Fee' : 'To be confirmed';
      totalClass = 'ot-total-poa';
    } else if (hasPOA || hasFrom) {
      totalLabel = hasDelivery ? `from R${fixedSum.toFixed(2)} + Delivery Fee` : `from R${fixedSum.toFixed(2)}`;
      totalClass = 'ot-total-from';
    } else {
      totalLabel = hasDelivery ? `R${fixedSum.toFixed(2)} + Delivery Fee` : `R${fixedSum.toFixed(2)}`;
      totalClass = hasDelivery ? 'ot-total-from' : '';
    }

    totalHost.innerHTML = `
      <div class="ot-lines">${lineHtml}${deliveryLine}</div>
      <div class="ot-summary">
        <span class="ot-summary-label">Estimated total</span>
        <span class="ot-summary-amount ${totalClass}">${totalLabel}</span>
      </div>
      ${(hasPOA || hasFrom || hasDelivery) ? '<p class="ot-disclaimer">Final price confirmed when I reply to your order.</p>' : ''}
    `;
    totalHost.classList.add('visible');
  }

  function wireRow(row) {
    row.querySelector('select').addEventListener('change', () => { updatePreview(); updateTotal(); });
    row.querySelector('input[type="number"]').addEventListener('input', () => { updatePreview(); updateTotal(); });
    row.querySelector('.oir-remove').addEventListener('click', () => {
      row.remove();
      syncRemoveButtons();
      updatePreview();
      updateTotal();
    });
  }

  wireRow(list.querySelector('.order-item-row'));
  syncRemoveButtons();

  // Wire delivery checkbox directly so the total updates when it changes
  const deliveryCb = document.getElementById('deliveryCheck');
  if (deliveryCb) {
    deliveryCb.addEventListener('change', () => updateTotal());
  }

  addBtn.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'order-item-row';
    newRow.innerHTML = `
      <div class="select-wrap oir-select">
        <select name="product[]" class="form-select" required aria-label="Product">
          ${optionsHTML}
        </select>
      </div>
      <input type="number" name="quantity[]" class="form-input oir-qty-input"
             value="1" min="1" max="20" required aria-label="Quantity" />
      <button type="button" class="oir-remove" aria-label="Remove this item">&times;</button>
    `;
    list.appendChild(newRow);
    wireRow(newRow);
    syncRemoveButtons();
    newRow.querySelector('select').focus();
  });

  // Expose a reset function for section 3 to call after successful submission
  window._ssResetOrderDisplay = function () {
    // Remove extra rows, reset first row's select
    list.querySelectorAll('.order-item-row').forEach((row, i) => {
      if (i > 0) row.remove();
    });
    const firstSelect = list.querySelector('select');
    if (firstSelect) firstSelect.value = '';
    syncRemoveButtons();

    // Clear preview and total
    host.innerHTML = '';
    host.classList.remove('visible');
    if (totalHost) {
      totalHost.innerHTML = '';
      totalHost.classList.remove('visible');
    }
  };

  setTimeout(() => { updatePreview(); updateTotal(); }, 0);
})();
