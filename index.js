const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");

// Set up MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/finalExamVersion2");

// Define the task schema
const taskSchema = new mongoose.Schema({
  name: String,
  dynamicElement: String,
  dueDate: String,
  isComplete: { type: Boolean, default: false },
});

// Create the task model
const Task = mongoose.model("tasks", taskSchema);

const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "/public")));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Set the views directory and the view engine to EJS
app.set("views", "./src/views");
app.set("view engine", "ejs");

// Home page route
app.get("/", (req, res) => {
  res.render("home");
});

// Form page route
app.get("/Form", (req, res) => {
  res.render("form");
});

// Function to get today's date in "YYYY-MM-DD" format
function todayDate() {
  const dateToday = new Date();
  const year = dateToday.getFullYear();
  const month = String(dateToday.getMonth() + 1).padStart(2, "0");
  const day = String(dateToday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Handle form submission
app.post("/Form", (req, res) => {
  const task = new Task({
    name: req.body.name,
    dynamicElement: req.body.description,
    dueDate: req.body.date,
  });

  task
    .save()
    .then(() => {
      res.render("form");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// Tasks page route
app.get("/Tasks", (req, res) => {
  Task.find({}).then((tasks) => {
    res.render("tasks", { tasks });
  });
});

// TodayTask page route
app.get("/TodayTask", (req, res) => {
  Task.find({
    dueDate: todayDate(),
  }).then((tasks) => {
    res.render("tasks", { tasks });
  });
});

// Delete task route
app.get("/delete/:id", (req, res) => {
  Task.deleteOne({ _id: req.params.id })
    .then(() => {
      res.redirect("/Tasks");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// View/Edit task route (GET)
app.get("/viewOrEdit/:id", (req, res) => {
  Task.findById(req.params.id)
    .then((task) => {
      if (!task) {
        res.status(404).send("Task not found");
      } else {
        res.render("form", { task });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// View/Edit task route (POST)
app.post("/viewOrEdit/:id", (req, res) => {
  Task.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      dynamicElement: req.body.description,
      dueDate: req.body.date,
    },
    { new: true }
  )
    .then((updatedTask) => {
      res.redirect("/Tasks");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// Mark task as complete route
app.get("/Complete/:id", (req, res) => {
  Task.findByIdAndUpdate(req.params.id, { isComplete: true })
    .then(() => {
      res.redirect("/Tasks");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// Mark task as not complete route
app.get("/NotComplete/:id", (req, res) => {
  Task.findByIdAndUpdate(req.params.id, { isComplete: false })
    .then(() => {
      res.redirect("/Tasks");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred.");
    });
});

// Start the server on port 4220
app.listen(4220, () => {
  console.log("Server started on http://localhost:4220/");
});
