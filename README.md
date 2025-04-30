# Verdo Business Dashboard - Midterm API

This project is a RESTful API built using **Node.js**, **Express.js**, and **MongoDB** with **Mongoose**.  
It is part of my **Web Engineering midterm assignment** and supports basic carbon footprint tracking for businesses.

---

Project Purpose and Overview

### **Purpose:**
The purpose of this project is to create a simple backend API for a **Carbon Footprint Tracking Dashboard**.  
Users (employees) can log how much CO₂ they are saving, and businesses can view this data to measure their sustainability efforts.

### **Overview:**
This backend is built for the **Verda Dashboard**, where:
- Users log actions (like biking, saving electricity, etc.)
- These actions are saved in MongoDB as activity logs
- The business admin can fetch all logs using the API

This project is part of a bigger system where a user-facing PWA (Verda Tracker) will send log data, and this dashboard API will manage it.

---

Current Progress

### 1. **Activity Log Routes**
- **POST `/api/logs`** → Create a new CO₂ log
- **GET `/api/logs`** → Retrieve all CO₂ logs

These routes are fully functional and tested with Postman.

---

 Project Structure
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── app.js
└── server.js



---

Activity Log Schema

Each log contains:
- `user`: The name of the user (string)
- `category`: Type of activity (e.g., transport, electricity)
- `amount`: Number value (how much CO₂ saved in kg)
- `unit`: Unit of measurement (default: `"kg"`)
- `timestamp`: Auto-generated date when the log is created

---

Technologies Used

- **Node.js** – Backend runtime
- **Express.js** – Web server
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **dotenv** – Manage environment variables
- **Postman** – Testing APIs

---

## 🚀 How to Run the Project

1. **Clone the repo**
```bash
git clone https://github.com/your-username/verda-business-dashboard.git
cd verda-business-dashboard



