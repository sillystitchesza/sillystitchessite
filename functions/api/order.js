/**
 * functions/api/order.js — Silly Stitches
 * Uses Resend (resend.com) — free up to 3 000 emails/month.
 */

const OWNER_EMAIL = 'sillystitchesza@gmail.com';
const SHOP_NAME   = 'Silly Stitches';
const FROM_EMAIL  = 'orders@sillystitches.co.za';
const LOGO_URL    = 'https://sillystitches.co.za/images/logo.jpeg';


export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return jsonResponse({ error: 'Unsupported content type.' }, 415);
    }

    const body   = await context.request.text();
    const params = new URLSearchParams(body);

    const name               = (params.get('name')                || '').trim();
    const email              = (params.get('email')               || '').trim();
    const notes              = (params.get('notes')               || '').trim();
    const delivery           = params.get('delivery') === 'yes';
    const address            = (params.get('address')             || '').trim();
    const collectionLocation = (params.get('collection_location') || 'To be confirmed').trim();

    const products   = params.getAll('product[]').map(v => v.trim()).filter(Boolean);
    const quantities = params.getAll('quantity[]').map(v => v.trim());
    const items      = products.map((product, i) => ({ product, quantity: quantities[i] || '1' }));

    // Validate
    const errors = [];
    if (!name)                          errors.push('Name is required.');
    if (!email || !isValidEmail(email)) errors.push('A valid email is required.');
    if (!items.length)                  errors.push('At least one product is required.');

    items.forEach(({ product, quantity }, i) => {
      const label = items.length > 1 ? ` (item ${i + 1})` : '';
      if (!product) errors.push(`Product${label} is required.`);
      if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 1)
        errors.push(`A valid quantity${label} is required.`);
    });

    if (errors.length) return jsonResponse({ error: errors.join(' ') }, 400);

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set.');
      return jsonResponse({ error: 'Server configuration error.' }, 500);
    }

    // Owner notification
    const ownerResult = await sendEmail({
      apiKey:  RESEND_API_KEY,
      from:    `${SHOP_NAME} Orders <${FROM_EMAIL}>`,
      to:      OWNER_EMAIL,
      replyTo: email,
      subject: `✦ New order from ${name} — ${items[0].product}${items.length > 1 ? ` + ${items.length - 1} more` : ''}`,
      text:    buildOwnerText({ name, email, items, notes, delivery, address, collectionLocation }),
      html:    buildOwnerHtml({ name, email, items, notes, delivery, address, collectionLocation }),
    });

    if (!ownerResult.ok) {
      console.error('Resend owner email failed:', ownerResult.error);
      return jsonResponse({ error: 'Failed to send order — please email us directly.' }, 502);
    }

    // Customer confirmation
    const customerResult = await sendEmail({
      apiKey:  RESEND_API_KEY,
      from:    `Emma @ ${SHOP_NAME} <${FROM_EMAIL}>`,
      to:      email,
      subject: `Your Silly Stitches order has been received! 🧵`,
      text:    buildCustomerText({ name, items, delivery, address, collectionLocation }),
      html:    buildCustomerHtml({ name, items, delivery, address, collectionLocation }),
    });

    if (!customerResult.ok) {
      console.warn('Resend customer email failed (non-fatal):', customerResult.error);
    }

    return jsonResponse({ success: true }, 200);

  } catch (err) {
    console.error('Unexpected error in /api/order:', err);
    return jsonResponse({ error: 'An unexpected error occurred.' }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}


/* ── RESEND ─────────────────────────────────────────────────── */

async function sendEmail({ apiKey, from, to, replyTo, subject, text, html }) {
  const payload = { from, to, subject, text, html };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => String(res.status));
    return { ok: false, error: err };
  }
  return { ok: true };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }


/* ── OWNER EMAIL ────────────────────────────────────────────── */

