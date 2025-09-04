# 🚀 Socket Chat  
A real-time chat application built with **Node.js, Express, Socket.IO, MongoDB, and React (TypeScript + Vite)**.  

Users can authenticate, join chat rooms, and exchange messages instantly.

---

## ⚙️ Tech Stack  

- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose  
- **Frontend**: React (TypeScript), Vite  
- **Auth**: JWT-based authentication  
- **Styling**: CSS  

---

## 🔑 Features  

- 🔐 User authentication (login & register)  
- 🏠 Create and join chat rooms  
- 💬 Real-time messaging with Socket.IO  
- 📜 Message persistence using MongoDB  
- 🎨 Modern React + TypeScript frontend  

---

## 📦 Installation  

### 1️⃣ Clone the repo  
```bash
git clone https://github.com/yourusername/socket-chat.git
cd socket-chat
```

### Backend Setup
```bash
cd server
npm install
```
### Backend env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_URL=mongodb://localhost:27017/socketchat
JWT_SECRET=your_jwt_secret

### Frontend Setup
```bash
cd client
npm install
```
### Frontend env
VITE_BACKEND_URL=http://localhost:3000

### Start dev server
```bash
npm run dev
```
