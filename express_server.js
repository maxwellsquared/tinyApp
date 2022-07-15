const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, addHTTP, getUserByEmail, urlsForUser } = require("./helpers.js");


app.use(cookieSession({
  name: 'session',
  keys: [
    '8fxgUvwLyOpNkBp2r06Y',
    '002xAVr9y5zA69O8j5uK',
    'xZP2ZipXElDT3ckM1NAN',
    'i4rUcL1Ara7e515IcAB0',
    'Z21OYq6pn0o2A74d3I8M'
  ],

  // Cookie Options
  maxAge: 90 * 24 * 60 * 60 * 1000 // Set a cookie to live for 90 days
}));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Start by putting some sample URLs here to play with.
const urlDatabase = {
  i3BoGr: {
    longURL: "https://www.pizza.net",
    userID: "testUser",
  },
  sgq3y6: {
    longURL: "https://www.whitehouse-decor.net",
    userID: "testUser",
  },
};

// Initialize user database with a test user
const users = {
  testUser: {
    id: "testUser",
    email: "a@a.com",
    password: "1234"
  }
};

//
// GET section
//

app.get("/urls", (req, res) => { // url (B)READ - browse
  if (!users[req.session["user_id"]]) {  
    return res.status(403).send('User not logged in! <a href="/login">Log in</a> first!');
  }
  let userID = req.session["user_id"];
  const templateVars = { urls: urlsForUser(userID, urlDatabase), user: users[userID] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session["user_id"]]) {
    return res.redirect("/login"); // If the user isn't logged in, make them log in
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  if (!users[req.session["user_id"]]) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => { // url B(R)EAD - read
  if (!users[req.session["user_id"]]) {
    return res.status(403).send('User not logged in. <a href="/login">Log in</a> first!');
  }
  console.log("User ID:", req.session["user_id"]);
  console.log("URL");
  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.status(403).send('This is not the URL you\'re looking for. <a href="/login">Log in</a> first!');
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect('/urls'); // If the user is already logged in, send them to the URL index
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect('/urls'); // If the user is already logged in, send them to the URL index
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render('login', templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('ERROR! This URL ID doesn\'t exist.');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//
// POST
//

// - URLs -

app.post("/urls", (req, res) => {  // Add URLs
  if (!users[req.session["user_id"]]) {
    return res.status(405).send('Nope! Only logged-in users can add URLs.');
  }
  urlDatabase[generateRandomString(6)] = { longURL: addHTTP(req.body.longURL), userID: req.session["user_id"] };
  res.redirect("urls");
});

app.post("/urls/:id/", (req, res) => { // Edit URLs
  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.status(403).send('ERROR! Not your URL. <a href="/login">Log in</a> first!');
  }
  urlDatabase[req.params.id].longURL = addHTTP(req.body.longURL);
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => { // Delete URLs
  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    return res.status(403).send('ERROR! Not your URL. <a href="/login">Log in</a> first!');
  }
  delete urlDatabase[req.params.id]; //
  res.redirect("/urls/");
});

// - USER -

app.post("/register", (req, res) => { //Register a new user
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Uh-oh! Empty username or password!');
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send('User with that email already exists!');
  }
  let newID = generateRandomString(8);
  users[newID] = { id: newID, email: req.body.email, password: hashedPassword};
  req.session.user_id = newID;
  res.redirect("/urls/");
});

app.post("/login/", (req, res) => { // Login
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send('Uh-oh! Empty username or password!');
  }
  let currentUser = getUserByEmail(req.body.email, users);
  if (!currentUser) {
    return res.status(403).send('Uh-oh! No user with that email address found.');
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!bcrypt.compareSync(req.body.password, hashedPassword)) {
    return res.status(403).send('Incorrect password');
  }
  req.session.user_id = users[currentUser].id;
  res.redirect("/urls/");
});

app.post("/logout/", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/urls/");
});

// LISTEN

app.listen(PORT, () => {
  console.log(`TonyApp listening on port ${PORT}!`);
});