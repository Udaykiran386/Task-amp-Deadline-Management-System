# Task & Deadline Management System 🚀

A full-stack MERN application for admins to manage projects/tasks with deadlines, assign work to interns, and track progress in real-time. Features role-based authentication and live updates via Socket.IO.[memory:2]

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node-20-green.svg)](https://nodejs.org)

## 🛠️ Features

- **Admin Dashboard**: CRUD operations for projects & tasks, assign/reassign to interns[memory:2]
- **Intern Dashboard**: View assigned tasks with deadlines & status updates[memory:4]
- **Real-time Updates**: Socket.IO for live task assignments & status changes[memory:3]
- **Role-based Auth**: JWT protected routes for admin/intern roles[memory:4]
- **Deadline Tracking**: Visual indicators for pending/overdue tasks[conversation_history:8]
- **Responsive UI**: Tailwind CSS for mobile-first design[memory:1]

## 🏗️ Tech Stack

| Component     | Technologies                          |
|---------------|---------------------------------------|
| **Frontend**  | React 18, Tailwind CSS, Axios, Socket.IO-client |
| **Backend**   | Node.js, Express.js, MongoDB, Socket.IO |
| **Auth**      | JWT, bcryptjs                         |
| **Styling**   | Tailwind CSS, PostCSS  ,BootStrap               |
| **Database**  | MongoDB (Mongoose ODM)                |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm/yarn


## 📋 API Endpoints

| Method | Endpoint                          | Description                    | Auth    |
|--------|-----------------------------------|--------------------------------|---------|
| **Auth** |                                   |                                |         |
| POST   | `/api/auth/login`                 | User login                     | Public  |
| POST   | `/api/auth/register`              | Register new user              | Public  |
| **Projects** |                               |                                |         |
| GET    | `/api/projects`                   | Get all projects               | Admin   |
| POST   | `/api/projects`                   | Create new project             | Admin   |
| PUT    | `/api/projects/:id`               | Update project                 | Admin   |
| DELETE | `/api/projects/:id`               | Delete project                 | Admin   |
| **Tasks** |                                 |                                |         |
| POST   | `/api/projects/:projectId/tasks`  | Create task in project         | Admin   |
| PUT    | `/api/projects/:projectId/tasks/:taskId` | Update task              | Admin   |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | Delete task             | Admin   |
| PUT    | `/api/projects/:taskId/assign`    | Assign task to intern          | Admin   |
| PATCH  | `/api/projects/intern/tasks/:taskId/status` | Update task status (intern) | Intern  |
| **Interns & Tasks** |                          |                                |         |
| GET    | `/api/projects/interns`           | Get all interns (for assignment)| Admin   |
| GET    | `/api/projects/intern/tasks`      | Get intern's assigned tasks    | Intern  |


## 🧪 Testing

1. **Admin Flow**: Login → Create project → Add tasks → Assign to intern
2. **Real-time**: Open intern dashboard → Watch live task assignment
3. **Deadlines**: Verify overdue/pending status indicators
4. **Responsive**: Test on mobile/tablet views
