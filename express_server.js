const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser') // replace this!

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
  testUser: {
    id: "testUser",
    email: "a@a.com",
    password: "1234"
  }
};


//
// GET
//

app.get("/urls", (req, res) => { // url (B)READ - browse
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

app.get("/urls/:id", (req, res) => { // url B(R)EAD - read
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('login', templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
//
// POST
//

// - URLs - 

app.post("/urls", (req, res) => {  // url BRE(A)D - add
  urlDatabase[generateRandomString(6)] = addHTTP(req.body.longURL);
  res.redirect("urls")
});

app.post("/urls/:id/", (req, res) => { // BR(E)AD - edit
  console.log("Updated it!")
  urlDatabase[req.params.id] = addHTTP(req.body.longURL);
  res.redirect("/urls/")
});

app.post("/urls/:id/delete", (req, res) => { // BREA(D) - delete
  delete urlDatabase[req.params.id] //
  res.redirect("/urls/")
});

// - USER - 

app.post("/register", (req, res) => {
  console.log("Registering new user...")
  if (req.body.email === "" || req.body.password === "" ) {
    return res.status(400).send('Uh-oh! Empty username or password!'); // make sure this is a return or you get a headers error
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send('User with that email already exists!'); // as above
  }
  let newID = generateRandomString(8)
  console.log(req.body); // Log the POST request body to the console
  users[newID] = { id: newID, email: req.body.email, password: req.body.password};
  console.log(users);
  res.cookie("user_id", newID);
  res.redirect("/urls/")
});

app.post("/login/", (req, res) => {
  console.log("-----");
  console.log("--LOGGING IN--");
  console.log("req.body", req.body)
  if (req.body.email === "" || req.body.password === "" ) {
    return res.status(403).send('Uh-oh! Empty username or password!'); // make sure this is a return or you get a headers error
  }
  currentUser = getUserByEmail(req.body.email);
  if (!currentUser) {
    return res.status(403).send('Oopsie woopsie! No user with that email address found.');
  }
  if (users[currentUser] && users[currentUser].password !== req.body.password) {
    return res.status(403).send('Incorrect password'); // make sure to change later
  }
  console.log(`Logged in with email ${users[currentUser].email} and password ${users[currentUser].password}`);
  res.cookie("user_id", users[currentUser].id);
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

const getUserByEmail = function(emailToCheck) {
  console.log("Checking", emailToCheck);
  for (let user in users) {
    console.log(`Checking ${user} with address ${users[user].email}...`)
    if (users[user].email === emailToCheck) {
      console.log(`Found user ${user} with email ${users[user].email}`)
      return user;
    }
  }
  return false;
}
