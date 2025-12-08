# VZNX — Project & Team Management

🔗 [Live Demo](https://vznx-wheat.vercel.app)

Lightweight operating system for architecture studios — streamlining project tracking, task management, and team collaboration in one unified platform.

## ✨ Features

- **Smart Project Tracking** - Real-time project oversight with task dependencies and milestone tracking
- **Team Management** - Centralized team member profiles with role-based access control via JWT authentication
- **RESTful API Architecture** - Fully documented API endpoints for seamless integrations and extensibility
- **Responsive Dashboard** - Mobile-first design with TailwindCSS for on-the-go project management
- **MongoDB Backend** - Scalable NoSQL database with Mongoose ODM for flexible data modeling

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS, Context API  
**Backend:** Node.js, Express, Mongoose, JWT Authentication  
**Database:** MongoDB  
**Deployment:** Vercel (Frontend), Railway/Heroku (Backend)

## 🚀 Quick Start

**Backend Setup:**
```bash
cd backend
npm install
# Copy .env.example to .env and configure:
# MONGODB_URI, JWT_SECRET, PORT (default: 4000)
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
# Copy .env.example to .env and set:
# VITE_API_URL=http://localhost:4000
npm run dev
```

**API Endpoints:**
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/tasks` - Get project tasks



## 📦 Deployment

**Backend:** Deploy to Railway/Heroku with environment variables stored in provider's secret manager  
**Frontend:** Build with `npm run build` and deploy to Vercel/Netlify

## 🤝 Contributing

Pull requests welcome! Please keep changes focused and include tests for new features.

## 📧 Contact

Shivang Kanaujia - [LinkedIn](https://www.linkedin.com/in/shivang-kanaujia-973a6a175/) | [Portfolio](https://portfolio-shivang.vercel.app/)

---

*Built for efficient architecture studio workflows*
