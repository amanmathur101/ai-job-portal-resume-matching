# 🚀 Job Portal Application (AI-Powered Recruitment Platform)

A full-stack Job Portal web application that connects job seekers and recruiters with secure authentication, role-based access control, AI-powered resume parsing, and intelligent candidate matching. The application is designed using modern backend architecture and a responsive frontend UI, and is fully deployed on cloud platforms.

---

## 🛠 Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security (JWT Authentication)
- Spring Data JPA (Hibernate)
- PostgreSQL
- Docker
- Render (Deployment)

### Frontend
- HTML5
- JavaScript (ES6 Modules)
- Tailwind CSS
- Nginx
- Vercel (Deployment)

---

## ✨ Features

- JWT-based authentication with role-based access control (USER / RECRUITER / ADMIN)
- Secure password encryption using BCrypt
- User registration and login with email notifications
- Resume upload and AI-assisted parsing (PDF/DOCX) using Apache Tika
- Extraction of skills, experience, education, and resume summaries
- AI-based candidate ranking with match score and reasoning
- Job posting, updating, and candidate shortlisting for recruiters
- Public job listing for job seekers
- Fully responsive UI built with Tailwind CSS
- RESTful APIs secured using Spring Security
- Stateless session management

---

## 🧠 Resume Parsing & Candidate Matching

- Supports PDF and DOCX resume uploads
- Extracts structured resume data using Apache Tika
- Generates AI-based match scores between resumes and job requirements
- Automatically ranks candidates for recruiter review

---

## 🌐 API Overview

| Endpoint | Method | Access |
|--------|--------|--------|
| /api/users/register | POST | Public |
| /api/users/login | POST | Public |
| /api/jobs/all | GET | Public |
| /api/jobs/post | POST | Recruiter |
| /api/resumes/upload | POST | Authenticated |
| /api/resumes/jobs/{jobId}/candidates | GET | Recruiter |

---

## 🚀 Deployment

### Backend
- Dockerized Spring Boot application
- Deployed on Render  
- Live URL:
https://jobportalbackend-dpm3.onrender.com

### Frontend
- Static frontend deployed on Vercel  
- Live URL:
  https://jobportalbackend-dpm3.onrender.com

---

## 📂 Project Structure

JobPortal  
├── backend  
│   ├── controller  
│   ├── service  
│   ├── config  
│   ├── model  
│   ├── repository  
│   └── security (JWT)  


---

## 🔒 Security Highlights

- JWT validation filter for protected endpoints
- Role-based authorization using Spring Security
- CORS configuration for deployed frontend
- Secure password storage using BCrypt hashing
- Stateless authentication architecture

---

## 📌 Key Learnings

- Building secure REST APIs with Spring Boot and Spring Security
- Implementing JWT authentication end-to-end
- Resume parsing using Apache Tika
- AI-based candidate ranking logic
- Dockerizing and deploying full-stack applications
- Handling production-level CORS and authentication issues

---

## 👨‍💻 Author

Aman Kumar  
Backend Developer | Java | Spring Boot | Full-Stack  

GitHub: https://github.com/amanmathur101/JobPortalBackend 
Live Project: https://job-portal-frontend-zc7u.vercel.app
