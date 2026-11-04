# Demo tour: ZekAI in five minutes

I wrote this page for anyone who wants to look around ZekAI without any technical background. Above all, I wanted
recruiters looking at my project to be able to try every module without installing anything.

The interface is in Turkish. Below, each screen and button is named as it appears on screen, followed by a
translation.

## What are you looking at?

There are two sites, and together they tell one story:

- **[ZekAI](https://zekai-platformm.vercel.app):** the main product. A platform that uses AI to help the buyer
  with "should I buy this?" and the seller with "why isn't my product selling?".
- **[Akıllı Market](https://akilli-markett.vercel.app):** a small marketplace that ZekAI connects to. Think of
  Trendyol or Hepsiburada: products, the cart, orders and the seller panel live here.

## How to sign in

1. Open [zekai-platformm.vercel.app/login](https://zekai-platformm.vercel.app/login).
2. Click the **Satıcı olarak gir** (sign in as a seller) or **Alıcı olarak gir** (sign in as a buyer) card. No
   sign-up, password or setup is needed.
3. Every screen shows a **Canlı demo** (live demo) badge and a **Demoyu sıfırla** (reset the demo) button in the
   bottom-right corner.

Everything you do is stored only in your own browser. You cannot break anyone else's data, and you can return to
the starting state at any time.

## Seller tour: Mehmet Kaya, Mehmet Elektronik

Mehmet's store on Akıllı Market is already connected to ZekAI, with 12 products ready.

| # | Where to go | What you will see | What is behind it |
|---|---|---|---|
| 1 | **Ürünlerim** (my products) | The 12 products in the store. Open "Premium Bluetooth Kulaklık Beyaz" (white Bluetooth headphones). | Products are read from the marketplace API with the seller's API key. |
| 2 | **Müşteri Simülasyonu** (customer simulation) | Five different customers (budget-minded Elif, quality-seeking Mert, review-reading Zeynep, quick-deciding Burak and design-focused Derya) go through the product page one by one; you see who buys and why the others walk away. | Each person looks at the part of the page they care about: price, specs, reviews, shipping or photos. |
| 3 | **İçerik Düzenle** (edit content) | Click **AI ile İçerik Üret** (generate content with AI): a new title, short and long descriptions and feature bullets. The **Stüdyo** (studio), **Kutu Açma** (unboxing) and **Kullanım** (in use) buttons generate product images. | Generated content is saved as a draft; ask again for the same product and the saved draft comes back. |
| 4 | **Birlikte Sat** (sell together) | **Kampanya Önerisi Üret** (suggest a campaign) proposes products to sell with the headphones and a discounted bundle. | The bundle discount is split between the two products in proportion to their prices. |
| 5 | **Müşteri Sesi AI** (customer voice) | **AI ile Analiz Et** (analyse with AI): a draft reply for every review and frequently asked questions drawn from the reviews. **Yayınla** (publish) adds the reply to the review. | Reviews with complaints are flagged as needing a reply. |
| 6 | **Sosyal Medya İçeriği** (social media content) | Pick a tone (professional, friendly, humorous), a goal and a platform; you get copy for Instagram, TikTok and X. | Drafts are saved; one of them can be marked as the product's active content. |
| 7 | **Kayıtlarım** (my records) | Every AI draft and output; restore, archive, publish. | Expensive AI outputs are produced once and reused. |

## Buyer tour: Burak Yılmaz

Burak has been using ZekAI for a week: he has four saved analyses, a decision room and a kombin.

| # | Where to go | What you will see | What is behind it |
|---|---|---|---|
| 1 | **Dashboard** | The search bar where you paste a product link, for example `https://akilli-markett.vercel.app/product/kulaklik-anker-soundcore-q45` | The link is the address of the product page on the marketplace. |
| 2 | **Describe your need** | Write a sentence such as "Uzun yolculuklarda müzik dinleyeceğim, pil ömrü önemli, bütçem 2.000 TL" (I'll listen to music on long trips, battery life matters, my budget is 2,000 TL). | The need is free text; there is no menu to choose from. |
| 3 | **Analysis flow** | The steps progress live: the product and need assessment, a market check if needed, the verdict. | The result arrives from the server piece by piece, as a live stream. |
| 4 | **Verdict** | Alabilirsin (go ahead), Dikkatli İlerle (proceed with care) or Alternatife Bak (look for an alternative); below it, "Neden bu sonuç?" (why this result?) and evidence quoted from reviews. | The verdict comes from a rule engine with explicit thresholds, not from the AI. |
| 5 | **Kaydedilenler** (saved) | Four saved analyses, each with a status (Düşünüyorum: thinking about it, Karşılaştırıyorum: comparing, Fiyat Bekleniyor: waiting for a better price) and a note. | |
| 6 | **Karşılaştır** (compare) | On the saved page, click **Karşılaştır** on the two headphones, then describe your need and compare. | A winner and a one-sentence reason for each product. |
| 7 | **Karar Odaları** (decision rooms) | "Ev ofisi kurulumu" (home office setup): a shopping project with a 15,000 TL budget and the analyses linked to it. | |
| 8 | **Kombinler** (kombins) | "Sabah koşusu kombini" (morning run kombin): shoes, a watch and a case judged together, with a kombin score and a purchase order. | |

## Akıllı Market tour

[akilli-markett.vercel.app/login](https://akilli-markett.vercel.app/login) also has two cards:

- **Alıcı olarak gir, Burak Yılmaz (buyer):** Open a product and add the "Günlük Teknoloji Paketi" (everyday tech
  bundle) from **Paket Fırsatları** (bundle deals) to the cart; the cart shows the discount split across the two
  products. Place the order, then close it in **Siparişlerim** (my orders) with **Teslim Aldım** (I received it).
  If you review a product you bought, a verified purchase mark appears next to your review.
- **Satıcı olarak gir, Mehmet Kaya (seller):** List products and add or edit one. The panel also shows the API key
  used to connect to ZekAI.

## Is this demo the real system?

The live demo is a version of the frontends that runs in the browser. The real system runs on two ASP.NET Core
APIs, a Python AI service and PostgreSQL. Keeping them up costs money, so I built this demo mode to let anyone try
the project at any time. The demo uses exactly the same request and response format as the real APIs, and the
screens are the same code in both modes. Details: [Deployment strategy](09-deployment-strategy.md).

How the demo differs from the real system:

- **AI answers.** In the real system Google Gemini produces the product analysis, the content and the customer
  simulation. In the demo a rule-based engine matches review sentences topic by topic instead, and every warning
  quotes the review it came from. The engine that makes the final decision follows the same rules in both modes.
- **Market check.** The real system looks up prices in Türkiye with Google Search; the demo compares the product
  with similar products in the marketplace catalogue.
- **Image generation.** The real system generates a new product shot with Gemini; the demo composes studio,
  unboxing and in-use images from the product's own photo, in the browser.
- **The two sites run separately.** In the real system, content you publish from ZekAI appears on the Akıllı
  Market product page instantly. In the demo the two sites live at different addresses with separate browser
  storage, so that link does not exist.

To run the real system on your own machine, see [Running it and the API](10-running-and-api.md).
