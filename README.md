# EventPulse - MERN Stack Event Management Platform

A full-stack social event management application built with the MERN stack (MongoDB, Express, React, Node.js). 
Features include real-time chat, Google Authentication, QR Code ticketing, and an Admin Dashboard.

## 🚀 Features

- **Authentication:** JWT-based Auth & Google OAuth (Sign in with Google).
- **Events:** Create, Join, Like, and Comment on events.
- **Ticketing:** Automatic QR Code ticket generation sent via Email.
- **Scanner:** Built-in QR Code scanner to verify tickets.
- **Real-time Chat:** Socket.io integration for live chat in event rooms.
- **Maps:** Interactive maps using Leaflet to view event locations.
- **Admin Panel:** Dashboard to manage users and events.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Redux Toolkit.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Services:** Nodemailer (Email), Socket.io (Chat), Google Cloud Console (Auth).

## 💻 How to Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/KAMRANkami313/EventPulse-MERN-Project.git
Setup Environment Variables (.env)
Create a .env file in the server folder with your credentials (MONGO_URL, JWT_SECRET, GOOGLE_CLIENT_ID).
Install Dependencies
code
Bash
cd client && npm install
cd ../server && npm install
Run the App
Server: npm start
Client: npm run dev
code
Code
### **Step 2: Push the New File to GitHub**

Now that the file exists, you need to tell Git to upload it.

Run these 3 commands in your terminal:

1.  **Add the file:**
    ```cmd
    git add .
    ```

2.  **Save it:**
    ```cmd
    git commit -m "Add Project README"
    ```

3.  **Upload it:**
    ```cmd
    git push
    ```