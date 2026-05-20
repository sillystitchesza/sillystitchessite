/**
 * functions/api/order.js — Silly Stitches
 * Email via Resend (resend.com) — free up to 3 000/month.
 */

const OWNER_EMAIL = 'sillystitchesza@gmail.com';
const SHOP_NAME   = 'Silly Stitches';
const FROM_EMAIL  = 'orders@sillystitches.co.za';
const LOGO_URL    = 'https://sillystitches.co.za/images/logo.jpeg';


export async function onRequestPost(context) {
  try {
    const ct = context.request.headers.get('Content-Type') || '';
    if (!ct.includes('application/x-www-form-urlencoded'))
      return json({ error: 'Unsupported content type.' }, 415);

    const params = new URLSearchParams(await context.request.text());

    const name     = (params.get('name')    || '').trim();
    const email    = (params.get('email')   || '').trim();
    const notes    = (params.get('notes')   || '').trim();
    const delivery = params.get('delivery') === 'yes';
    const address  = (params.get('address') || '').trim();
    const collect  = (params.get('collection_location') || 'To be confirmed').trim();

    const products   = params.getAll('product[]').map(v => v.trim()).filter(Boolean);
    const quantities = params.getAll('quantity[]').map(v => v.trim());
    const items      = products.map((p, i) => ({ product: p, quantity: quantities[i] || '1' }));

    /* Validation */
    const errors = [];
    if (!name)                          errors.push('Name is required.');
    if (!email || !validEmail(email))   errors.push('A valid email is required.');
    if (!items.length)                  errors.push('At least one product is required.');
    items.forEach(({ product, quantity }, i) => {
      const l = items.length > 1 ? ' (item ' + (i+1) + ')' : '';
      if (!product)                                               errors.push('Product' + l + ' is required.');
      if (!quantity || isNaN(+quantity) || parseInt(quantity) < 1) errors.push('Quantity' + l + ' must be at least 1.');
    });
    if (errors.length) return json({ error: errors.join(' ') }, 400);

    const key = context.env.RESEND_API_KEY;
    if (!key) { console.error('RESEND_API_KEY not set'); return json({ error: 'Server config error.' }, 500); }

    /* Owner notification */
    const ownerOk = await send(key, {
      from:    SHOP_NAME + ' Orders <' + FROM_EMAIL + '>',
      to:      OWNER_EMAIL,
      replyTo: email,
      subject: '\u2756 New order from ' + name + ' \u2014 ' + items[0].product + (items.length > 1 ? ' + ' + (items.length-1) + ' more' : ''),
      text:    ownerText({ name, email, items, notes, delivery, address, collect }),
      html:    ownerHtml({ name, email, items, notes, delivery, address, collect }),
    });
    if (!ownerOk) return json({ error: 'Failed to send. Please email us directly.' }, 502);

    /* Customer confirmation */
    const custOk = await send(key, {
      from:    'Emma @ ' + SHOP_NAME + ' <' + FROM_EMAIL + '>',
      to:      email,
      subject: 'Your Silly Stitches order has been received! \uD83E\uDDF5',
      text:    custText({ name, items, delivery, address, collect }),
      html:    custHtml({ name, items, delivery, address, collect }),
    });
    if (!custOk) console.warn('Customer confirmation email failed (non-fatal).');

    return json({ success: true }, 200);

  } catch (err) {
    console.error('Unexpected error:', err);
    return json({ error: 'An unexpected error occurred.' }, 500);
  }
}

export async function onRequest(ctx) {
  return ctx.request.method === 'POST' ? onRequestPost(ctx) : json({ error: 'Method not allowed.' }, 405);
}


/* ── Helpers ─────────────────────────────────────────────── */

async function send(key, { from, to, replyTo, subject, text, html }) {
  const body = { from, to, subject, text, html };
  if (replyTo) body.reply_to = replyTo;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify(body),
  });
  if (!r.ok) console.error('Resend error:', r.status, await r.text().catch(() => ''));
  return r.ok;
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function itemLines(items) {
  return items.map((it, i) => '  ' + (i+1) + '. ' + it.product + '  x' + it.quantity).join('\n');
}

