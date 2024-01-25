const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

const urlDatabase = {
  //changing url database so that URLS belong to users.
  //creating object within object with original key "shortURL" as first key.
  //setting both as userRandomID to see if they appear when I log in.
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  }
};

function generateRandomString() {
  let randomString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return randomString;
}


const getUserByEmail = function(email) {
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
  if  (!req.cookies["user_id"]) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  //cookie dependent
  const user_id = req.cookies["user_id"];
  //needs refactoring
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user_id,
  };
  
  //console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});


app.get("/login", (req, res) => {
  
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
  res.render("login");
  }
});

app.get("/register", (req, res) => {
  
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
  res.render("register");
  }
});

app.get("/urls/new", (req, res) => {
  
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {


  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    
    res.status(404).send("Short URL does not exist");
    return;
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  //longURL refactoring to urlObject
  const urlObject = urlDatabase[shortURL];

  //status for url not found
  if (!urlObject) {
    res.status(404).send("url not found");
    return;
  }
  
  const longURL = urlObject.longURL;
  const user_id = req.cookies["user_id"];

  //verify if url belongs to the user
  if (user_id !== urlObject.userID) {
    res.status(403).send("Access to URL denied");
    return;
};
  
  const templateVars = { 
    id: shortURL,
    longURL: longURL,
    user: user_id,
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