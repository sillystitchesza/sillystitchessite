/**
 * reviews.js — Silly Stitches
 * ─────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for the scrolling reviews bar on the
 * homepage. Edit this file and refresh — no build step.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  HOW TO ADD A REVIEW                                     │
 * │                                                          │
 * │  Copy one { … } block, paste it into the list below and  │
 * │  fill in the five fields. Order does not matter — the    │
 * │  newest reviews are shown first automatically.           │
 * │                                                          │
 * │    name    First name only, e.g. 'Thandi'                │
 * │    date    Always 'YYYY-MM-DD'. Displayed as             │
 * │            "18 July 2026". Anything else is printed      │
 * │            exactly as you type it.                       │
 * │    product What they ordered, e.g. 'Baguette Bag'.       │
 * │            Free text — keep it short, it becomes a pill. │
 * │    stars   0 to 5. Always draws five ⭐ — the earned     │
 * │            ones in colour, the rest greyed out. Leave    │
 * │            the field out entirely and that card shows    │
 * │            no stars at all (unrated, not zero-rated).    │
 * │    text    The review itself. Keep it under ~40 words    │
 * │            so the cards stay a tidy height.              │
 * │                                                          │
 * │  The bar only scrolls when there are more reviews than   │
 * │  fit across the screen. A short list simply sits still,  │
 * │  centred. Once it overflows it scrolls at a constant     │
 * │  speed and loops forever, so the list can be 5 reviews   │
 * │  long or 200 — it just works. Hovering pauses it.        │
 * │                                                          │
 * │  Mind the punctuation: each field ends with a comma,     │
 * │  and an apostrophe inside text must be escaped as \'     │
 * │  (or use "double quotes" around the whole string).       │
 * └──────────────────────────────────────────────────────────┘
 * ─────────────────────────────────────────────────────────────
 */

/* Set this to false once the list below holds only real reviews.
   While it is true, a reminder is logged to the browser console. */
window.SILLY_STITCHES_REVIEWS_ARE_PLACEHOLDERS = true;

window.SILLY_STITCHES_REVIEWS = [

  {
    name:    'Nadine',
    date:    '2026-07-18',
    product: 'Make-up Bag',
    stars:   5,
    text:    'Even prettier in person. The stitching is so neat and it fits all of my makeup!',
  },


  // Add new reviews here, e.g.
  //
  //   {
  //     name:    'Sarah',
  //     date:    '2026-08-30',
  //     product: 'Make-up Bag',
  //     stars:   5,
  //     text:    'Absolutely love it!',
  //   },

];
