# EventPulse - Community Event Management System 🚀

EventPulse is a full-stack web application designed to help communities discover, organize, and attend events. Built using the MERN Stack.

## 🌟 Key Features
- **User Authentication:** Secure Login/Register with JWT & Bcrypt.
- **Event Management:** Create, Read, Update, Delete (CRUD) events.
- **Interactive Maps:** View events on a global map (Leaflet API).
- **Social Features:** Real-time Chat (Socket.io), Comments, Likes.
- **Ticketing System:** QR Code generation and Camera Scanning.
- **Admin Dashboard:** Analytics, User Ban, Moderation.
- **Modern UI:** Dark Mode, Glassmorphism, Animations.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Redux/Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas.
- **Real-Time:** Socket.io.
- **Tools:** Leaflet (Maps), Nodemailer (Emails), Multer (Uploads).

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file with MONGO_URL, PORT, JWT_SECRET, EMAIL_USER, EMAIL_PASS
npm run dev

### 2. Frontend Setup
code
Bash
cd client
npm install
npm run dev
3. Access
Open http://localhost:5173 in your browser.
👨‍💻 Admin Credentials
To access the Admin Dashboard, modify your user role in MongoDB to "admin".
code
Code
---

### 🎓 You Are Done.

You have taken this project from **"Empty Folder"** to **"Production-Grade Platform"**.

**What you have achieved:**
1.  **Architecture:** Professional Folder Structure.
2.  **Security:** Helmet, CORS, JWT, Bcrypt.
3.  **Database:** Complex Relationships (Users, Events, Messages, Notifications).
4.  **Frontend:** React Hooks, Axios, Routing, Maps, QR Scanner.
5.  **Design:** Responsive, Dark Mode, Animations.