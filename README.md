# Sports Event Management System (SaaS)

A production-grade, commercial-ready sports management platform built with the MERN stack.

## Features
- **Premium Dashboard**: Real-time analytics and tournament stats.
- **Tournament Management**: Create, update, and manage sports competitions.
- **Automated Fixtures**: Generate round-robin and knockout match schedules.
- **Live Match Center**: Real-time score updates using Socket.IO.
- **Glassmorphism UI**: Modern, futuristic design with Framer Motion animations.
- **RBAC**: Role-based access control for Admins, Organizers, and Captains.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT.
- **Storage**: Cloudinary (for banners and logos).

## Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Cloudinary Account (optional, for image uploads)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd SMS
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sports_management
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Schema
- **Users**: Name, Email, Password (hashed), Role (Admin/Organizer/Captain), Avatar.
- **Tournaments**: Title, Sport Type, Format, Venue, Banner, Schedule.
- **Teams**: Team Name, Logo, Captain, Players, Status (Pending/Approved).
- **Matches**: Tournament Reference, Team A vs Team B, Scores, Events (Live).

## UI/UX Design System
- **Background**: #081120
- **Primary Accent**: #3B82F6 (Blue)
- **Secondary Accent**: #8B5CF6 (Purple)
- **Cards**: Glassmorphism (rgba(255,255,255,0.08))
- **Animations**: Framer Motion for smooth transitions.

## Author
Antigravity AI
