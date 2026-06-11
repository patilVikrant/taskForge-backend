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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