function fulfilmentText(delivery, address, collect) {
  return delivery
    ? 'Delivery  : Yes\nAddress   : ' + (address || 'Not provided')
    : 'Delivery  : No - collecting\nLocation  : ' + collect;
}


/* ── Owner email ─────────────────────────────────────────── */

function ownerText({ name, email, items, notes, delivery, address, collect }) {
  return [
    'New order - Silly Stitches',
    '================================',
    'Customer : ' + name,
    'Email    : ' + email,
    '',
    'Items:',
    itemLines(items),
    '',
    fulfilmentText(delivery, address, collect),
    '',
    'Notes    : ' + (notes || 'None'),
    '================================',
    'Hit Reply to respond directly to the customer.',
  ].join('\n');
}

function ownerHtml({ name, email, items, notes, delivery, address, collect }) {
  const itemRows = items.map((it, i) =>
    row('Item ' + (i+1), '<strong>' + it.product + '</strong> &nbsp;x&nbsp; ' + it.quantity)
  ).join('');

  const fulfilment = delivery
    ? 'Delivery<br><span style="font-size:.85rem;color:#5a4a42;">' + (address || '<em>Not provided</em>') + '</span>'
    : 'Collection — <strong>' + collect + '</strong><br><span style="font-size:.82rem;color:#a08070;">Details confirmed over email</span>';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#fdf8f2;font-family:Arial,sans-serif;color:#3a2e28;">' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">' +
  '<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8d9c5;overflow:hidden;max-width:100%;">' +
    '<tr><td style="background:#c4706a;padding:28px 40px;text-align:center;">' +
      '<p style="margin:0;font-size:1.8rem;">&#x1F9F5;</p>' +
      '<h1 style="margin:8px 0 0;font-size:1.3rem;color:#fff;font-weight:600;">New Order &mdash; Silly Stitches</h1>' +
    '</td></tr>' +
    '<tr><td style="padding:36px 40px;">' +
      '<p style="margin:0 0 24px;font-size:.95rem;color:#7a5c4e;">A new order arrived via your website.</p>' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border-radius:10px;border:1px solid #e8d9c5;overflow:hidden;">' +
        row('Customer', name) +
        row('Email', '<a href="mailto:' + email + '" style="color:#c4706a;font-weight:700;">' + email + '</a>') +
        itemRows +
        row('Fulfilment', fulfilment) +
        row('Notes', notes || '<em style="color:#a08070;">None</em>') +
      '</table>' +
      '<div style="text-align:center;margin-top:32px;">' +
        '<a href="mailto:' + email + '?subject=Re: Your Silly Stitches Order" ' +
        'style="display:inline-block;background:#c4706a;color:#fff;padding:14px 28px;' +
        'border-radius:50px;text-decoration:none;font-weight:700;font-size:.9rem;">Reply to customer &rarr;</a>' +
      '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:20px 40px;border-top:1px solid #e8d9c5;text-align:center;font-size:.78rem;color:#a08070;">Silly Stitches &middot; Handmade with love</td></tr>' +
  '</table></td></tr></table></body></html>';
}


/* ── Customer email ──────────────────────────────────────── */

function custText({ name, items, delivery, address, collect }) {
  const next = delivery
    ? 'Your order will ship to: ' + (address || 'address to be confirmed')
    : 'You chose to collect from ' + collect + ', Cape Town. I\'ll confirm the time over email.';
  return [
    'Hi ' + name + '!',
    '',
    'Thank you so much for your order - I\'m so excited to make something for you!',
    '',
    'Here\'s what I\'ve received:',
    itemLines(items),
    '',
    next,
    '',
    'I\'ll be in touch within 1-2 business days with a payment link.',
    'Once payment reflects, I\'ll begin your order right away!',
    '',
    'Feel free to reply to this email or DM me on Instagram @sillystitches.za.',
    '',
    '- Emma x',
    'Silly Stitches | sillystitchesza@gmail.com',
  ].join('\n');
}

