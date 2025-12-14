# 🎉 EventPulse — Commercial Grade Progressive Web Application (PWA)

> 🚀 **Live Application**: You can visit and test the fully deployed app here:
> **[https://eventpulse-tawny.vercel.app/login](https://eventpulse-tawny.vercel.app/login)**

EventPulse is a high-performance, full-stack **MERN Progressive Web Application (PWA)** designed for real-world commercial deployment.
It includes enterprise-grade analytics, security, monetization, event ticketing, real-time experiences, modern UI/UX animations, and a powerful **Visual Admin Dashboard**.

---

# 🌟 Key Features

---

# 📈 Scalability, Performance & Infrastructure

* **PWA Ready**
  Fully installable on desktop & mobile (iOS/Android) with offline caching and native-like speed.

* **Infinite Scroll Pagination**
  Server-side pagination loading **10 events per batch** for performance at scale.

* **Advanced Server-Side Search, Filtering & Sorting**
  Category, keyword, price, and date range filtering powered by MongoDB aggregation.

* **Cloudinary CDN Storage**
  Optimized image uploads and fast global delivery.

* **Scroll Management**
  Global Scroll-to-Top for smooth navigation.

* **Dockerized Deployment**
  Docker setup for both frontend and backend.

* **Production Deployment (Vercel + Render)**
  Frontend deployed on **Vercel** and backend on **Render** with environment-based configuration, dynamic CORS handling, and auto CI/CD via GitHub.

---

# 🆕 NEW FEATURE — Rule-Based AI Chatbot (Local, Free, No API)

EventPulse includes a **Rule-Based AI Chatbot** that runs **100% locally** on the server — no API keys, no cloud costs.

### 🔍 How It Works

* Scans user messages for **keywords** (e.g., *"how to create"*, *"ticket"*, *"payment"*).
* Matches them to a **predefined Knowledge Base**.
* Responds instantly with AI-like smart answers.
* Fully customizable behavior and knowledge rules.

### ⚡ Benefits

* Zero cost
* No external dependencies
* Fast local responses
* Automates support, FAQs, and onboarding

---

# 💳 Monetization & Business Logic

* **Stripe Payment Integration**
* **Stripe Webhooks (Verified Transactions Only)**
* **Revenue Analytics**
* **Admin Export Tools**
  Export Users / Events / Revenue to CSV or Excel.

---

# 🤝 Social Features, Engagement & Personalization

## 🌐 Advanced Social Graph (Followers & Following)

* One-way follow system (Instagram/Twitter style)
* **Followers** — users who want to see your events
* **Following** — creators whose events you follow
* Fully scalable social graph

## 🔗 Social Identity Profiles

Users can link:

* Instagram
* Twitter/X
* LinkedIn
* Personal website

Displayed with clean **Lucide Icons**.

## 🧑‍🤝‍🧑 Followers / Following Modal

* Dedicated animated modal
* Built with **Framer Motion** + Glassmorphism UI

## 🔖 Bookmarks (Saved Events)

* Save events privately
* Dedicated Bookmarks page

## 🛡️ Privacy Controls

* Hide profile from search
* Restrict event visibility
* Control followers & messages
* Toggle social link visibility

All managed from a full **Settings Page**.

## 🏆 Gamification System (Badges)

Automatic badge awards:

* 👑 Top Host
* 🔥 Early Adopter
* 🚀 Rising Creator
* 💬 Community Engaged

Displayed on profiles and events.

## 💬 Additional Social Features

* Event ratings & reviews
* Smart recommendations
* Live chat (Socket.io)
* Real-time notifications
* Personalized creator feed

---

# 🎟️ Ticketing, Attendance & Event Tools

* Full Event CRUD
* QR Ticket System
* Email Ticket Delivery
* PDF Ticket Generation
* In-App QR Code Scanner
* Calendar Sync (.ics)

### 📤 Organizer Tools — Guest List Export

Event creators can download attendee lists as CSV:

* Name
* Email
* Ticket status
* Check-in status

---

# 📱 Mobile-First & Responsive Experience (Newly Enhanced)

EventPulse has been carefully optimized for **mobile and tablet devices**, transforming it from a demo app into a **production-ready product**.

### Mobile Enhancements

* Responsive **Login & Register** pages (Google OAuth button overflow fixed)
* Mobile-friendly **Hamburger Navigation Menu**
* Collapsible **Filters Panel** on small screens
* Full-screen **AI Chatbot bottom sheet** on mobile (no dragging issues)
* Slide-in **Admin Sidebar** with overlay for mobile
* Native mobile-friendly language selector

These changes ensure excellent usability across phones, tablets, and desktops.

---

# ✨ Complete UI/UX Overhaul — Modern SaaS Design

Inspired by Linear, Stripe, and Instagram.

### UI Technologies

* **Framer Motion** — animations & micro-interactions
* **Glassmorphism UI**
* **Vibrant gradients**
* **Lucide Icons**
* **Floating cards & animated modals**
* **Tailwind CSS**

### Pages Upgraded

* Home Feed
* Event Details
* Create / Edit Event
* Profile Page
* Followers / Following Modal
* Bookmarks Page
* Notifications
* Settings Page
* Admin Dashboard
* Login / Signup

---

# 🛡️ Security, Admin Tools & Moderation

* JWT Authentication
* Google OAuth
* Forgot Password Flow
* API Rate Limiting
* Custom 404 Page
* Admin Moderation Tools
* Report System
* Full Audit Logs
* Transaction History

---

# 🏢 Industrial-Grade Admin Dashboard

## 📊 Visual Analytics (Recharts)

* User growth charts
* Monthly revenue charts
* Category distribution pie chart
* Event & user activity metrics

## 🗂️ Event Management

* Search & filter events
* Sort by date, price, category, popularity
* Delete or unlist events
* View revenue & attendee stats

## 📣 Global Broadcast System

Admins can send platform-wide messages:

* Notices
* Promotions
* Alerts
* Announcements

Delivered via real-time notifications.

## 🧾 Moderation Queue

* Report reason
* Reporter details
* Quick actions (delete, warn, dismiss)

## 📝 Audit Logs

Tracks:

* User bans
* Event deletions
* Revenue changes
* Admin actions

## 💳 Transaction History

* Buyer name
* Event title
* Amount
* Stripe transaction ID
* Timestamp

---

# 🛠️ Tech Stack

| Domain         | Technologies                                                      | Details          |
| -------------- | ----------------------------------------------------------------- | ---------------- |
| Frontend       | React (Vite), Tailwind, Framer Motion, Lucide, Recharts, Vite-PWA | Modern SaaS UI   |
| Backend        | Node.js, Express.js, Socket.io, Nodemailer                        | APIs & real-time |
| Database       | MongoDB Atlas, Mongoose                                           | Scalable NoSQL   |
| Infrastructure | Docker, Cloudinary CDN                                            | Production ready |
| Payments       | Stripe SDK, Webhooks                                              | Secure billing   |
| Maps           | Leaflet                                                           | Interactive maps |

---

# 🚀 How to Run Locally

## 1️⃣ Clone Repository

```bash
git clone https://github.com/KAMRANkami313/EventPulse-MERN-Project.git
cd EventPulse-MERN-Project
```

## 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

Start server:

```bash
npm start
```

## 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open:

👉 [http://localhost:5173](http://localhost:5173)

---

# 🐳 Docker Deployment

```bash
docker compose up --build
```

---

# 👨‍💻 Admin Access

In MongoDB → Users Collection:

```json
"role": "user"
```

Change to:

```json
"role": "admin"
```

Refresh → Admin Dashboard appears.

---

# 📄 License

Developed by **KAMRANkami313**.
