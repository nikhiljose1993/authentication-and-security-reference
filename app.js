require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = process.env.SALTROUNDS | 0;
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
// mongoose class schema for encryption purpose
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log("hashingerr", err);
      return;
    }
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, async (err, foundUser) => {
    if (err) {
      console.log(err);
      return;
    }
    if (foundUser) {
      try {
        const match = await bcrypt.compare(password, foundUser.password);
        if (match) {
          res.render("secrets");
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
