/**
 * script.js — Silly Stitches
 */

/* ============================================================
   1. MOBILE NAV TOGGLE
   ============================================================ */
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const bars = toggle.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = bars[1].style.opacity = bars[2].style.transform = '';
    }
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = s.style.opacity = ''; });
    });
  });
}());


/* ============================================================
   2. SCROLL REVEAL
   ============================================================ */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  els.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; });

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => obs.observe(el));
}());


/* ============================================================
   3. ORDER FORM
   — delivery toggle
   — validation
   — submission + FULL SELF-CONTAINED RESET
   ============================================================ */
(function () {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const submitBtn       = document.getElementById('submitBtn');
  const errorMsg        = document.getElementById('errorMsg');

  /* ── Delivery toggle ──────────────────────────────────────── */
  const deliveryCheck   = document.getElementById('deliveryCheck');
  const addressGroup    = document.getElementById('addressGroup');
  const collectionOpts  = document.getElementById('collectionOptions');

  function showDelivery(on) {
    if (addressGroup)   addressGroup.style.display   = on ? 'block' : 'none';
    if (collectionOpts) collectionOpts.style.display = on ? 'none'  : 'block';
  }

  if (deliveryCheck) {
    deliveryCheck.addEventListener('change', function () { showDelivery(this.checked); });
  }

  /* ── Success modal ────────────────────────────────────────── */
  const modal = document.createElement('div');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.style.cssText =
    'display:none;position:fixed;inset:0;z-index:9000;' +
    'background:rgba(58,46,40,0.55);backdrop-filter:blur(4px);' +
    '-webkit-backdrop-filter:blur(4px);' +
    'align-items:center;justify-content:center;padding:24px;';

  modal.innerHTML =
    '<div style="background:#fff;border-radius:20px;border:1.5px solid #e8d9c5;' +
    'max-width:480px;width:100%;padding:48px 40px 40px;text-align:center;' +
    'position:relative;box-shadow:0 24px 60px rgba(58,46,40,0.18);' +
    'animation:osmIn .35s cubic-bezier(.34,1.56,.64,1) both;">' +
      '<button id="osmClose" style="position:absolute;top:16px;right:16px;' +
      'background:none;border:none;cursor:pointer;font-size:1.4rem;color:#a08070;">&times;</button>' +
      '<div style="font-size:2.8rem;margin-bottom:12px;">🎀</div>' +
      '<h2 style="font-family:var(--font-display,Georgia,serif);font-size:1.55rem;' +
      'color:#3a2e28;margin:0 0 12px;font-weight:700;">Order sent!</h2>' +
      '<p style="color:#5a4a42;font-size:.97rem;line-height:1.65;margin:0 0 8px;">Your order has been received 🧵</p>' +
      '<p style="color:#5a4a42;font-size:.97rem;line-height:1.65;margin:0 0 24px;">' +
      'Check your inbox — a confirmation is on its way.<br>' +
      'I\'ll follow up within <strong>1–2 business days</strong> with a payment link.' +
      'Once payment reflects I\'ll begin your pieces!</p>' +
      '<button id="osmDone" style="background:#c4706a;color:#fff;border:none;' +
      'border-radius:50px;padding:14px 36px;font-size:.95rem;font-weight:700;cursor:pointer;">' +
      '✦ Got it — thank you! ✦</button>' +
      '<p style="margin:20px 0 0;font-size:.82rem;color:#a08070;">Questions? DM ' +
      '<a href="https://www.instagram.com/sillystitches.za" target="_blank" ' +
      'style="color:#c4706a;font-weight:700;">@sillystitches.za</a></p>' +
    '</div>' +
    '<style>@keyframes osmIn{from{opacity:0;transform:translateY(24px) scale(.96)}' +
    'to{opacity:1;transform:translateY(0) scale(1)}}</style>';

  document.body.appendChild(modal);

  function openModal()  {
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

  /* ── Submit handler ───────────────────────────────────────── */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    submitBtn.textContent  = 'Sending…';
    submitBtn.disabled     = true;
    errorMsg.style.display = 'none';

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams(new FormData(form)).toString(),
      });

      if (res.ok) {
        fullReset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(openModal, 400);
      } else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Server error ' + res.status);
      }

    } catch (err) {
      console.error('Order error:', err);
      errorMsg.style.display = 'block';
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      submitBtn.textContent = '✦ Send My Order ✦';
      submitBtn.disabled    = false;
    }
  });

  /* ── Full reset ───────────────────────────────────────────────
     Self-contained: resets every part of the order form.
     Does NOT rely on any other section or global function.
  ──────────────────────────────────────────────────────────── */
  function fullReset() {
    // 1. Native form reset (name, email, notes, qty inputs)
    form.reset();

    // 2. Delivery UI back to collection mode
    if (deliveryCheck) deliveryCheck.checked = false;
    showDelivery(false);

    // 3. Remove extra item rows; reset first row's select to placeholder
    const itemsList = document.getElementById('orderItemsList');
    if (itemsList) {
      itemsList.querySelectorAll('.order-item-row').forEach((row, i) => {
        if (i > 0) row.remove();
      });
      const firstSelect = itemsList.querySelector('select');
      if (firstSelect) firstSelect.selectedIndex = 0;
      itemsList.classList.add('single-row');
    }

    // 4. Clear the product preview strip
    const preview = document.getElementById('orderProductPreview');
    if (preview) { preview.innerHTML = ''; preview.classList.remove('visible'); }

    // 5. Clear the order total
    const total = document.getElementById('orderTotal');
    if (total) { total.innerHTML = ''; total.classList.remove('visible'); }
  }

  /* ── Validation ───────────────────────────────────────────── */
  function validateForm() {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
      if (!field.offsetParent) return; // skip hidden fields
      const val = field.value.trim();
      if (!val || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
        field.style.borderColor = 'var(--red-muted)';
        field.style.boxShadow   = '0 0 0 4px rgba(196,112,106,0.2)';
        if (valid) field.focus();
        valid = false;
        field.addEventListener('input', () => {
          field.style.borderColor = field.style.boxShadow = '';
        }, { once: true });
      }
    });
    return valid;
  }
}());


