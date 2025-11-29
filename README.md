# EventPulse - Community Event Management System 🚀

EventPulse is a full-stack web application designed to help communities discover, organize, and attend events. Built using the MERN Stack (MongoDB, Express, React, Node.js), it features real-time capabilities, secure authentication, and a modern UI.

## 🌟 Key Features

### 🔐 Authentication & Security
*   **Secure Login/Register:** JWT-based authentication with Bcrypt password hashing.
*   **Google OAuth:** One-click sign-in using Google Accounts.
*   **Security:** Protected routes, Helmet headers, and CORS configuration.

### 📅 Event Management
*   **CRUD Operations:** Users can create, update, and delete events.
*   **Interactive Maps:** Visual location selection using Leaflet API.
*   **Rich Media:** Image uploads for event covers via Multer.

### 💬 Social & Real-Time
*   **Live Chat:** Real-time group chat for every event using Socket.io.
*   **Engagement:** Like, comment, and join events instantly.
*   **Notifications:** Real-time alerts for joins and likes.

### 🎟️ Ticketing System
*   **QR Codes:** Automatic ticket generation sent via Email (Nodemailer).
*   **Scanner:** Built-in QR Code scanner for event organizers to verify attendees.

### 🛡️ Admin Dashboard
*   **Analytics:** View total users, events, and engagement stats.
*   **Moderation:** Ability to ban users or delete inappropriate events.

### 🎨 Modern UI/UX
*   **Design:** Responsive layout using Tailwind CSS.
*   **Theming:** Toggle between Light and Dark mode.
*   **Animations:** Smooth transitions using AOS (Animate On Scroll).

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Axios, React Router, Leaflet Maps, Socket.io Client |
| **Backend** | Node.js, Express.js, Mongoose, Socket.io, Nodemailer, Google Auth Library |
| **Database** | MongoDB Atlas |
| **Tools** | Git, Postman, VS Code |

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/KAMRANkami313/EventPulse-MERN-Project.git
cd EventPulse-MERN-Project
2. Backend Setup
Navigate to the server folder and install dependencies.
code
Bash
cd server
npm install
⚠️ Important: Environment Variables
Create a file named .env inside the server folder and add the following keys:
code
Env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_cloud_client_id
Start the Server:
code
Bash
npm start
3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies.
code
Bash
cd client
npm install
Start the Client:
code
Bash
npm run dev
4. Access the App
Open your browser and go to: http://localhost:5173
👨‍💻 Admin Access
By default, all new users are "users". To access the Admin Dashboard:
Register a new account.
Go to your MongoDB Database -> users collection.
Find your user document and change the role field from "user" to "admin".
Refresh the page, and the Admin Panel button will appear in the Navbar.
📄 License
This project was developed for a Semester Project submission.
Developed by Muhammad Kamran Kami