function buildOwnerText({ name, email, items, notes, delivery, address, collectionLocation }) {
  const lines = items.map((it, i) => `  ${i + 1}. ${it.product}  x${it.quantity}`).join('\n');
  const fulfillment = delivery
    ? `Delivery  : Yes\nAddress   : ${address || 'Not provided'}`
    : `Delivery  : No - collecting\nLocation  : ${collectionLocation}`;
  return [
    'New order - Silly Stitches',
    '================================',
    `Customer : ${name}`,
    `Email    : ${email}`,
    '',
    'Items:',
    lines,
    '',
    fulfillment,
    '',
    `Notes    : ${notes || 'None'}`,
    '================================',
    'Hit Reply to respond directly to the customer.',
  ].join('\n');
}

function buildOwnerHtml({ name, email, items, notes, delivery, address, collectionLocation }) {
  const itemRows = items.map((it, i) =>
    row(`Item ${i + 1}`, `<strong>${it.product}</strong> &nbsp;x&nbsp; ${it.quantity}`)
  ).join('');

  const fulfillmentValue = delivery
    ? `Delivery<br><span style="font-size:0.85rem;color:#5a4a42;font-style:normal;">${address || '<em>Address not provided</em>'}</span>`
    : `Collection in <strong>${collectionLocation}</strong><br><span style="font-size:0.82rem;color:#a08070;">Details to be confirmed over email</span>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf8f2;font-family:Arial,sans-serif;color:#3a2e28;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8d9c5;overflow:hidden;max-width:100%;">
    <tr><td style="background:#c4706a;padding:28px 40px;text-align:center;">
      <p style="margin:0;font-size:1.8rem;">🧵</p>
      <h1 style="margin:8px 0 0;font-size:1.3rem;color:#fff;font-weight:600;">New Order — Silly Stitches</h1>
    </td></tr>
    <tr><td style="padding:36px 40px;">
      <p style="margin:0 0 24px;font-size:0.95rem;color:#7a5c4e;">A new order has arrived via your website.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border-radius:10px;border:1px solid #e8d9c5;overflow:hidden;">
        ${row('Customer', name)}
        ${row('Email', `<a href="mailto:${email}" style="color:#c4706a;font-weight:700;">${email}</a>`)}
        ${itemRows}
        ${row('Fulfilment', fulfillmentValue)}
        ${row('Notes', notes || '<em style="color:#a08070;">None</em>')}
      </table>
      <div style="text-align:center;margin-top:32px;">
        <a href="mailto:${email}?subject=Re: Your Silly Stitches Order"
           style="display:inline-block;background:#c4706a;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.9rem;">
          Reply to customer →
        </a>
      </div>
    </td></tr>
    <tr><td style="padding:20px 40px;border-top:1px solid #e8d9c5;text-align:center;font-size:0.78rem;color:#a08070;">
      Silly Stitches · Handmade with love
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}


/* ── CUSTOMER EMAIL ─────────────────────────────────────────── */

function buildCustomerText({ name, items, delivery, address, collectionLocation }) {
  const lines = items.map((it, i) => `  ${i + 1}. ${it.product}  x${it.quantity}`).join('\n');
  const fulfillment = delivery
    ? `Your order will be shipped to:\n  ${address || 'Address to be confirmed'}`
    : `You've chosen to collect from ${collectionLocation}, Cape Town. I'll confirm the exact time and details over email.`;
  return [
    `Hi ${name}!`,
    '',
    `Thank you so much for your order — I'm so excited to make something for you!`,
    '',
    `Here's what I've received:`,
    lines,
    '',
    fulfillment,
    '',
    `I'll be in touch within 1-2 business days with a payment link.`,
    `Once payment reflects, I'll begin your order right away!`,
    '',
    `Feel free to reply to this email or DM me on Instagram @sillystitches.za with any questions.`,
    '',
    `— Emma x`,
    `Silly Stitches`,
    `sillystitchesza@gmail.com`,
  ].join('\n');
}

