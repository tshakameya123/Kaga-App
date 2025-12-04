<p align="center">
  <img src="frontend/public/logo.png" alt="Kaga Health Logo" width="120" />
</p>

<h1 align="center">🏥 Kaga Health - Medical Clinic Appointment System</h1>

<p align="center">
  <strong>A comprehensive healthcare management platform for patients, doctors, and administrators</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
</p>

---

## 📑 Table of Contents

- [🔍 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔒 Security](#-security-owasp-top-10)
- [📁 Project Structure](#-project-structure)
- [👥 User Roles](#-user-roles)
- [⚙️ Installation](#️-installation)
- [🔐 Environment Variables](#-environment-variables)
- [📖 API Documentation](#-api-documentation)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🔍 Overview

**Kaga Health** is a full-stack medical clinic appointment management system designed to streamline healthcare operations. It connects patients with healthcare providers, enabling seamless appointment booking, management, and communication.

The platform serves three key user groups:
- 🏥 **Patients** - Book appointments, manage health profiles, and receive notifications
- 👨‍⚕️ **Doctors** - Manage schedules, view appointments, and track patient consultations
- 👨‍💼 **Administrators** - Oversee the entire system, manage doctors, and view analytics

---

## ✨ Features

### 🏥 Patient Portal

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | Registration & login with JWT tokens (7-day expiry), strong password validation |
| 🔑 **Password Recovery** | Forgot password with email reset link, secure token-based reset |
| 👤 **Account Management** | Change password, update profile, delete account with confirmation |
| 👨‍⚕️ **Doctor Discovery** | Browse doctors by specialty with detailed profiles and availability status |
| 📅 **Smart Booking** | Interactive calendar with real-time slot availability (12-hour format) |
| 🔄 **Appointment Rescheduling** | Reschedule appointments with automatic slot management |
| 📋 **Appointment Management** | View, cancel appointments with instant notifications |
| 🔔 **Real-time Notifications** | Booking confirmations, reminders, cancellation alerts, reschedule notices |
| 🌤️ **Weather Widget** | Live weather information on the dashboard |
| 👤 **Profile Management** | Update personal info, upload profile pictures via Cloudinary |

### 👨‍⚕️ Doctor Dashboard

| Feature | Description |
|---------|-------------|
| 📊 **Analytics Dashboard** | Overview of appointments, earnings, patient statistics |
| 📅 **Schedule Management** | Set weekly availability with period-based time slots (Morning/Afternoon/Evening) |
| 🚫 **Time Blocking** | Block specific dates/times, set vacation periods, quick-block presets |
| 📋 **Appointment Queue** | View and manage daily/weekly appointments |
| ✅ **Appointment Actions** | Mark appointments as complete or cancel them |
| 🔄 **Availability Toggle** | Set availability status in real-time |
| 🔔 **Notifications** | Receive alerts for new bookings, cancellations, reschedules |
| 👤 **Profile Management** | Update professional information, credentials, and specialization |

### 👨‍💼 Admin Panel

| Feature | Description |
|---------|-------------|
| 📈 **Analytics Dashboard** | Comprehensive overview with key metrics, charts, and trends |
| 👨‍⚕️ **Doctor Management** | Add, edit, remove doctors with full profile control |
| 👥 **Patient Management** | View and manage registered patients |
| 📅 **Appointment Oversight** | Monitor all appointments across the clinic |
| 🔔 **Notification Center** | View all system notifications with filters (by type, read/unread) |
| 🗑️ **Bulk Actions** | Delete all notifications, mark all as read |
| 📤 **Send Reminders** | Trigger appointment reminder notifications |
| 🔐 **Access Control** | Secure admin authentication with timing-safe comparison |

### 🔔 Notification System

| Notification Type | Trigger |
|-------------------|---------|
| ✅ **Appointment Confirmation** | When patient books an appointment |
| ⏰ **Appointment Reminder** | 24 hours before appointment |
| 🔄 **Reschedule Alert** | When appointment is rescheduled (sent to doctor, patient, admin) |
| ❌ **Cancellation Alert** | When appointment is cancelled |
| 📅 **Schedule Change** | When doctor modifies their schedule |
| 📢 **General Notifications** | System-wide announcements |

### 📧 Email System

| Feature | Description |
|---------|-------------|
| 🔑 **Password Reset Emails** | Beautiful HTML templates with reset links |
| ⏰ **1-Hour Expiry** | Secure token expiration for password resets |
| 📱 **Responsive Design** | Email templates work on all devices |

---

## 🏗️ System Architecture

```

                           KAGA HEALTH SYSTEM                            

                                                                         
           
     PATIENT          DOCTOR              ADMINISTRATOR           
     PORTAL          DASHBOARD               PANEL                
                                                                  
    React.js         React.js               React.js              
    Port 3000        Port 3001              Port 3001             
           
                                                                      
                            
                                                                        
                                                                        
                                         
                     BACKEND API                                      
                                                                      
                 Express.js + Node.js                                 
                      Port 4000                                       
                                                                      
                                             
                    REST API Routes                                 
                   /api/user                                       
                   /api/doctor                                     
                   /api/admin                                      
                   /api/messages                                    
                                             
                                                                      
                                             
                     Middleware                                     
                   JWT Auth                                        
                   Rate Limiting                                   
                   File Upload                                     
                                             
                                         
                                                                        
                               
                                                                     
                          
    MongoDB         Cloudinary                                   
     Atlas            (Images)                                   
                                                                 
    Users           Profiles                                  
    Doctors         Uploads                                   
    Appts                                                       
                          
                                                                         

```

---

## 🛠️ Tech Stack

### ⚛️ Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI component library |
| **React Router 6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client for API calls |
| **React Toastify** | Toast notifications |
| **React DatePicker** | Date selection component |
| **FullCalendar** | Calendar visualization |
| **React Icons** | Icon library |
| **Vite** | Build tool and dev server |

### 🖥️ Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing (cost factor 12) |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud image storage |
| **Nodemailer** | Email sending (password reset) |
| **Swagger** | API documentation |
| **Express Rate Limit** | API rate limiting |
| **Helmet** | Security headers |
| **hpp** | HTTP Parameter Pollution protection |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **crypto** | Secure token generation |

### ☁️ DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Render** | Cloud deployment platform |
| **MongoDB Atlas** | Managed database hosting |

---

## 🔒 Security (OWASP Top 10)

The application implements comprehensive security measures based on **OWASP Top 10 (2021)** guidelines across the entire stack.

### Backend Security

| Protection | Implementation |
|------------|----------------|
| **Broken Access Control** | JWT authentication with 7-day expiration, role-based middleware, resource ownership validation |
| **Cryptographic Failures** | bcrypt (cost factor 12), HS256 algorithm pinning, HSTS headers |
| **Injection** | express-mongo-sanitize, custom XSS sanitizer, input validation middleware |
| **Insecure Design** | Centralized validation schemas, rate limiting, generic error messages |
| **Security Misconfiguration** | Helmet.js security headers, CORS restrictions, request size limits |
| **Vulnerable Components** | Regular `npm audit`, dependency updates |
| **Auth Failures** | Strong password policy (8+ chars, upper/lower/number), auth rate limiting (5/15min) |
| **Data Integrity** | JWT algorithm verification, input validation |
| **Logging Failures** | Security event logging, suspicious activity detection |
| **SSRF** | URL validation, whitelisted external services |

### Security Files Structure
```
backend/
├── middleware/
│   ├── security.js       # Helmet, XSS, NoSQL injection, HPP protection
│   ├── validation.js     # Input validation schemas and sanitization
│   ├── authUser.js       # User JWT verification with expiry checks
│   ├── authAdmin.js      # Admin auth with timing-safe comparison
│   └── authDoctor.js     # Doctor JWT verification
└── SECURITY.md           # Detailed security documentation
```

### Frontend Security (Admin & Patient Portal)

| Protection | Implementation |
|------------|----------------|
| **XSS Prevention** | `sanitizeInput()` on all user inputs |
| **Token Security** | `secureRetrieve()` with format/expiry validation, 60-second periodic checks |
| **Rate Limiting** | Client-side rate limiters (5 attempts/15 min for auth, 3/15 min for contact) |
| **Input Validation** | Email, password, name, phone, DOB validators |
| **Error Handling** | Centralized 401/403/429 handling with auto-logout |
| **File Validation** | Image type and size (5MB) validation before upload |
| **Request Timeouts** | 15-30 second timeouts on all API calls |

### Security Utilities
```javascript
// frontend/src/utils/security.js & admin-doc/src/utils/security.js
sanitizeInput(input)         // XSS prevention
isValidEmail(email)          // Email format validation
validatePassword(password)   // Strong password check
validateName(name)           // Name validation (2-50 chars)
validatePhone(phone)         // Phone number validation
isTokenExpired(token)        // JWT expiry check
secureRetrieve(key)          // Safe token retrieval
createRateLimiter(max, ms)   // Client-side rate limiting
```

### Quick Security Checklist
```bash
# Before Deployment
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS origins (FRONTEND_URL, ADMIN_URL)
- [ ] Run npm audit and fix vulnerabilities
- [ ] Enable HTTPS in production
- [ ] Review admin credentials
```

---

## 📁 Project Structure

```
kh-app/
├── backend/                    # Express.js API Server
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary configuration
│   │   ├── mongodb.js          # Database connection
│   │   └── email.js            # Nodemailer email configuration
│   ├── controllers/
│   │   ├── adminController.js  # Admin business logic
│   │   ├── doctorController.js # Doctor business logic
│   │   ├── userController.js   # Patient business logic (+ password recovery)
│   │   ├── messageController.js # Messaging logic
│   │   └── notificationController.js # Notification system
│   ├── middleware/
│   │   ├── authAdmin.js        # Admin JWT verification
│   │   ├── authDoctor.js       # Doctor JWT verification
│   │   ├── authUser.js         # Patient JWT verification
│   │   ├── multer.js           # File upload config
│   │   ├── security.js         # OWASP security middleware
│   │   └── validation.js       # Input validation schemas
│   ├── models/
│   │   ├── AppointmentModel.js # Appointment schema
│   │   ├── doctorModel.js      # Doctor schema (+ schedule)
│   │   ├── userModel.js        # Patient schema (+ password reset tokens)
│   │   ├── messageModel.js     # Message schema
│   │   ├── notificationModel.js # Notification schema
│   │   ├── scheduleModel.js    # Doctor schedule schema
│   │   └── reportModel.js      # Reports schema
│   ├── routes/
│   │   ├── adminRoute.js       # Admin endpoints
│   │   ├── doctorRoute.js      # Doctor endpoints
│   │   ├── userRoute.js        # Patient endpoints (+ password recovery)
│   │   ├── notificationRoute.js # Notification endpoints
│   │   └── messageRoutes.js    # Messaging endpoints
│   ├── tests/                  # Jest test files
│   ├── server.js               # Express app entry point
│   └── package.json
│
├── frontend/                   # Patient-facing React App (Port 5173)
│   ├── src/
│   │   ├── assets/             # Images and static files
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   ├── Header.jsx      # Hero section
│   │   │   ├── TopDoctors.jsx  # Featured doctors
│   │   │   ├── SpecialityMenu.jsx # Specialty filter
│   │   │   ├── Banner.jsx      # CTA banner
│   │   │   ├── Footer.jsx      # Site footer
│   │   │   ├── RelatedDoctors.jsx # Related doctors
│   │   │   └── Weather.jsx     # Weather widget
│   │   ├── context/
│   │   │   └── AppContext.jsx  # Global state management
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Doctors.jsx     # Doctor listing
│   │   │   ├── Appointment.jsx # Booking interface
│   │   │   ├── MyAppointments.jsx # User appointments (+ reschedule)
│   │   │   ├── MyProfile.jsx   # Profile settings (+ change password)
│   │   │   ├── Login.jsx       # Auth page
│   │   │   ├── ForgotPassword.jsx # Password reset request
│   │   │   ├── ResetPassword.jsx # Password reset form
│   │   │   ├── Notifications.jsx # User notifications
│   │   │   ├── About.jsx       # About page
│   │   │   └── Contact.jsx     # Contact page
│   │   ├── utils/
│   │   │   └── security.js     # Client-side security utilities
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # React entry point
│   └── package.json
│
├── admin-doc/                  # Admin & Doctor Dashboard (Port 5174)
│   ├── src/
│   │   ├── context/
│   │   │   ├── AdminContext.jsx  # Admin state
│   │   │   ├── DoctorContext.jsx # Doctor state
│   │   │   └── AppContext.jsx    # Shared state
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx      # Admin dashboard
│   │   │   │   ├── AddDoctor.jsx      # Add new doctor
│   │   │   │   ├── DoctorsList.jsx    # Manage doctors
│   │   │   │   ├── PatientsList.jsx   # View patients
│   │   │   │   ├── AllAppointments.jsx # All appointments
│   │   │   │   └── Notifications.jsx  # Admin notifications
│   │   │   ├── Doctor/
│   │   │   │   ├── DoctorDashboard.jsx  # Doctor dashboard
│   │   │   │   ├── DoctorAppointments.jsx # Doctor's appointments
│   │   │   │   ├── DoctorProfile.jsx    # Doctor profile
│   │   │   │   └── DoctorSchedule.jsx   # Schedule management
│   │   │   └── login.jsx        # Admin/Doctor login
│   │   ├── utils/
│   │   │   ├── security.js      # Client-side security utilities
│   │   │   └── api.js           # Axios with interceptors
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docker/                     # Docker configuration
│   └── mongo-init.js           # MongoDB initialization
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 👥 User Roles

### 🏥 Patient (User)
```
Account Management:
✅ Register with email and strong password validation
✅ Login with secure JWT authentication
✅ Forgot password with email reset link
✅ Reset password using secure token
✅ Change password from profile
✅ Delete account with confirmation

Appointment Features:
✅ Browse available doctors by specialty
✅ View detailed doctor profiles and credentials
✅ See real-time slot availability (12-hour format)
✅ Book appointments with preferred time slots
✅ View and manage upcoming appointments
✅ Cancel appointments with notifications
✅ Reschedule appointments to new slots

Profile & Notifications:
✅ Update personal profile information
✅ Upload profile photo
✅ Receive booking confirmations
✅ Get appointment reminders
✅ View notification history
```

### 👨‍⚕️ Doctor
```
Dashboard & Analytics:
✅ View personalized dashboard with stats
✅ Track earnings and patient count
✅ See appointment trends

Schedule Management:
✅ Set weekly availability by periods (Morning/Afternoon/Evening)
✅ Define custom time ranges for each day
✅ Block specific dates and times
✅ Set vacation/leave periods
✅ Quick-block presets (lunch breaks, meetings)
✅ Toggle overall availability status

Appointment Management:
✅ View today's and upcoming appointments
✅ Mark appointments as completed
✅ Cancel appointments when necessary
✅ Receive notifications for new bookings
✅ Get alerts for cancellations and reschedules

Profile:
✅ Update professional information
✅ Manage credentials and specialization
✅ Upload profile photo
```

### 👨‍💼 Administrator
```
Dashboard:
✅ View comprehensive analytics
✅ Monitor key performance metrics
✅ Track appointment trends

Doctor Management:
✅ Add new doctors with full profiles
✅ Edit existing doctor information
✅ Remove doctors from the system
✅ Change doctor availability status

Patient & Appointment Management:
✅ View all registered patients
✅ Monitor all appointments across clinic
✅ Cancel any appointment
✅ Delete appointments permanently

Notification Management:
✅ View all system notifications
✅ Filter by type (confirmations, cancellations, reschedules)
✅ Mark notifications as read
✅ Delete individual or all notifications
✅ Send appointment reminder notifications
```

---

## ⚙️ Installation

### 📋 Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn
- Git

### 📥 Clone the Repository
```bash
git clone https://github.com/yourusername/kh-app.git
cd kh-app
```

### 📦 Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin Dashboard
cd ../admin-doc
npm install
```

### 🔧 Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
# See Environment Variables section below
```

### 🚀 Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Admin Dashboard
cd admin-doc
npm run dev
```

### 🐳 Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=production
CURRENCY=UGX

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Authentication (IMPORTANT: Use 32+ character secret)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# Admin Credentials (Use strong password!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=VeryStrongAdminPassword123!

# Email Configuration (for password reset emails)
# For Gmail: Enable 2FA, then create App Password at https://myaccount.google.com/apppasswords
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# Frontend URL (for password reset links and CORS)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Frontend Environment (`.env` in `frontend/`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin Panel Environment (`.env` in `admin-doc/`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 📖 API Documentation

The API is documented using Swagger. Access the interactive documentation at:

```
http://localhost:4000/api-docs
```

### 🔑 Key Endpoints

#### 🔐 Authentication & Account Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new patient |
| POST | `/api/user/login` | Patient login |
| POST | `/api/user/forgot-password` | Request password reset email |
| POST | `/api/user/reset-password` | Reset password with token |
| GET | `/api/user/verify-reset-token/:token` | Verify reset token validity |
| POST | `/api/user/change-password` | Change password (auth required) |
| POST | `/api/user/delete-account` | Delete user account (auth required) |
| POST | `/api/doctor/login` | Doctor login |
| POST | `/api/admin/login` | Admin login |

#### 📅 Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/book-appointment` | Book new appointment |
| GET | `/api/user/appointments` | Get user's appointments |
| POST | `/api/user/cancel-appointment` | Cancel appointment |
| POST | `/api/user/reschedule-appointment` | Reschedule appointment |

#### 👨‍⚕️ Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctor/list` | List all doctors |
| GET | `/api/doctor/appointments` | Doctor's appointments |
| POST | `/api/doctor/complete-appointment` | Mark as complete |
| POST | `/api/doctor/cancel-appointment` | Cancel appointment |
| POST | `/api/doctor/change-availability` | Toggle availability |
| GET | `/api/doctor/profile` | Get doctor profile |
| POST | `/api/doctor/update-profile` | Update doctor profile |

#### 📅 Doctor Schedule Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctor/schedule` | Get doctor's schedule |
| POST | `/api/doctor/schedule` | Update weekly schedule |
| POST | `/api/doctor/schedule/block` | Block specific time slots |
| DELETE | `/api/doctor/schedule/block/:id` | Remove time block |
| POST | `/api/schedule/available-slots` | Get available slots for booking |

#### 🔔 Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/admin` | Get admin notifications |
| POST | `/api/notifications/doctor` | Get doctor notifications |
| GET | `/api/notifications/patient/:userId` | Get patient notifications |
| PATCH | `/api/notifications/read/:id` | Mark notification as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete a notification |
| POST | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/process-reminders` | Send appointment reminders |

#### 👨‍💼 Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| POST | `/api/admin/add-doctor` | Add new doctor |
| POST | `/api/admin/edit-doctor` | Edit doctor details |
| POST | `/api/admin/delete-doctor` | Remove doctor |
| GET | `/api/admin/all-doctors` | List all doctors |
| GET | `/api/admin/all-patients` | List all patients |
| GET | `/api/admin/appointments` | All appointments |
| POST | `/api/admin/cancel-appointment` | Cancel any appointment |

---

## 🚀 Deployment

### ☁️ Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create three services:

**Backend (Web Service)**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables

**Frontend (Static Site)**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_BACKEND_URL=https://your-backend.onrender.com`

**Admin (Static Site)**
- Root Directory: `admin-doc`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_BACKEND_URL=https://your-backend.onrender.com`

### 🐳 Deploy with Docker

```bash
# Build and run all services
docker-compose up -d --build

# Access services
# Frontend: http://localhost:3000
# Admin:    http://localhost:3001
# Backend:  http://localhost:4000
# API Docs: http://localhost:4000/api-docs
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Security audit
npm audit
npm audit fix
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

### 📝 Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the ISC License.

---

## 🖼️ Screenshots

### Patient Portal
| Home Page | Doctor Booking | My Appointments |
|-----------|----------------|-----------------|
| Landing page with doctor search | Appointment booking with calendar | View and manage appointments |

### Doctor Dashboard
| Dashboard | Schedule Management | Appointments |
|-----------|---------------------|--------------|
| Analytics and stats | Set availability & block times | Manage patient appointments |

### Admin Panel
| Dashboard | Doctor Management | Notifications |
|-----------|-------------------|---------------|
| System analytics | Add/Edit doctors | Manage all notifications |

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/kh-app.git
cd kh-app

# 2. Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../admin-doc && npm install

# 3. Set up environment variables
cd ../backend
cp .env.example .env
# Edit .env with your credentials

# 4. Start all servers (in separate terminals)
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Patient Portal
cd frontend && npm run dev

# Terminal 3 - Admin/Doctor Dashboard
cd admin-doc && npm run dev

# 5. Open in browser
# Patient Portal: http://localhost:5173
# Admin Panel: http://localhost:5174
# API Docs: http://localhost:4000/api-docs
```

---

## 👨‍💻 Authors

- **Kaga Health Team** - *Development and maintenance*

---

## 💬 Support

For support, email **kagahealth@gmail.com** or open an issue in this repository.

---

## 🙏 Acknowledgments

- ⚛️ React.js community
- 💚 Node.js community
- 🍃 MongoDB team
- 🎨 TailwindCSS team
- 👥 All contributors

---

<p align="center">
  <strong>Made with ❤️ for better healthcare</strong>
</p>

<p align="center">
  <sub>Last updated: November 2025</sub>
</p>

<p align="center">
  <a href="#-overview">⬆️ Back to top</a>
</p>
