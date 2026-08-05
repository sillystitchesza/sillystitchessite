/**
 * products.js — Silly Stitches
 * ─────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all gallery images on the site.
 *
 * Everything that needs multiple images per product reads from
 * here:  the hero carousel, the product-card hover slideshows,
 * the lightbox viewer, and the order-page preview.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  HOW TO ADD / CHANGE IMAGES                              │
 * │                                                          │
 * │  1.  Drop image files into the /images folder.           │
 * │  2.  For the HOMEPAGE HERO: add a path to hero.images.   │
 * │  3.  For a PRODUCT: add or edit its array under          │
 * │      `products`. The KEY of the array MUST EXACTLY       │
 * │      match the data-product="…" attribute on its card    │
 * │      in index.html / shop.html, AND the <option value="" │
 * │      in order.html.                                      │
 * │  4.  The FIRST image in each array is the "main" image   │
 * │      (shown by default before hovering).                 │
 * └──────────────────────────────────────────────────────────┘
 *
 * No build step needed — just save and refresh.
 * ─────────────────────────────────────────────────────────────
 */

window.SILLY_STITCHES_PRODUCTS = {

  /* ────────────────────────────────────────────────
     HERO CAROUSEL — rotates on the homepage
     ──────────────────────────────────────────────── */
  hero: {
    // Add as many images as you like. They rotate automatically.
    images: [
      'images/Red Bird Tote Shoulder Tree.JPG',
      'images/Hands 3.JPG',
      // 'images/Hands 1.JPG',     // <- uncomment / add your own
      // 'images/Hands 2.JPG',
    ],
    intervalMs: 4500,        // how long each image stays visible (ms)
    animation:  'fade',      // 'flip' (card-flip) or 'fade' (crossfade)
  },


  /* ────────────────────────────────────────────────
     PRODUCTS — galleries for every product card
     ──────────────────────────────────────────────── */
  products: {

    'Large Baby Blue Floral Make-up Bag': [
      'images/Bee Bag 1.JPG',
      'images/Bee Bag 2.JPG',
      'images/Bee Bag 3.JPG',
    ],

    'Large Pink Floral Make-up Bag': [
      'images/Pink Large Front Down.JPG',
      'images/Pink Large Oblique Open.JPG',
      'images/Pink Large Top Down.JPG',
    ],

    'Large White Floral Make-up Bag': [
      'images/Green&White Open Oblique.JPG',
      'images/Green&White Front.JPG',
      'images/Green&White Open Side.JPG',
    ],

    'Large Dark Blue Floral Make-up Bag': [
      'images/Dark Blue Oblique.JPG',
      'images/Dark Blue Oblique 2.JPG',
    ],

    'Large Dark Green Floral Make-up Bag': [
      'images/Dark Green Oblique.JPG',
      'images/Dark Green Open Top.JPG',
    ],

    'Red Bird Quilted Tote Bag': [
      'images/Red Bird Tote Shoulder.JPG',
      'images/Red Bird Tote Front.JPG',
    ],

    'Large White and Blue Floral Make-up Bag': [
      'images/White & Blue Floral Front.JPG',
      'images/White & Blue Floral Side.JPG',
      'images/White & Blue Floral Top Open.JPG',
    ],

      'Cream Floral Baguette Bag': [
      'images/Cream Floral Baguette Bag.JPG',
    ],

    /* Medium make-up bags — same photos as the large versions */
    'Medium Baby Blue Floral Make-up Bag': [
      'images/Bee Bag 1.JPG',
      'images/Bee Bag 2.JPG',
      'images/Bee Bag 3.JPG',
    ],

    'Medium Pink Floral Make-up Bag': [
      'images/Pink Large Front Down.JPG',
      'images/Pink Large Oblique Open.JPG',
      'images/Pink Large Top Down.JPG',
    ],

    'Medium White Floral Make-up Bag': [
      'images/Green&White Open Oblique.JPG',
      'images/Green&White Front.JPG',
      'images/Green&White Open Side.JPG',
    ],

    'Medium Dark Blue Floral Make-up Bag': [
      'images/Dark Blue Oblique.JPG',
      'images/Dark Blue Oblique 2.JPG',
    ],

    'Medium Dark Green Floral Make-up Bag': [
      'images/Dark Green Oblique.JPG',
      'images/Dark Green Open Top.JPG',
    ],

    'Medium White and Blue Floral Make-up Bag': [
      'images/White & Blue Floral Front.JPG',
      'images/White & Blue Floral Side.JPG',
      'images/White & Blue Floral Top Open.JPG',
    ],

    'Black Floral Baguette Bag': [
      'images/Black Baguette Bag.JPG',
      'images/Black Baguette Bag 2.JPG',
      'images/Black Baguette Bag Inside.JPG',
    ],

    'Cream and Blue Floral Baguette Bag': [
      'images/Cream Baguette Bag V1.1.JPG',
      'images/Cream Baguette Bag V1.2.JPG',
      'images/Cream Baguette Bag V2.1.JPG',
      'images/Cream Baguette Bag V2.2.jpg',
      'images/Cream Baguette Bag Inside.JPG',
    ],

    // Add new products here, e.g.
    //
    //   'Lavender Pouch': [
    //     'images/lavender-1.jpg',
    //     'images/lavender-2.jpg',
    //     'images/lavender-3.jpg',
    //   ],
  },


  /* ────────────────────────────────────────────────
     PRICES — used by the order-form total calculator
     ──────────────────────────────────────────────────
     Keys MUST match product names exactly (same as
     above and in order.html's <option value="…">).

     Fixed price:   18
     "From" price:  { from: true, amount: 38 }
                    → total shows "from R38" and flags
                      the overall total as an estimate.
     Custom/POA:    null
                    → shows "price on request".

     To add a new product, add its name and price here,
     add it to `products` above, and add an <option> in
     order.html. That's the complete checklist.
     ──────────────────────────────────────────────── */
  prices: {
    'Large Baby Blue Floral Make-up Bag': 250,
    'Large Pink Floral Make-up Bag': 250,
    'Large White Floral Make-up Bag': 250,
    'Large Dark Blue Floral Make-up Bag': 250,
    'Large Dark Green Floral Make-up Bag': 250,
    'Large White and Blue Floral Make-up Bag': 250,
    'Medium Baby Blue Floral Make-up Bag': 185,
    'Medium Pink Floral Make-up Bag': 185,
    'Medium White Floral Make-up Bag': 185,
    'Medium Dark Blue Floral Make-up Bag': 185,
    'Medium Dark Green Floral Make-up Bag': 185,
    'Medium White and Blue Floral Make-up Bag': 185,
    'Red Bird Quilted Tote Bag':  350,
    'Cream Floral Baguette Bag':  300,
    'Cream and Blue Floral Baguette Bag':  300,
    'Black Floral Baguette Bag':  300,
    'Custom Order':           null,
  },

};