function custHtml({ name, items, delivery, address, collect }) {
  const itemRows = items.map((it, i) =>
    row('Item ' + (i+1), '<strong>' + it.product + '</strong> &nbsp;x&nbsp; ' + it.quantity)
  ).join('');

  const fulfilRow = delivery
    ? row('Shipping to', address || '<em>To be confirmed</em>')
    : row('Collecting from', '<strong>' + collect + '</strong>, Cape Town<br><span style="font-size:.82rem;color:#a08070;font-style:italic;">Time confirmed over email</span>');

  const note = delivery
    ? 'Your order ships via <strong>Aramex</strong> once payment reflects (3&ndash;5 business days). Shipping cost confirmed when I reply.'
    : 'You\'ve chosen to collect from <strong>' + collect + '</strong>. I\'ll confirm a time that works for you over email.';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#fdf8f2;font-family:Arial,sans-serif;color:#3a2e28;">' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">' +
  '<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8d9c5;overflow:hidden;max-width:100%;">' +

    '<tr><td style="background:#c4706a;padding:32px 40px;text-align:center;">' +
      '<img src="' + LOGO_URL + '" alt="Silly Stitches" ' +
      'style="width:80px;height:80px;object-fit:cover;display:block;margin:0 auto;" />' +
      '<h1 style="margin:14px 0 0;font-size:1.4rem;color:#fff;font-weight:600;">Order Received!</h1>' +
    '</td></tr>' +

    '<tr><td style="padding:36px 40px;">' +
      '<p style="margin:0 0 16px;font-size:1rem;color:#3a2e28;">Hi <strong>' + name + '</strong>!</p>' +
      '<p style="margin:0 0 24px;font-size:.95rem;color:#5a4a42;line-height:1.6;">' +
        'Thank you so much for your order &mdash; I\'m absolutely delighted!<br>' +
        'Here\'s a summary of what I\'ve received:' +
      '</p>' +

      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border-radius:10px;border:1px solid #e8d9c5;overflow:hidden;margin-bottom:28px;">' +
        itemRows + fulfilRow +
      '</table>' +

      '<div style="background:#fff5f0;border-radius:12px;border:1px solid #f0d9d5;padding:24px 28px;margin-bottom:28px;">' +
        '<h2 style="margin:0 0 14px;font-size:1rem;color:#c4706a;font-weight:700;">What happens next?</h2>' +
        '<ol style="margin:0;padding-left:20px;color:#5a4a42;font-size:.9rem;line-height:1.8;">' +
          '<li>I\'ll email you within <strong>1&ndash;2 business days</strong> with a payment link.</li>' +
          '<li>Once payment reflects, I\'ll start making your order straight away!</li>' +
          '<li>I\'ll send a photo before dispatch so you can approve the finished piece.</li>' +
          '<li>' + note + '</li>' +
        '</ol>' +
      '</div>' +

      '<p style="font-size:.9rem;color:#7a5c4e;line-height:1.6;margin:0 0 24px;">' +
        'Questions? Reply to this email or DM me on ' +
        '<a href="https://www.instagram.com/sillystitches.za" style="color:#c4706a;font-weight:700;">@sillystitches.za</a>.' +
      '</p>' +
      '<p style="font-size:.95rem;color:#3a2e28;margin:0;">&mdash; Emma x<br>' +
        '<span style="color:#a08070;font-size:.85rem;">Silly Stitches &middot; Handmade with love</span></p>' +
    '</td></tr>' +

    '<tr><td style="padding:20px 40px;border-top:1px solid #e8d9c5;text-align:center;font-size:.78rem;color:#a08070;">' +
      '<a href="https://www.instagram.com/sillystitches.za" style="color:#c4706a;text-decoration:none;">Instagram</a>' +
      ' &middot; <a href="mailto:sillystitchesza@gmail.com" style="color:#c4706a;text-decoration:none;">sillystitchesza@gmail.com</a>' +
    '</td></tr>' +

  '</table></td></tr></table></body></html>';
}


/* ── Shared table row ────────────────────────────────────── */

function row(label, value) {
  return '<tr>' +
    '<td style="padding:13px 20px;font-size:.8rem;font-weight:700;color:#a08070;text-transform:uppercase;' +
    'letter-spacing:.06em;border-bottom:1px solid #e8d9c5;width:35%;vertical-align:top;">' + label + '</td>' +
    '<td style="padding:13px 20px;font-size:.9rem;color:#3a2e28;border-bottom:1px solid #e8d9c5;vertical-align:top;">' + value + '</td>' +
    '</tr>';
}
