const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return randomString;
}

//helper function to keep code "DRY"
const getUserByEmail = function(email) {
  //look through users for id with for in (object)
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Please fill in both email and password to register.");
    return;
  }
  if (getUserByEmail(email)) {
    res.status(400).send("Email already registered.");
    return;
  }
  const userID = generateRandomString();
  
  const newUser = {
    id: userID,
    email: email,
    password: password,
  };

  users[userID] = newUser,

  res.cookie('user_id', userID);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("email not found");
    return;
  }
  if (user.password !== password) {
    res.status(403).send("incorrect password");
    return;
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL; 
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});


app.get("/login", (req, res) => {
  //render back to /url if member is already logged in
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
  res.render("login");
  }
});

app.get("/register", (req, res) => {
  //render back to /url if member is already logged in
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
  res.render("register");
  }
});

app.get("/urls/new", (req, res) => {
  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
  user,
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    id: shortURL,
    longURL: longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars  = { 
    user,
    urls : urlDatabase
  };
    res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 