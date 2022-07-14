const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//
// GET
//


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars= { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('register', templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//
// POST
//

app.post("/urls", (req, res) => {
  res.redirect("urls")
});

app.post("/urls/:id/create/", (req, res) => {
  console.log("Created", req.body)
  urlDatabase[generateRandomString(6)] = addHTTP(req.body.longURL);
  res.redirect("/urls/")
});

app.post("/urls/:id/update/", (req, res) => {
  console.log("Updated it!")
  urlDatabase[req.params.id] = addHTTP(req.body.longURL);
  res.redirect("/urls/")
});

app.post("/urls/:id/delete/", (req, res) => {
  delete urlDatabase[req.params.id] //
  res.redirect("/urls/")
});

app.post("/user/:id/create", (req, res) => {
  let newID = generateRandomString(8)
  console.log(req.body); // Log the POST request body to the console
  users[newID] = { id: newID, email: req.body.email, password: req.body.password};
  console.log(users);
  res.cookie("user_id", newID);

  res.redirect("/urls/")
});

app.post("/login/", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls/")
});

app.post("/logout/", (req, res) => {
  console.log("Logging out...");
  res.clearCookie("user_id");
  res.redirect("/urls/")
});

// LISTEN

app.listen(PORT, () => {
  console.log(`TonyApplistening on port ${PORT}!`);
});

// FUNCTIONS

function generateRandomString(strLength) {
  let myChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randString = "";
  let randChar = "";
  for (let i = 0; i < strLength; i++) {
    randChar = myChars[Math.floor(Math.random() * myChars.length)];
    if (Math.random() > 0.5) {
      randChar = randChar.toUpperCase();
    }
    randString += randChar
  }
  return randString
}

const addHTTP = function(input) {
  if (input === undefined) return input;
  
  if (input.substring(0, 3) !== "http") {
    input = "http://" + input;
  }
  return input;
}