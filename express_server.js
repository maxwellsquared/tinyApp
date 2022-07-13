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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars= { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[generateRandomString()] = addHTTP(req.body.longURL);
  console.log(req.body);
  res.redirect("urls")
});

app.post("/urls/:id/delete/", (req, res) => {
  delete urlDatabase[req.params.id] //
  res.redirect("/urls/")
});

app.post("/urls/:id/update/", (req, res) => {
  urlDatabase[req.params.id] = addHTTP(req.body.longURL); // Running into trouble because I can't get the longURL back!
  res.redirect("/urls/")
});

app.post("/login/", (req, res) => {
  console.log("Hit login!")
  console.log(req.body.username);
  console.log("Cookies:", req.cookies);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  res.cookie("username", req.body.username);
  res.redirect("/urls/")
});

app.post("/logout/", (req, res) => {
  console.log("Logging out!");
  console.log("Cookies:", req.cookies);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  res.clearCookie("username");
  res.redirect("/urls/")
});

app.listen(PORT, () => {
  console.log(`TonyApplistening on port ${PORT}!`);
});

function generateRandomString() {
  let myChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randString = "";
  let randChar = "";
  for (let i = 0; i < 6; i++) {
    randChar = myChars[Math.floor(Math.random() * myChars.length)];
    if (Math.random() > 0.5) {
      randChar = randChar.toUpperCase();
    }
    randString += randChar
  }
  return randString
}

const addHTTP = function(input) {
  if (input.substring(0, 3) !== "http") {
    input = "http://" + input;
  }
  return input;
}