/* ============================================================
   4. PRE-FILL PRODUCT FROM URL
   ============================================================ */
(function () {
  const select = document.getElementById('product');
  if (!select) return;
  const name = new URLSearchParams(window.location.search).get('product');
  if (!name) return;
  const match = Array.from(select.options).find(o => o.value.toLowerCase() === name.toLowerCase());
  if (match) select.value = match.value;
}());


/* ============================================================
   5. SHOP FILTER BUTTONS
   ============================================================ */
(function () {
  const btns  = document.querySelectorAll('.filter-btn[data-filter]');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!btns.length || !cards.length) return;

  const bar     = document.querySelector('.shop-filter');
  const countEl = document.createElement('p');
  countEl.id = 'filterCount'; countEl.className = 'filter-count';
  bar.insertAdjacentElement('afterend', countEl);

  function apply(val) {
    let n = 0;
    cards.forEach(c => {
      const show = val === 'all' || c.dataset.category === val;
      c.classList.toggle('card-hidden', !show);
      if (show) n++;
    });
    countEl.textContent = val === 'all' ? '' :
      n + ' product' + (n !== 1 ? 's' : '') + ' in ' +
      btns[[...btns].findIndex(b => b.dataset.filter === val)].textContent;
  }

  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    apply(b.dataset.filter);
  }));

  const init = document.querySelector('.filter-btn.active[data-filter]');
  if (init) apply(init.dataset.filter);
}());


/* ============================================================
   Shared: look up product images
   ============================================================ */
function _getProductImages(name) {
  const d = window.SILLY_STITCHES_PRODUCTS;
  return (d && d.products && d.products[name]) || [];
}


/* ============================================================
   6. HERO CAROUSEL
   ============================================================ */
