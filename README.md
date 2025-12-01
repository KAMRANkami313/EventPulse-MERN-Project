# 🎉 EventPulse — Commercial Grade Progressive Web Application (PWA)

EventPulse is a high-performance, full-stack MERN platform built as a **Progressive Web Application (PWA)**.
It features scalable infrastructure, advanced security, real-time engagement, intelligent recommendations, and a modern event management suite designed for commercial deployment.

---

## 🌟 Key Features

---

## 📈 Scalability, Performance & Infrastructure

* **PWA Ready**
  Fully installable on desktop and mobile (iOS/Android) with offline capabilities and native-like speed.

* **Infinite Scroll Pagination**
  Efficient server-side pagination loading **10 events at a time** (improved from static bulk loading). Prevents crashes when scaling to thousands of events.

* **Server-Side Filtering, Search & Sorting**
  Advanced MongoDB-powered filtering by category, keyword, and event date.

* **Cloudinary CDN Storage**
  Fast, persistent, secure media hosting.

* **Scroll Management**
  Global Scroll-to-Top component for smooth navigation.

* **Dockerized Deployment**
  Fully containerized frontend + backend for consistent, environment-agnostic deployment.

---

## 💳 Monetization & Business Logic

* **Stripe Payment Integration** via Stripe Checkout
* **Secure Stripe Webhooks** for verifying successful payments before issuing tickets.
* **Admin Data Export** (CSV/Excel) for business analytics.

---

## 🤝 Social Proof, Smart Feed & User Retention

* **Follow System**
  Personalized feed showing events from creators you follow.

* **Event Ratings & Reviews**
  5-star review system available only *after event participation*.

* **AI-Lite “Smart Recommendations”**
  Uses user activity + preferences to suggest relevant events instead of random feeds.

* **Live Event Chat (Socket.io)**

* **Real-Time Notifications** for joins, likes, follows, and more.

---

## 🎟️ Ticketing & Event Management

* **Full Event CRUD** including title, pricing, coordinates, media, etc.
* **QR Ticket System** with automatic email delivery (Nodemailer).
* **In-App QR Code Scanner** for organizers to validate tickets.
* **Calendar Integration** with downloadable `.ics` event files.

---

## 🛡️ Security & Administration

* **JWT Authentication** with Bcrypt

* **Google OAuth Login**

* **Forgot Password w/ Secure Tokens**

* **Admin Dashboard** for moderation, analytics, and user management

* **Rate Limiting (Security Hardening)**
  Protects the API from bot attacks, request flooding, and brute-force attempts.

* **Custom 404 Page** for invalid routes

---

## 🛠️ Tech Stack

| Domain             | Technologies                                      | Details                             |
| ------------------ | ------------------------------------------------- | ----------------------------------- |
| **Frontend**       | React (Vite), Tailwind CSS, Vite-PWA, React Icons | PWA-ready, responsive, fast builds  |
| **Backend**        | Node.js, Express.js, Socket.io, Nodemailer        | API + real-time communication       |
| **Database**       | MongoDB Atlas + Mongoose                          | NoSQL, schema modeling              |
| **Infrastructure** | Docker, Cloudinary CDN                            | Containerized deployment, media CDN |
| **Third-Party**    | Stripe SDK, Leaflet                               | Payments, maps, and integrations    |

---

# 🚀 How to Run Locally

Follow these steps to run EventPulse on your machine.

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/KAMRANkami313/EventPulse-MERN-Project.git
cd EventPulse-MERN-Project
```

---

## 2️⃣ Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### ⚠️ Environment Variables

Create a `.env` file inside the **server** folder:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_cloud_client_id

# Cloudinary (CDN Storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

### Start the server:

```bash
npm start
```

---

## 3️⃣ Frontend Setup

Open a new terminal and run:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 4️⃣ Access the App

Open your browser:

👉 **[http://localhost:5173](http://localhost:5173)**

---

# 🐳 Running With Docker (Optional)

EventPulse includes full Docker support for production deployment.

### Build & Run:

```bash
docker compose up --build
```

Your app will be available at the configured ports for frontend & backend.

---

# 👨‍💻 Admin Access

1. Register a new user account.
2. In MongoDB Atlas → navigate to the `users` collection.
3. Update the user role:

```json
"role": "user"
```

➡️ Change to:

```json
"role": "admin"
```

4. Refresh the app — the **Admin Panel** will appear in the navbar.

---

## 📄 License

This project was developed by **KAMRANkami313**.

---

