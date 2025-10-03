# Frontend Developer Assignment 

This project was built as part of the **Frontend Developer Internship Assignment**.  
It demonstrates a **React.js frontend** integrated with a **Node.js/Express backend** using **JWT authentication** and **CRUD functionality**.

---

## Features

- User registration and authentication (JWT)
- Task management (Create, Read, Update, Delete)
- Task filtering, searching, and statistics
- Profile management with default avatar support
- API endpoint to fetch logs for auditing
- Responsive React frontend

---

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)

### Installation

1. **Install backend dependencies:**

   cd backend
   npm install


2. **Install frontend dependencies:**

   cd ../
   npm install


3. **Create a `.env` file in `/backend` with:**

   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-secret>


4. **Start the backend:**

   cd backend
   npm start
   # or
   nodemon server.js


5. **Start the frontend:**

   cd ../
   npm start


---

## API Endpoints

| Feature         | Method | URL                                         | Body/Headers                |
|-----------------|--------|---------------------------------------------|-----------------------------|
| Register        | POST   | /api/auth/register                          | JSON body                   |
| Login           | POST   | /api/auth/login                             | JSON body                   |
| Create Task     | POST   | /api/tasks                                  | JSON body + Auth header     |
| Get Tasks       | GET    | /api/tasks                                  | Auth header                 |
| Update Task     | PUT    | /api/tasks/:id                              | JSON body + Auth header     |
| Delete Task     | DELETE | /api/tasks/:id                              | Auth header                 |
| Task Stats      | GET    | /api/tasks/stats/overview                   | Auth header                 |
| Get Logs        | GET    | /api/logs                                   | (Auth header if protected)  |

---

## Logging

- All server, API, and error logs are saved to `backend/logs/app.log`.
- Logs include HTTP method, URL, status code, user actions, and errors.
- Fetch logs via: `GET /api/logs` (use Postman).

---
