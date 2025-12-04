# 🎉 EventPulse — Commercial Grade Progressive Web Application (PWA)

EventPulse is a high-performance, full-stack **MERN Progressive Web Application (PWA)** designed for real-world commercial deployment.
It includes enterprise-grade analytics, security, monetization, event ticketing, real-time experiences, and a powerful new **Visual Admin Dashboard**.

---

# 🌟 Key Features

---

# 📈 Scalability, Performance & Infrastructure

* **PWA Ready**
  Fully installable on desktop & mobile (iOS/Android) with offline caching + native-like speed.

* **Infinite Scroll Pagination**
  Server-side pagination loading **10 events per batch** for high-scalability performance.

* **Advanced Server-Side Search, Filtering & Sorting**
  Category, keyword, price, and date range filtering powered by MongoDB aggregation.

* **Cloudinary CDN Storage**
  Fast, persistent & secure media hosting with automatic transformations.

* **Scroll Management**
  Global Scroll-to-Top for smooth navigation.

* **Dockerized Deployment**
  Production-ready Docker setup for both frontend and backend.

---

# 💳 Monetization & Business Logic

* **Stripe Payment Integration**
  Safe ticket purchasing using Stripe Checkout.

* **Stripe Webhooks (Verified Transactions Only)**
  Ensures tickets are only issued after Stripe confirms the payment.

* **Revenue Analytics (Admin Dashboard)**
  Total platform earnings, monthly revenue charts, and transaction insights.

* **Admin Export Tools**
  Export Users / Events / Revenue to CSV or Excel.

---

# 🤝 Social Features, Feed Personalization & Engagement

* **Follow System**
  Personalized event feed based on creators you follow.

* **Event Ratings & Reviews**
  Only available to users who attended the event.

* **AI-Lite Smart Recommendations**
  Activity-based personalized event suggestions.

* **Live Event Chat (Socket.io)**
  Real-time messaging for participants.

* **Real-Time Notifications**
  Follows, likes, joins, messages, and admin broadcasts.

---

# 🎟️ Ticketing, Attendance & Event Tools

* **Full Event CRUD** (title, media, price, geolocation, categories, etc.)

* **QR Ticket System**
  Each ticket contains a unique QR code + secure validation for event organizers.

* **Email Ticket Delivery (Nodemailer)**
  Instant email confirmation with QR.

* **PDF Ticket Generation (NEW)**
  Users can download a professional PDF version of their ticket with event details + QR code.

* **In-App QR Code Scanner**
  Organizers can verify ticket authenticity from their phone.

* **Calendar Sync (.ics)**
  Add events directly to Google Calendar, Apple Calendar, etc.

---

# 🛡️ Security, Admin Tools & Moderation

* **JWT Authentication**
  With refresh tokens and secure password hashing (bcrypt).

* **Google OAuth Login**

* **Forgot Password with Secure Token Flow**

* **API Rate Limiting**
  Prevents brute-force, bot attacks, and excessive requests.

* **Custom 404 Page & Error Handling**

---

# 🏢 Industrial-Grade Admin Dashboard (NEW)

EventPulse now includes a **professional, visual, analytics-rich Admin Dashboard** designed for real companies.

---

## 📊 1. Visual Analytics (Recharts Integration)

* **User Growth Line Chart**
* **Monthly Revenue Line / Bar Chart** (based on Stripe transactions)
* **Category Distribution Pie Chart**
  Shows which event categories (Music, Tech, Art, etc.) are trending.
* **Event Growth Statistics**
* **User Activity Metrics**

---

## 🗂️ 2. Event Management Table (Admin-Controlled)

A centralized table where admins can:

* Search events instantly
* Sort by date, price, category, or popularity
* Delete or unlist events
* View event analytics (attendees, revenue, ratings)

---

## 📣 3. Global Broadcast System (Platform-Wide Notifications)

Admins can send **universal announcements** visible to all users.
Useful for:

* Maintenance notices
* Holiday promotions
* Security updates
* System-wide alerts

Delivered through the real-time notification system.

---

## 🧾 4. Moderation Queue (Report System)

Users can report events for:

* Spam
* Inappropriate content
* Fraud
* Wrong category

Admins get a dedicated **"Reports" section** containing:

* Report reason
* The user who reported
* Quick action buttons: *Delete Event*, *Warn Creator*, *Dismiss Report*

---

## 📝 5. Audit Logs (Security Compliance)

Every admin action is recorded:

* User bans
* Event deletions
* Revenue adjustments
* Broadcast messages
* Settings updates

Audit logs include:

* Admin name
* Action description
* Timestamp

This ensures transparency and accountability.

---

## 💳 6. Transaction History (Financial Records)

A full Stripe-powered purchase history table:

* Buyer name
* Event title
* Amount paid
* Stripe Transaction ID
* Timestamp

Perfect for accounting, refunds, or analytics.

---

## 🔔 7. Modern Toast Notifications (No More alert())

All user feedback uses **non-blocking toast notifications**:

* Success messages
* Errors
* Warnings
* Info alerts

Smooth, auto-dismiss, non-intrusive — professional UX.

---

# 🛠️ Tech Stack

| Domain             | Technologies                               | Details                                  |
| ------------------ | ------------------------------------------ | ---------------------------------------- |
| **Frontend**       | React (Vite), Tailwind, Recharts, Vite-PWA | PWA-ready, visual analytics, fast builds |
| **Backend**        | Node.js, Express.js, Socket.io, Nodemailer | API + real-time communication            |
| **Database**       | MongoDB Atlas, Mongoose                    | Scalable NoSQL data modeling             |
| **Infrastructure** | Docker, Cloudinary CDN                     | Deployment-ready + media CDN             |
| **Payments**       | Stripe SDK, Stripe Webhooks                | Secure billing & transaction tracking    |
| **Maps**           | Leaflet                                    | Interactive event location mapping       |

---

# 🚀 How to Run Locally

## 1️⃣ Clone the Repository

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

👉 **[http://localhost:5173](http://localhost:5173)**

---

# 🐳 Docker Deployment

```bash
docker compose up --build
```

---

# 👨‍💻 Admin Access

Register → Open MongoDB → Users Collection → Change:

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
