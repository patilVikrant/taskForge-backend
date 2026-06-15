const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// middleware
app.use(cors(corsOptions));
app.use(express.json());

const initializeDatabase = require("./db/db.connect");
const User = require("./models/user.models");
const Team = require("./models/team.models");
const Task = require("./models/task.models");
const Tag = require("./models/tag.models");
const Project = require("./models/project.models");
initializeDatabase();

// Auth routes

// POST /auth/signup - Registers a new user
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password." });
    }

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    res.status(201).json({ message: "User registered successfully.", user });
  } catch (error) {
    res.status(500).json({ message: "Server error during signup." });
  }
});

// POST /auth/login - Login user and send a JWT token
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email & password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // Find and check if user is registered
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // create a JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
});

// Protected Routes

// GET /auth/me - Get logged in user details
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    // get user data from DB excluding password
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User details fetched succesfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching the user details." });
  }
});

// Task Routes

// POST /tasks : Create a new task. (Protected route)
app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const { name, project, team, owners, tags, timeToComplete, status } =
      req.body;

    // check if all required fields are provided
    if (!name || !project || !team || !owners || !timeToComplete) {
      return res.status(400).json({
        message:
          "Please provide all the required fields: name, project, team, owners and timeToComplete",
      });
    }

    // create new task
    const newTask = new Task({
      name,
      project,
      team,
      owners,
      tags: tags || [],
      timeToComplete,
      status: status || "To Do",
    });

    const savedTask = await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating task" });
  }
});

// GET /tasks - Get all tasks with filtering (Protected)
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const { team, owner, project, status } = req.query;

    const filter = {};

    if (team) {
      filter.team = team;
    }
    if (owner) {
      filter.owners = owner;
    }
    if (project) {
      filter.project = project;
    }
    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("team", "name")
      .populate("owners", "name email");

    res.status(200).json({ message: "Tasks fetched successfully", tasks });
  } catch (error) {
    res.status(500).json({ message: "Error whie fetching the tasks" });
  }
});

// PUT /tasks/:id - Update a task (Protected)
app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating task" });
  }
});

// DELETE /tasks/:id - Delete a task (Protected)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

// GET /tasks/:id - Get single task by id (Protected)
app.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("team", "name")
      .populate("owners", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task fetched successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching the task" });
  }
});

// Project routes

// POST /projects - Create a new project (Protected)
app.post("/projects", authMiddleware, async (req, res) => {
  try {
    const newProject = new Project(req.body);

    const savedProject = await newProject.save();

    res
      .status(201)
      .json({ message: "Project created successfully", project: savedProject });
  } catch (error) {
    res.status(500).json({ message: "Server error whike creating project" });
  }
});

// GET /projects - Get all projects (Protected)
app.get("/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

// Team routes

// POST /teams - Create a new team (Protected)
app.post("/teams", authMiddleware, async (req, res) => {
  try {
    const newTeam = new Team(req.body);

    const savedTeam = await newTeam.save();

    res.status(201).json({
      message: "Team created successfully",
      team: savedTeam,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating team" });
  }
});

// GET /teams - Get all teams (Protected)
app.get("/teams", authMiddleware, async (req, res) => {
  try {
    const teams = await Team.find();

    res.status(200).json({
      message: "Teams fetched successfully",
      teams,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching teams" });
  }
});

// Report routes

//  GET /report/last-week - Tasks completed in last 7 days (Protected)
app.get("/report/last-week", authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await Task.find({
      status: "Completed",
      updatedAt: { $gte: sevenDaysAgo },
    })
      .populate("project", "name")
      .populate("team", "name")
      .populate("owners", "name email");

    res.status(200).json({
      message: "Last week completed tasks fetched successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching last week report" });
  }
});

// GET /report/pending - Fetch total days of work pending for all tasks (Protected)
app.get("/report/pending", authMiddleware, async (req, res) => {
  try {
    const pendingTasks = await Task.find({ status: { $ne: "Completed" } });

    const totalPendingDays = pendingTasks.reduce(
      (acc, currValue) => acc + currValue.timeToComplete,
      0,
    );

    res.status(200).json({
      message: "Total pending days of work for all tasks fetched successfully",
      totalPendingDays,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching pending report" });
  }
});

// GET /report/closed-tasks - Fetch the number of tasks closed by team, owner or project (Protected)
app.get("/report/closed-tasks", authMiddleware, async (req, res) => {
  try {
    const completedTasks = await Task.find({ status: "Completed" })
      .populate("project", "name")
      .populate("team", "name")
      .populate("owners", "name");

    const byTeam = {};
    const byProject = {};
    const byOwner = {};

    // group by team
    completedTasks.forEach((task) => {
      const teamName = task.team?.name || "Unknown";
      byTeam[teamName] = (byTeam[teamName] || 0) + 1;
    });

    // group by project
    completedTasks.forEach((task) => {
      const projectName = task.project?.name || "Unknown";
      byProject[projectName] = (byProject[projectName] || 0) + 1;
    });

    // group by owner
    completedTasks.forEach((task) => {
      task.owners.forEach((owner) => {
        const ownerName = owner?.name || "Unknown";
        byOwner[ownerName] = (byOwner[ownerName] || 0) + 1;
      });
    });

    res
      .status(200)
      .json({
        message: "Closed tasks report fetched successfully",
        byTeam,
        byProject,
        byOwner,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching closed tasks report" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
