const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
var mongoose = require("mongoose");

// Set up MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/finalExamVersion2");

// Creating the model in the database
const taskModal = mongoose.model("tasks", {
  name: { type: String },
  dynamicElement: { type: String },
  dueDate: { type: String },
  isComplete: { type: Boolean },
});

const app = express();

// Static files middleware to serve CSS, JS, and images from the public folder
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

// Just Checking git Brnach

// Form page route
app.get("/Form", function (req, res) {
  res.render("form");
});

app.post("/Form", function (req, res) {
  const taskDescription = req.body.description;
  const isDynamicallyDesigned = /^<h[1-5]>.*<\/h[1-5]>$/.test(taskDescription);
  const containsNoItalics = !/<i>|<\/i>/.test(taskDescription);

  if (isDynamicallyDesigned && containsNoItalics) {
    const date = new Date(req.body.date);
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${day + 1}-${month + 1}-${year}`;

    let task = new taskModal({
      name: req.body.name,
      dynamicElement: taskDescription,
      dueDate: currentDate,
    });
    // changed
    task
      .save()
      .then(() => {
        res.render("form");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred.");
      });
  } else {
    res.render("form", {
      message:
        "There were some errors in the form while making the Task. It should have H1 tag and Not any Italic Character.",
    });
  }
});

// Tasks page route
app.get("/Tasks", function (req, res) {
  taskModal.find({}).then((tasks) => {
    console.log("tasks: ", tasks);
    res.render("tasks", { tasks });
  });
});

// Tasks page route
app.get("/TodayTask", function (req, res) {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let currentDate = `${day}-${month + 1}-${year}`;
  console.log('"currentDate:', currentDate);
  taskModal
    .find({
      dueDate: currentDate,
    })
    .then((tasks) => {
      res.render("tasks", { tasks });
    });
});

// Tasks Delete route
app.get("/delete/:id", function (req, res) {
  taskModal
    .deleteOne({ _id: req.params.id }) // Delete the question.
    .then(res.redirect("/Tasks"));
});

// Tasks Edit Get route
app.get("/viewOrEdit/:id", function (req, res) {
  taskModal.findById({ _id: req.params.id }).then((task) => {
    if (!task) {
      res.status(404).send("Task not found");
    } else {
      res.render("form", { task });
    }
  });
});

// Tasks Edit Post route
app.post("/viewOrEdit/:id", function (req, res) {
  taskModal
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        dynamicElement: req.body.description,
        dueDate: req.body.date,
      },
      { new: true }
    )
    .then((updatedTask) => {
      res.redirect("/Tasks"); // Redirect to the tasks page after update
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error updating task");
    });
});

// Tasks Complete route
app.get("/Complete/:id", function (req, res) {
  taskModal
    .updateOne({ _id: req.params.id }, { isComplete: true })
    .then(() => {
      res.redirect("/Tasks"); // Redirect to the tasks page after update
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error marking task as complete");
    });
});

// Tasks Not Complete route
app.get("/NotComplete/:id", function (req, res) {
  taskModal
    .updateOne({ _id: req.params.id }, { isComplete: false })
    .then(() => {
      res.redirect("/Tasks"); // Redirect to the tasks page after update
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error marking task as complete");
    });
});

// Start the server on port 4235
app.listen(4220, () => console.log("Server started on http://localhost:4220/"));
