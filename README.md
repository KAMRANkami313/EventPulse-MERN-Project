# 🎉 EventPulse — Commercial Grade Progressive Web Application (PWA)

EventPulse is a high-performance, full-stack MERN platform built as a **Progressive Web Application (PWA)**.
It features scalable infrastructure, secure monetization via Stripe, real-time engagement tools, and modern event management capabilities.

---

## 🌟 Key Features

---

## 📈 Scalability, Performance & Infrastructure

* **PWA Ready**
  Fully installable on desktop and mobile (iOS/Android) with offline capabilities and native-like speed.

* **Server-Side Pagination**
  Efficient `.skip()` and `.limit()` handling for loading only **5 events at a time**, ensuring smooth performance even with thousands of events.

* **Backend Filtering & Search**
  Server-side filtering, searching, and sorting (category, keyword, date) powered by MongoDB.

* **Cloudinary CDN Storage**
  Persistent, fast, secure storage for all event media.

* **Scroll Management**
  Global Scroll-to-Top component for smoother navigation and better UX.

---

## 💳 Monetization & Business Logic

* **Stripe Payment Integration** via Stripe Checkout
* **Webhooks for Ticket Verification** ensures payment success before issuing tickets.
* **Admin Data Export** (CSV/Excel) for analytics and reporting.

---

## 🤝 Social Proof & User Retention

* **Follow System** enabling a personalized “Following Feed”.
* **Event Ratings & Reviews**
  5-star rating system available only after event participation.
* **Live Event Chat** using Socket.io
* **Real-Time Notifications** for joins, likes, and more.

---

## 🎟️ Ticketing & Event Management

* **Full CRUD for Events** including price, coordinates, media, etc.
* **QR Ticket System** with automatic email delivery (Nodemailer).
* **Built-in QR Code Scanner** for organizers.
* **Calendar Integration** with downloadable `.ics` files.

---

## 🛡️ Security & Administration

* **JWT Authentication** with Bcrypt hashing
* **Google OAuth Login**
* **Forgot Password Flow** with secure email tokens
* **Admin Dashboard** for moderation and analytics
* **Custom 404 Page** for invalid routes

---

## 🛠️ Tech Stack

| Domain          | Technologies                                      | Details                                |
| --------------- | ------------------------------------------------- | -------------------------------------- |
| **Frontend**    | React (Vite), Tailwind CSS, Vite-PWA, React Icons | Fast builds, responsive UI, PWA-ready  |
| **Backend**     | Node.js, Express.js, Socket.io, Nodemailer        | API + real-time communication          |
| **Database**    | MongoDB Atlas + Mongoose                          | NoSQL, schema modeling                 |
| **Third-Party** | Stripe SDK, Cloudinary, Leaflet                   | Payments, CDN storage, map integration |

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

# 👨‍💻 Admin Access

1. Register a new user account.
2. In MongoDB Atlas ➝ `users` collection, find your user.
3. Change:

```json
"role": "user"
```

to:

```json
"role": "admin"
```

4. Refresh the app — the **Admin Panel** will now appear in the navbar.

---

## 📄 License

This project was developed by **KAMRANkami313**.