(function () {
  const wrap = document.querySelector('.hero-image-wrap');
  if (!wrap) return;
  const d = window.SILLY_STITCHES_PRODUCTS && window.SILLY_STITCHES_PRODUCTS.hero;
  if (!d || !Array.isArray(d.images) || d.images.length < 2) return;

  const alt = (wrap.querySelector('img') || {}).alt || 'Hero image';
  wrap.innerHTML = '';
  wrap.classList.add('hero-carousel', d.animation === 'flip' ? 'anim-flip' : 'anim-fade');

  d.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src; img.alt = alt; img.loading = i ? 'lazy' : 'eager';
    if (!i) img.classList.add('active');
    wrap.appendChild(img);
  });

  const imgs = wrap.querySelectorAll('img');
  let cur = 0;

  setInterval(() => {
    const nxt = (cur + 1) % imgs.length;
    if (d.animation === 'flip') {
      imgs[cur].classList.add('flipping-out');
      setTimeout(() => {
        imgs[cur].classList.remove('active', 'flipping-out');
        imgs[nxt].classList.add('active', 'flipping-in');
        void imgs[nxt].offsetWidth;
        imgs[nxt].classList.remove('flipping-in');
      }, 350);
    } else {
      imgs[cur].classList.remove('active');
      imgs[nxt].classList.add('active');
    }
    cur = nxt;
  }, d.intervalMs || 4500);
}());


/* ============================================================
   7. PRODUCT CARD HOVER SLIDESHOW
   ============================================================ */
(function () {
  document.querySelectorAll('.product-card[data-product]').forEach(card => {
    const name   = card.getAttribute('data-product');
    const images = _getProductImages(name);
    if (!images.length) return;

    const box = card.querySelector('.product-image');
    if (!box) return;

    if (images.length < 2) {
      box.style.cursor = 'zoom-in';
      box.addEventListener('click', e => {
        if (!e.target.closest('a, button')) window.SillyStitchesLightbox.open(images, 0, name);
      });
      return;
    }

    const badge = box.querySelector('.product-badge');
    const alt   = (box.querySelector('img') || {}).alt || name;
    box.querySelectorAll('img').forEach(el => el.remove());
    box.classList.add('has-carousel');
    if (badge) box.appendChild(badge);

    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = alt; img.loading = i ? 'lazy' : 'eager';
      img.className = 'carousel-layer' + (i ? '' : ' active');
      box.appendChild(img);
    });

    const layers = box.querySelectorAll('.carousel-layer');
    let idx = 0, timer;

    box.style.cursor = 'zoom-in';
    box.addEventListener('click', e => {
      if (!e.target.closest('a, button')) window.SillyStitchesLightbox.open(images, idx, name);
    });

    function show(i) {
      layers[idx].classList.remove('active');
      idx = i % layers.length;
      layers[idx].classList.add('active');
    }
    card.addEventListener('mouseenter', () => { timer = setInterval(() => show(idx + 1), 900); });
    card.addEventListener('mouseleave', () => { clearInterval(timer); show(0); });
  });
}());


/* ============================================================
   8. LIGHTBOX
   ============================================================ */
