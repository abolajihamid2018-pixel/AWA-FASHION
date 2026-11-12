# AWA Fashion · Africa Grace. Global Style.

The AWA Fashion website. Plain HTML, CSS and vanilla JavaScript: one `index.html` plus `assets/`, with no build step. Hosted on Vercel at https://awa-fashion.vercel.app (every push to `main` goes live).

## What is on the site

- **Hero** and **The Edit**: a scroll-linked lookbook of real pieces. Phones get a swipe gallery.
- **The Signature**: one featured piece (set `SIGNATURE` in the script).
- **Collection**: every real piece, filterable. Each piece has its own page at `#/piece/<slug>` with sizes, quantity, a size guide, Add to bag and Order on WhatsApp.
- **Bag and checkout**: the bag is saved in the visitor's browser. Checkout takes card, transfer or USSD through Paystack, or sends the order on WhatsApp.
- **Make it yours**: a custom-order request that opens WhatsApp with the details written out.
- **Track your order**: customers enter their reference and see Processing, Confirmed, In Production, Shipped or Completed, read from Firebase.
- Floating WhatsApp button (bottom-left), Instagram and TikTok @fashionwithawa.

## Settings (top of the script in `index.html`)

| Setting | What it does |
|---|---|
| `WHATSAPP_NUMBER` | Number every WhatsApp link goes to |
| `pieces` | The catalogue: each piece has `price` (naira, or `null` for "Price on request"), `gender` (men, women, accessories), `sizes`, `unavail`, `tag` and `imgs` (empty shows a "Photo coming soon" tile) |
| `SIZES` | Sizes offered on every piece |
| `SIGNATURE` | Slug of the featured piece |
| `PAYSTACK_KEY` | Paystack **public** key (`pk_test_...` or `pk_live_...`). Empty turns card payment off |
| `FIREBASE` | Firebase web config for order tracking |

Never put the Paystack secret key (`sk_...`) in this file. The public key is safe to publish.

## Paystack

1. dashboard.paystack.com, then Settings, then API Keys & Webhooks.
2. Copy the public key into `PAYSTACK_KEY`. Use the test key first and pay with Paystack's test cards.
3. When the business is verified, swap in the live key (`pk_live_...`).

After a successful payment the customer sees their reference (`AWA_` plus a number), the order is saved to Firebase with status `Processing`, and they can send a confirmation on WhatsApp.

## Firebase order tracking

**One-time step: publish the Firestore rules.** In console.firebase.google.com, open the project, then Firestore Database, then Rules, paste this and click Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if true;
      allow get: if true;
      allow list, update, delete: if false;
    }
  }
}
```

These let the site create an order and let a customer read only the one order whose exact reference they type. Nobody can list, edit or delete orders from the site.

**Updating an order:** in the Firebase Console open Firestore Database, then `orders`, then the reference, and change `status` to `Processing`, `Confirmed`, `In Production`, `Shipped` or `Completed`.

**WhatsApp orders:** add a document in `orders` yourself. Use the reference you give the customer as the document ID and add `status`, `total` (number) and `items` fields. They can then track it the same way.

To move tracking to another Firebase project (for example your brother's), replace the `FIREBASE` object with that project's web config and publish the same rules there.

## Images

The images in `assets/img/` are interim crops from Instagram. Replace them with full-size originals using the same file names. See `docs/visual-direction.md`.

## Preview locally

```
npx http-server -p 8080
```
