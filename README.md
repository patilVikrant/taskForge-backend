# TaskForge Backend

REST API backend for TaskForge — a full stack task and project management application. Built with Node.js, Express and MongoDB.

---

## 🔗 Links

🌐 [Live API](https://task-forge-backend-a1m1.vercel.app)

🖥️ [Frontend Repository](https://github.com/patilVikrant/taskForge)

🌐 [Frontend Live](https://task-forge-fawn.vercel.app)

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/patilVikrant/taskForge-backend.git

# Navigate to project
cd taskForge-backend

# Install dependencies
npm install

# Create .env file and add your environment variables
# Refer to Environment Variables section below

# Start development server
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project and add the following:

```
PORT=3000
MONGODB=your_mongodb_connection_string_here
JWT_SECRET_KEY=your_jwt_secret_key_here
```

---

## 🛠️ Tech Stack

| Technology   | Purpose                       |
| ------------ | ----------------------------- |
| Node.js      | Runtime environment           |
| Express.js   | Web framework                 |
| MongoDB      | Database                      |
| Mongoose     | MongoDB ODM                   |
| bcryptjs     | Password hashing              |
| jsonwebtoken | JWT authentication            |
| cors         | Cross origin resource sharing |
| dotenv       | Environment variables         |

---

## 📁 Folder Structure

```
taskforge-backend/
├── db/
│   └── db.connect.js         # MongoDB connection with caching
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── models/
│   ├── project.models.js     # Project schema
│   ├── tag.models.js         # Tag schema
│   ├── task.models.js        # Task schema
│   ├── team.models.js        # Team schema
│   └── user.models.js        # User schema
├── index.js                  # Express server and all routes
├── package.json
└── vercel.json               # Vercel deployment config
```

---

## 📡 API Reference

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes

#### POST /auth/signup

Register a new user.

**Request Body:**

```json
{
  "name": "Vikrant Patil",
  "email": "vikrant@testmail.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "message": "User registered successfully.",
  "user": {
    "_id": "64c34512f7a60e36df44",
    "name": "Vikrant Patil",
    "email": "vikrant@testmail.com"
  }
}
```

---

#### POST /auth/login

Login and receive a JWT token.

**Request Body:**

```json
{
  "email": "vikrant@testmail.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64c34512f7a60e36df44",
    "name": "Vikrant Patil",
    "email": "vikrant@testmail.com"
  }
}
```

---

#### GET /auth/me ⚙️ Protected

Get logged in user details.

**Response:**

```json
{
  "message": "User details fetched successfully.",
  "user": {
    "id": "64c34512f7a60e36df44",
    "name": "Vikrant Patil",
    "email": "vikrant@testmail.com"
  }
}
```

---

#### PUT /auth/update-profile ⚙️ Protected

Update user name and email.

**Request Body:**

```json
{
  "name": "Vikrant Updated",
  "email": "vikrant.new@testmail.com"
}
```

**Response:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "64c34512f7a60e36df44",
    "name": "Vikrant Updated",
    "email": "vikrant.new@testmail.com"
  }
}
```

---

#### PUT /auth/change-password ⚙️ Protected

Change user password.

**Request Body:**

```json
{
  "currentPassword": "123456",
  "newPassword": "newpass123"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

---

#### DELETE /auth/delete-account ⚙️ Protected

Delete user account and remove from all task owners.

**Response:**

```json
{
  "message": "Account deleted successfully"
}
```

---

### 📁 Project Routes

#### POST /projects ⚙️ Protected

Create a new project.

**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Redesigning the company website"
}
```

**Response:**

```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "64c34512f7a60e36df44",
    "name": "Website Redesign",
    "description": "Redesigning the company website",
    "createdAt": "2026-06-20T10:30:00.000Z"
  }
}
```

---

#### GET /projects ⚙️ Protected

Get all projects.

**Response:**

```json
{
  "message": "Projects fetched successfully",
  "projects": [
    {
      "_id": "64c34512f7a60e36df44",
      "name": "Website Redesign",
      "description": "Redesigning the company website",
      "createdAt": "2026-06-20T10:30:00.000Z"
    }
  ]
}
```

---

#### GET /projects/:id ⚙️ Protected

Get a single project by ID.

**Response:**

```json
{
  "message": "Project fetched successfully",
  "project": {
    "_id": "64c34512f7a60e36df44",
    "name": "Website Redesign",
    "description": "Redesigning the company website",
    "createdAt": "2026-06-20T10:30:00.000Z"
  }
}
```

---

### 👥 Team Routes

#### POST /teams ⚙️ Protected

Create a new team.

**Request Body:**

```json
{
  "name": "Development Team",
  "description": "Handles all development work"
}
```

**Response:**

```json
{
  "message": "Team created successfully",
  "team": {
    "_id": "64c99a47b74e58d3b213",
    "name": "Development Team",
    "description": "Handles all development work"
  }
}
```

---

#### GET /teams ⚙️ Protected

Get all teams.

**Response:**

```json
{
  "message": "Teams fetched successfully",
  "teams": [
    {
      "_id": "64c99a47b74e58d3b213",
      "name": "Development Team",
      "description": "Handles all development work"
    }
  ]
}
```

---

### ✅ Task Routes

#### POST /tasks ⚙️ Protected

Create a new task.

**Request Body:**

```json
{
  "name": "Design Homepage",
  "project": "64c34512f7a60e36df44",
  "team": "64c99a47b74e58d3b213",
  "owners": ["64f5826ac278d930b214"],
  "tags": ["UI", "Urgent"],
  "timeToComplete": 5,
  "status": "To Do"
}
```

**Response:**

```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "64f5826ac278d930b214",
    "name": "Design Homepage",
    "status": "To Do",
    "timeToComplete": 5,
    "tags": ["UI", "Urgent"],
    "createdAt": "2026-06-20T10:30:00.000Z"
  }
}
```

---

#### GET /tasks ⚙️ Protected

Get all tasks with populated project, team and owners.

**Response:**

```json
{
  "message": "Tasks fetched successfully",
  "tasks": [
    {
      "_id": "64f5826ac278d930b214",
      "name": "Design Homepage",
      "project": { "name": "Website Redesign" },
      "team": { "name": "Development Team" },
      "owners": [{ "name": "Vikrant Patil", "email": "vikrant@testmail.com" }],
      "tags": ["UI", "Urgent"],
      "status": "To Do",
      "timeToComplete": 5
    }
  ]
}
```

---

#### GET /tasks/:id ⚙️ Protected

Get a single task by ID.

**Response:**

```json
{
  "message": "Task fetched successfully",
  "task": {
    "_id": "64f5826ac278d930b214",
    "name": "Design Homepage",
    "project": { "name": "Website Redesign" },
    "team": { "name": "Development Team" },
    "owners": [{ "name": "Vikrant Patil", "email": "vikrant@testmail.com" }],
    "tags": ["UI", "Urgent"],
    "status": "To Do",
    "timeToComplete": 5
  }
}
```

---

#### PUT /tasks/:id ⚙️ Protected

Update a task by ID.

**Request Body:**

```json
{
  "status": "Completed"
}
```

**Response:**

```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "64f5826ac278d930b214",
    "name": "Design Homepage",
    "status": "Completed"
  }
}
```

---

#### DELETE /tasks/:id ⚙️ Protected

Delete a task by ID.

**Response:**

```json
{
  "message": "Task deleted successfully",
  "task": {
    "_id": "64f5826ac278d930b214",
    "name": "Design Homepage"
  }
}
```

---

### 👤 User Routes

#### GET /users ⚙️ Protected

Get all users (used for owners dropdown).

**Response:**

```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "_id": "64f5826ac278d930b214",
      "name": "Vikrant Patil",
      "email": "vikrant@testmail.com"
    }
  ]
}
```

---

### 📈 Report Routes

#### GET /report/last-week ⚙️ Protected

Get tasks completed in the last 7 days.

**Response:**

```json
{
  "message": "Last week completed tasks fetched successfully",
  "count": 3,
  "tasks": [...]
}
```

---

#### GET /report/pending ⚙️ Protected

Get total days of work pending for all incomplete tasks.

**Response:**

```json
{
  "message": "Total pending days fetched successfully",
  "totalPendingDays": 52
}
```

---

#### GET /report/closed-tasks ⚙️ Protected

Get tasks closed grouped by team, owner and project.

**Response:**

```json
{
  "message": "Closed tasks report fetched successfully",
  "byTeam": {
    "Development Team": 7,
    "Design Team": 4
  },
  "byOwner": {
    "Vikrant Patil": 5,
    "Nishant Patil": 3
  },
  "byProject": {
    "Website Redesign": 6,
    "Mobile App": 5
  }
}
```

---

## 👨‍💻 Author

**Vikrant Patil**

- GitHub: [@patilVikrant](https://github.com/patilVikrant)

---

## Contact

For bugs and feature requests, please reach out to pvikrant248@gmail.com