(function () {
  const ov = document.createElement('div');
  ov.className = 'ss-lightbox';
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-hidden', 'true');
  ov.innerHTML =
    '<button class="ss-lb-close" aria-label="Close">&times;</button>' +
    '<button class="ss-lb-prev" aria-label="Previous">&lsaquo;</button>' +
    '<button class="ss-lb-next" aria-label="Next">&rsaquo;</button>' +
    '<div class="ss-lb-dots" role="tablist"></div>' +
    '<figure class="ss-lb-stage"><div class="ss-lb-img-wrap">' +
    '<img class="ss-lb-img" alt="" />' +
    '<button class="ss-lb-zone ss-lb-zone-l" tabindex="-1" aria-hidden="true"></button>' +
    '<button class="ss-lb-zone ss-lb-zone-r" tabindex="-1" aria-hidden="true"></button>' +
    '</div><figcaption class="ss-lb-caption"></figcaption></figure>';
  document.body.appendChild(ov);

  const imgEl = ov.querySelector('.ss-lb-img');
  const capEl = ov.querySelector('.ss-lb-caption');
  const dots  = ov.querySelector('.ss-lb-dots');
  const prev  = ov.querySelector('.ss-lb-prev');
  const next  = ov.querySelector('.ss-lb-next');
  const zL    = ov.querySelector('.ss-lb-zone-l');
  const zR    = ov.querySelector('.ss-lb-zone-r');
  let st = { images: [], idx: 0, title: '' };

  function render() {
    imgEl.src = st.images[st.idx];
    imgEl.alt = st.title + ' — ' + (st.idx + 1) + ' of ' + st.images.length;
    capEl.textContent = st.images.length > 1 ? st.title + ' · ' + (st.idx+1) + ' / ' + st.images.length : st.title;
    const m = st.images.length > 1;
    [prev, next, dots, zL, zR].forEach(el => { el.style.display = m ? '' : 'none'; });
    dots.innerHTML = '';
    if (m) st.images.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'ss-lb-dot' + (i === st.idx ? ' active' : '');
      d.setAttribute('aria-label', 'Image ' + (i+1));
      d.addEventListener('click', () => { st.idx = i; render(); });
      dots.appendChild(d);
    });
  }

  function open(images, i, title) {
    if (!images || !images.length) return;
    st = { images, idx: i || 0, title: title || '' };
    render(); ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function go(d) { st.idx = (st.idx + d + st.images.length) % st.images.length; render(); }

  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  zL.addEventListener('click', () => go(-1));   zR.addEventListener('click', () => go(1));
  ov.querySelector('.ss-lb-close').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.addEventListener('keydown', e => {
    if (!ov.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft')  go(-1);
  });

  window.SillyStitchesLightbox = { open, close };
}());


/* ============================================================
   9. ORDER ITEMS — rows, preview, total
   ============================================================ */
