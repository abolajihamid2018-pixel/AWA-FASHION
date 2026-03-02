[README.md](https://github.com/user-attachments/files/25682625/README.md)
# AWA Fashion — Africa Grace. Global Style.

A fully featured fashion e-commerce website built with HTML, CSS & JavaScript.

## Features
- 🛍️ Product shop with category filters
- 👗 Size selector with size guide
- 🛒 Shopping cart sidebar
- 💬 WhatsApp order integration
- 💳 Paystack payment integration (Cards, Bank Transfer, USSD)
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

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Click **Deploy** — no build settings needed!

Your site will be live at `https://your-project.vercel.app`
