const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/", (req, res) => {
  res.render('pages/index');
});

app.get("/about", (req, res) => {
  res.render("pages/about");
}); 

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (req.body.longURL.substring(0, 3) !== "http") {
    req.body.longURL = "http://" + req.body.longURL;
  }
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(req.body);
  res.redirect("urls")
});

app.post("/urls/:id/delete/", (req, res) => {
  delete urlDatabase[req.params.id] //
  res.redirect("/urls/")
});

app.post("/urls/:id/update/", (req, res) => {
  console.log("------");
  console.log("Trying to update over here!");
  console.log("Request params", req.params);
  console.log("Request body", req.body);
  urlDatabase[req.params.id] = req.body.longURL; // Running into trouble because I can't get the longURL back!
  res.redirect("/urls/")
  console.log(urlDatabase);
  console.log(req.params.id);
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