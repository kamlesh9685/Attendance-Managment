# Student Attendance Management (Smart Attendance)

## 📌 Overview
This project is a **hybrid attendance management system** that integrates:
- A **Node.js + MongoDB web application** for authentication, role-based dashboards, and manual attendance management.
- A **Python (OpenCV + DeepFace) pipeline** for automatic face-recognition-based attendance logging.

It solves the problem of **manual, error-prone, and time-consuming classroom attendance** by automating attendance capture while also providing manual override and dashboards for students, teachers, and admins.

---

## 🛠️ Tech Stack

### Backend (`attendance-website/backend/`)
- Node.js, Express.js
- MongoDB via Mongoose
- JWT (jsonwebtoken) & bcryptjs (authentication & hashing)
- Multer (file uploads)
- CORS, dotenv

### Frontend (`attendance-website/frontend/`)
- HTML, CSS, JavaScript
- SheetJS (XLSX) for Excel export

### AI/Computer Vision (`scratch/`)
- Python 3
- OpenCV (cv2)
- DeepFace
- PyMongo

### Database
- MongoDB (local instance) → `attendance_system`

---

## ✨ Features

- **Authentication**
  - Role-based login: **Student, Teacher, Admin**
  - Admin login hardcoded (userId: `admin`, password: `admin123`)

- **Student Registration & Approval**
  - Students can register → pending approval
  - Teachers can approve/reject students

- **Teacher Management (Admin)**
  - Add / List / Remove teachers

- **Dashboards**
  - Student Dashboard → Profile + Attendance history
  - Teacher Dashboard → Attendance list + Excel export
  - Admin Dashboard → Manage teachers

- **Attendance (Face Recognition)**
  - Python pipeline captures faces via webcam
  - Matches with registered student images
  - Writes attendance records into MongoDB

- **Export**
  - Teacher dashboard exports attendance to `.xlsx` format

---

## 🚀 Installation & Setup

### ✅ Prerequisites
- MongoDB installed & running locally
- Node.js 18+
- Python 3.9+
- Webcam access for face recognition

---

### 🔹 Backend Setup
```bash
cd attendance-website/backend

# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=change-this-secret
PORT=5000

# Install dependencies
npm install

# Start backend server
npm start
# Runs on http://localhost:5000
```

---

### 🔹 Frontend Setup
```bash
cd attendance-website/frontend

# Install dependencies
npm install

# Start frontend server
npm start
# Runs on http://localhost:3000
```

---

### 🔹 Python Face Recognition Setup
```bash
cd scratch

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run face recognition script
python attendance_pipeline.py
```

---

## 📂 Project Structure
```bash
attendance-website/
│── backend/           # Node.js + Express + MongoDB backend
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   └── server.js      # Entry point
│
│── frontend/          # HTML, CSS, JS frontend
│   └── index.html
│
└── scratch/           # Python face recognition pipeline
    └── attendance.py
```

---

## 📊 Future Enhancements
- Real-time lecture scheduling

- Cloud database & deployment

- Mobile app integration

- Advanced analytics dashboard

---

## 👨‍💻 Contributors

- Kamlesh Gehlot (MCA, NIT Kurukshetra)

- Team Members: Pratik Raj, Amrish Kumar

## 📸 Screenshots
<img width="1920" height="1020" alt="Screenshot 2025-08-19 200904" src="https://github.com/user-attachments/assets/e9d8126c-bb63-4c44-9052-623cc7f2978d" />


<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/6b2fbe3b-adc3-4108-aa7e-6d3ea8e0e671" />


<img width="1920" height="1020" alt="Screenshot 2025-08-19 232424" src="https://github.com/user-attachments/assets/d41723cf-8058-4173-9d51-536f6964ffec" />


<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/eb074fec-7c22-4016-b758-71d64645c5a5" />








