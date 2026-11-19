# AFTR — Event Discovery & Ticketing for Nairobi

Figuring out what to do on a Friday night in Nairobi shouldn't feel like a part-time job. Right now, finding out where the vibe is means digging through scattered WhatsApp statuses, endless Instagram flyers, and half a dozen disconnected ticketing links—only to realize the event is across town or sold out.

**AFTR** brings nightlife, daytime sets, and local workshops into one place. It’s a fast, mobile-first web app built to take you from *"what's happening tonight?"* to a QR code in your wallet in under a minute.

**Design & Wireframes:**

 [View the Figma Design](https://www.figma.com/design/7PyxrcXITLG6mFkHLJsXun/Untitled?node-id=0-1&t=x3lrVHIz44tagu7q-1)

---

## Why We Built This

Most event platforms feel like spreadsheets with banner images. They overwhelm you with walls of text, give you zero sense of where venues actually sit relative to where you are, and force you off-platform the second you decide to commit.

We wanted AFTR to feel effortless:
- **Less scrolling, faster decisions:** Swipe through curated cards instead of reading endless event lists.
- **Know where you're going:** Filter events by neighborhood (Westlands, Kilimani, Karen, Lavington) and distance radius so you know what's actually close.
- **Everything stays put:** Save events to your personal shortlist and lock in tickets without losing your progress when you refresh the page.

---

## Core Features

### 1. Discover (The Swipe Deck)
A card-based discovery feed tailored to Nairobi's nightlife and culture. Each card shows the venue, neighborhood, entry fee (in KSh or Free RSVP), and start time. Hit **I'm In** to stash the night for later, **Pass** to keep moving, or tap **Surprise Me** when you're indecisive and want a random pick matched to your budget and vibe.

### 2. Explore Map
An interactive neighborhood view that plots events visually. Users can filter by category, price, and distance radius, or jump straight from a card on the Discover feed directly to its pin on the map.

### 3. Saved Nights
Your personal weekend shortlist. Compare the events you liked, check start times in East Africa Time (EAT), remove plans that no longer fit, or head straight into checkout.

### 4. Simulated Checkout & Digital Wallet (`My Tickets`)
A clean booking flow that collects attendee details and generates an instant digital pass. Inside **My Tickets**, users can:
- View upcoming vs. past events with live EAT time tracking.
- Pull up a full-screen entry pass complete with a unique booking reference (`AFTR-XXXX-XXXX`) and a scannable QR code.
- Download a plain-text receipt or export an `.ics` file directly to their phone's calendar.

---

## How It Works Under the Hood

AFTR is built with **React**, **Vite**, **React Router**, and **Tailwind CSS**, using a hybrid data setup to keep the UI snappy while still simulating real API communication:

- **Event Catalog (`GET`):** On load, the app fetches the master event list asynchronously from a **Postman Mock Server** (with a local `db.json` fallback so the app never breaks offline).
- **Client-Side Persistence (`localStorage` + Elevated State):** Mock servers don't persist `POST` requests across sessions—if you rely on them alone, refreshing the page wipes out newly purchased tickets and saved events. To solve this, `App.jsx` manages global user state and syncs every saved night and booked ticket directly to `localStorage`. When `MyTicketsPage` loads, it merges server responses with local browser storage without overwriting user data.

---

## Project Structure

```text
aftr/
├── server/
│   └── db.json                 # Fallback event catalog data
├── src/
│   ├── api.js                  # Postman Mock Server endpoint config
│   ├── App.jsx                 # Global state & routing setup
│   ├── components/
│   │   └── Sidebar.jsx         # Persistent navigation shell
│   └── pages/
│       ├── DiscoverPage.jsx    # Swipe deck & "Surprise Me" matcher
│       ├── ExploreMap.jsx      # Zone & radius-based map filtering
│       ├── SavedNightsPage.jsx # Shortlisted events itinerary
│       ├── CheckoutPage.jsx    # Simulated booking & ticket creation
│       └── MyTicketsPage.jsx   # Digital wallet, QR codes & .ics export
└── package.json