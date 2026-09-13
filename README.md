[README.md](https://github.com/user-attachments/files/25682625/README.md)
# AWA Fashion — Africa Grace. Global Style.

A fully featured fashion e-commerce website built with HTML, CSS & JavaScript.

## Features
- 🛍️ Product shop with category filters
- 👌 Signature Dress showcase (your flagship, most-requested piece)
- 🎨 Designs / Lookbook gallery for custom-order enquiries
- 👗 Size selector with size guide
- 🛒 Shopping cart sidebar
- 💬 WhatsApp order integration
- 💳 Paystack payment integration (Cards, Bank Transfer, USSD)
- 📦 Track Your Order — customers look up their order status by reference
- 📱 Mobile responsive
- ✨ Scroll animations

## Setup

### 1. Update WhatsApp Number
In `index.html`, find this line and replace with your number:
```js
const WHATSAPP_NUMBER = '2348000000000'; // e.g. 2348012345678
```

### 2. Update Paystack Key
Replace with your public key from [dashboard.paystack.com](https://dashboard.paystack.com):
```js
const PAYSTACK_KEY = 'pk_test_xxxxxxxx...'; // Your Paystack public key
```

### 3. Order Tracking (Firebase)
The "Track Your Order" section lets customers check their order status by reference. It's powered by [Firebase](https://console.firebase.google.com) Firestore, and `index.html` already ships wired to the `awa-fashion` Firebase project's config — if you ever need to point it at a different project, replace the `firebaseConfig` object in `index.html`:
```js
const firebaseConfig = {
  apiKey: "...", authDomain: "...", projectId: "...",
  storageBucket: "...", messagingSenderId: "...", appId: "..."
};
```
(If `firebaseConfig` is ever left with placeholder values, tracking gracefully degrades to a "not connected" message — payments and WhatsApp ordering are unaffected either way.)

**⚠️ Required one-time step — publish Firestore security rules.** Until this is done, order creation and lookup will fail. Go to your project's **Firestore Database → Rules** tab, paste the rules below, and click **Publish**. This lets the site create an order and let a customer look up *one* order by its exact reference, but never list or browse all orders, and never edit/delete from the client:
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

**How it works:** every time a customer completes a Paystack payment, an order document is automatically created in Firestore (document ID = the Paystack payment reference, e.g. `AWA_1737000000000`) with status `Processing`. Give this reference to the customer (it's already included in the WhatsApp confirmation message sent after payment) so they can track it.

**Updating order status:** as the order moves along, open the document in the Firebase Console (**Firestore Database → orders → [reference]**) and edit its `status` field to one of: `Processing`, `Confirmed`, `In Production`, `Shipped`, `Completed`. The tracker page updates instantly to reflect it.

**For WhatsApp-only orders** (no card payment), you can manually create a matching document in the Firebase Console — set the document ID to whatever reference you give the customer, and add `status`, `total`, and `items` fields — so they can track it the same way.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Click **Deploy** — no build settings needed!

Your site will be live at `https://your-project.vercel.app`
