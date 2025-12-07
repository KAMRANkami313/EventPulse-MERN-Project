# 🎉 EventPulse — Commercial Grade Progressive Web Application (PWA)

EventPulse is a high-performance, full-stack **MERN Progressive Web Application (PWA)** designed for real-world commercial deployment.
It includes enterprise-grade analytics, security, monetization, event ticketing, real-time experiences, modern UI/UX animations, and a powerful new **Visual Admin Dashboard**.

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

* **Scroll Management**
  Global Scroll-to-Top for smooth navigation.

* **Dockerized Deployment**
  Docker setup for both frontend and backend.

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

* One-way follow system (like Instagram/Twitter)
* **Followers** — people who want to see your events
* **Following** — people whose events you want to see
* Fully scalable, replaces old “friends array”

## 🔗 Social Identity Profiles

Users can link:

* Instagram
* Twitter/X
* LinkedIn
* Personal website

Displayed with clean **Lucide Icons**.

## 🧑‍🤝‍🧑 Followers/Following Modal

* Clicking “Followers” or “Following” opens a dedicated modal
* Built using **Framer Motion** + Glassmorphism UI

## 🔖 Bookmarks (Saved Events)

* Users can save events privately without liking or joining
* Saved events appear in a dedicated “Bookmarks” page

## 🛡️ Privacy Controls

* Hide profile from search
* Restrict event visibility
* Control who can follow
* Control who can message
* Toggle social link visibility

All located inside a full **Settings Page**.

## 🏆 Gamification System (Badges)

Automatic badge awards:

* **👑 Top Host**
* **🔥 Early Adopter**
* **🚀 Rising Creator**
* **💬 Community Engaged**

Displayed on profiles and events.

## 💬 Additional Social Features

* Event ratings & reviews
* Activity-based smart recommendations
* Live chat (Socket.io)
* Real-time notifications
* Personalized feed based on creators you follow

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

# ✨ Complete UI/UX Overhaul — Modern SaaS Design

EventPulse adopts a premium app aesthetic inspired by Linear, Stripe, and Instagram.

### New UI Technologies

* **Framer Motion** — micro-interactions
* **Glassmorphism** UI
* **Vibrant gradients**
* **Lucide Icons**
* **Floating cards + animated modals**
* Tailwind for styling

### Pages Upgraded

* Home Feed
* Event Details
* Create / Edit Event
* Profile Page
* Followers/Following Modal
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
* Transaction History Table

---

# 🏢 Industrial-Grade Admin Dashboard

## 📊 Visual Analytics (Recharts)

* User growth line chart
* Monthly revenue line/bar chart
* Category distribution pie chart
* Event growth stats
* User activity metrics

## 🗂️ Event Management Table

* Search events
* Sort by date, price, category, or popularity
* Delete or unlist events
* View attendee & revenue statistics

## 📣 Global Broadcast System

Admins can send platform-wide messages:

* Notices
* Promotions
* Alerts
* Announcements

Displayed via the real-time notification system.

## 🧾 Moderation Queue

Contains all user-reported events with:

* Report reason
* Reporter details
* Quick actions

  * Delete Event
  * Warn Creator
  * Dismiss Report

## 📝 Audit Logs

Tracks:

* User bans
* Event deletions
* Revenue adjustments
* Admin actions
* Broadcast messages

## 💳 Transaction History

Showing:

* Buyer name
* Event title
* Amount
* Stripe Transaction ID
* Timestamp

## 🔔 Modern Toast Notifications

A complete toast system for:

* Success
* Error
* Warning
* Info

---

# 🛠️ Tech Stack

| Domain             | Technologies                                                      | Details                       |
| ------------------ | ----------------------------------------------------------------- | ----------------------------- |
| **Frontend**       | React (Vite), Tailwind, Framer Motion, Lucide, Recharts, Vite-PWA | Modern SaaS UI + animations   |
| **Backend**        | Node.js, Express.js, Socket.io, Nodemailer                        | API + real-time communication |
| **Database**       | MongoDB Atlas, Mongoose                                           | Scalable NoSQL                |
| **Infrastructure** | Docker, Cloudinary CDN                                            | Deployment-ready              |
| **Payments**       | Stripe SDK, Stripe Webhooks                                       | Secure billing                |
| **Maps**           | Leaflet                                                           | Interactive event locations   |

---

# 🚀 How to Run Locally

## 1️⃣ Clone Repository

```bash
git clone https://github.com/KAMRANkami313/EventPulse-MERN-Project.git
cd EventPulse-MERN-Project
```

---

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

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

Start server:

```bash
npm start
```

---

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

In MongoDB → Users Collection → Change:

```json
"role": "user"
```

to:

```json
"role": "admin"
```

Refresh → Admin Dashboard appears.

---

# 📄 License

Developed by **KAMRANkami313**.

---