(function () {
  const list      = document.getElementById('orderItemsList');
  const addBtn    = document.getElementById('addItemBtn');
  const host      = document.getElementById('orderProductPreview');
  const totalHost = document.getElementById('orderTotal');
  if (!list || !addBtn || !host) return;

  const optHTML = list.querySelector('select').innerHTML;

  /* Reference to the delivery checkbox — looked up once. */
  const deliveryCb = document.getElementById('deliveryCheck');

  function price(name) {
    const d = window.SILLY_STITCHES_PRODUCTS;
    return d && d.prices ? d.prices[name] : undefined;
  }

  function syncRemove() {
    list.classList.toggle('single-row', list.querySelectorAll('.order-item-row').length === 1);
  }

  function items() {
    const out = [];
    list.querySelectorAll('.order-item-row').forEach(row => {
      const s = row.querySelector('select');
      const q = row.querySelector('input[type="number"]');
      if (s && q && s.value) out.push({ name: s.value, qty: Math.max(1, parseInt(q.value) || 1) });
    });
    return out;
  }

  function updatePreview() {
    const its = items();
    if (!its.length) { host.innerHTML = ''; host.classList.remove('visible'); return; }

    host.innerHTML =
      '<div class="op-header"><strong>You\'re ordering:</strong></div>' +
      '<div class="op-strip">' +
      its.map(({ name, qty }) => {
        const src = (_getProductImages(name) || [])[0];
        if (!src) return '';
        return '<div class="op-item">' +
          '<button type="button" class="op-thumb" data-product="' + name + '" aria-label="View ' + name + '">' +
          '<img src="' + src + '" alt="' + name + '" loading="lazy" />' +
          (qty > 1 ? '<span class="op-qty-badge">&times;' + qty + '</span>' : '') +
          '</button><span class="op-item-label">' + name + '</span></div>';
      }).join('') +
      '</div><p class="op-hint">Click any image to enlarge</p>';

    host.classList.add('visible');
    host.querySelectorAll('.op-thumb').forEach(btn => {
      const n = btn.getAttribute('data-product');
      btn.addEventListener('click', () => {
        const imgs = _getProductImages(n);
        window.SillyStitchesLightbox.open(imgs.length ? imgs : [btn.querySelector('img').src], 0, n);
      });
    });
  }

  function updateTotal() {
    if (!totalHost) return;
    const its         = items();
    const hasDelivery = !!(deliveryCb && deliveryCb.checked);

    if (!its.length) { totalHost.innerHTML = ''; totalHost.classList.remove('visible'); return; }

    let sum = 0, hasFrom = false, hasPOA = false;

    const lines = its.map(({ name, qty }) => {
      const p = price(name);
      if (p === null || p === undefined) {
        hasPOA = true;
        return '<div class="ot-line"><span class="ot-name">' + name + (qty > 1 ? ' \xd7' + qty : '') + '</span>' +
               '<span class="ot-price ot-poa">price on request</span></div>';
      }
      if (typeof p === 'object' && p.from) {
        hasFrom = true;
        const t = p.amount * qty; sum += t;
        return '<div class="ot-line"><span class="ot-name">' + name + (qty > 1 ? ' \xd7' + qty : '') + '</span>' +
               '<span class="ot-price ot-from">from R' + t.toFixed(2) + '</span></div>';
      }
      const t = p * qty; sum += t;
      return '<div class="ot-line"><span class="ot-name">' + name + (qty > 1 ? ' \xd7' + qty : '') + '</span>' +
             '<span class="ot-price">R' + t.toFixed(2) + '</span></div>';
    }).join('');

    /* Delivery line item */
    const deliveryLine = hasDelivery
      ? '<div class="ot-line"><span class="ot-name">Delivery</span>' +
        '<span class="ot-price ot-poa">To be confirmed</span></div>'
      : '';

    /* Summary label */
    let label, cls;
    if (hasPOA && sum === 0) {
      label = hasDelivery ? 'To be confirmed + Delivery' : 'To be confirmed';
      cls   = 'ot-total-poa';
    } else if (hasPOA || hasFrom) {
      label = 'from R' + sum.toFixed(2) + (hasDelivery ? ' + Delivery' : '');
      cls   = 'ot-total-from';
    } else {
      label = 'R' + sum.toFixed(2) + (hasDelivery ? ' + Delivery' : '');
      cls   = hasDelivery ? 'ot-total-from' : '';
    }

    const disclaimer = (hasPOA || hasFrom || hasDelivery)
      ? '<p class="ot-disclaimer">Final price confirmed when I reply to your order.</p>' : '';

    totalHost.innerHTML =
      '<div class="ot-lines">' + lines + deliveryLine + '</div>' +
      '<div class="ot-summary">' +
      '<span class="ot-summary-label">Estimated total</span>' +
      '<span class="ot-summary-amount ' + cls + '">' + label + '</span>' +
      '</div>' + disclaimer;
    totalHost.classList.add('visible');
  }

  function wireRow(row) {
    row.querySelector('select').addEventListener('change', () => { updatePreview(); updateTotal(); });
    row.querySelector('input[type="number"]').addEventListener('input', () => { updatePreview(); updateTotal(); });
    row.querySelector('.oir-remove').addEventListener('click', () => {
      row.remove(); syncRemove(); updatePreview(); updateTotal();
    });
  }

  wireRow(list.querySelector('.order-item-row'));
  syncRemove();

  /* Wire delivery checkbox so total updates immediately when ticked */
  if (deliveryCb) {
    deliveryCb.addEventListener('change', () => updateTotal());
  }

  addBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'order-item-row';
    row.innerHTML =
      '<div class="select-wrap oir-select">' +
      '<select name="product[]" class="form-select" required aria-label="Product">' + optHTML + '</select>' +
      '</div>' +
      '<input type="number" name="quantity[]" class="form-input oir-qty-input" value="1" min="1" max="20" required aria-label="Quantity" />' +
      '<button type="button" class="oir-remove" aria-label="Remove">&times;</button>';
    list.appendChild(row);
    wireRow(row);
    syncRemove();
    row.querySelector('select').focus();
  });

  setTimeout(() => { updatePreview(); updateTotal(); }, 0);
}());