function buildCustomerHtml({ name, items, delivery, address, collectionLocation }) {
  const itemRows = items.map((it, i) =>
    row(`Item ${i + 1}`, `<strong>${it.product}</strong> &nbsp;x&nbsp; ${it.quantity}`)
  ).join('');

  const fulfillmentRow = delivery
    ? row('Shipping to', `${address || '<em>Address to be confirmed</em>'}`)
    : row('Collection', `<strong>${collectionLocation}</strong>, Cape Town<br><span style="font-size:0.82rem;color:#a08070;font-style:italic;">Exact time confirmed over email</span>`);

  const fulfillmentNote = delivery
    ? `Your order will be shipped via <strong>Aramex</strong> once payment reflects (3–5 business days). Shipping cost will be confirmed when I reply.`
    : `You've chosen to collect from <strong>${collectionLocation}</strong>. I'll confirm a time that works for you over email.`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf8f2;font-family:Arial,sans-serif;color:#3a2e28;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8d9c5;overflow:hidden;max-width:100%;">

    <!-- Header with logo -->
    <tr><td style="background:#c4706a;padding:32px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="Silly Stitches"
           style="width:80px;height:80px;object-fit:cover;display:block;margin:0 auto;" />
      <h1 style="margin:14px 0 0;font-size:1.4rem;color:#fff;font-weight:600;">Order Received!</h1>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:36px 40px;">
      <p style="margin:0 0 16px;font-size:1rem;color:#3a2e28;">Hi <strong>${name}</strong>!</p>
      <p style="margin:0 0 24px;font-size:0.95rem;color:#5a4a42;line-height:1.6;">
        Thank you so much for your order — I'm absolutely delighted!<br>
        Here's a summary of what I've received:
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border-radius:10px;border:1px solid #e8d9c5;overflow:hidden;margin-bottom:28px;">
        ${itemRows}
        ${fulfillmentRow}
      </table>

      <div style="background:#fff5f0;border-radius:12px;border:1px solid #f0d9d5;padding:24px 28px;margin-bottom:28px;">
        <h2 style="margin:0 0 14px;font-size:1rem;color:#c4706a;font-weight:700;">What happens next?</h2>
        <ol style="margin:0;padding-left:20px;color:#5a4a42;font-size:0.9rem;line-height:1.8;">
          <li>I'll email you within <strong>1–2 business days</strong> with a payment link.</li>
          <li>Once payment reflects, I'll begin making your order straight away!</li>
          <li>I'll send you a photo before dispatch so you can approve the finished piece.</li>
          <li>${fulfillmentNote}</li>
        </ol>
      </div>

      <p style="font-size:0.9rem;color:#7a5c4e;line-height:1.6;margin:0 0 24px;">
        Questions? Reply to this email or DM me on
        <a href="https://www.instagram.com/sillystitches.za" style="color:#c4706a;font-weight:700;">@sillystitches.za</a>.
      </p>
      <p style="font-size:0.95rem;color:#3a2e28;margin:0;">
        — Emma x<br>
        <span style="color:#a08070;font-size:0.85rem;">Silly Stitches · Handmade with love</span>
      </p>
    </td></tr>

    <tr><td style="padding:20px 40px;border-top:1px solid #e8d9c5;text-align:center;font-size:0.78rem;color:#a08070;">
      <a href="https://www.instagram.com/sillystitches.za" style="color:#c4706a;text-decoration:none;">Instagram</a>
      &nbsp;·&nbsp;
      <a href="mailto:sillystitchesza@gmail.com" style="color:#c4706a;text-decoration:none;">sillystitchesza@gmail.com</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}


/* ── SHARED ROW HELPER ──────────────────────────────────────── */

function row(label, value) {
  return `<tr>
    <td style="padding:13px 20px;font-size:0.8rem;font-weight:700;color:#a08070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e8d9c5;width:35%;vertical-align:top;">${label}</td>
    <td style="padding:13px 20px;font-size:0.9rem;color:#3a2e28;border-bottom:1px solid #e8d9c5;vertical-align:top;">${value}</td>
  </tr>`;
}
