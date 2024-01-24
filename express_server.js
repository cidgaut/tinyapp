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

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//users object added 
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

//post to register to save user in cookies
app.post("/register", (req, res) => {
  //set values
  const email = req.body.email;
  const password = req.body.password;
  //random user id with already created url function
  const userID = generateRandomString();
  //create new user with above values
  const newUser = {
    id: userID,
    email: email,
    password: password,
  };

  //add newUSer to user object
  users[userID] = newUser,

  //set new cookie value to userID instead of username
  res.cookie('user_id', userID);
  console.log(users)
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log("received username:", username);
  res.cookie('username', username);
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


app.get("/register", (req, res) => {
  //should retrieve email and password
  
  res.render("register");
});
//update get to diplay use_id in template instead of username
app.get("/urls/new", (req, res) => {
  //take away username cookie to be diplayed to new, set value to diplay fall of user
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
    //username cookie appears here too, replace
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars  = { 
    //username cookie appears here too, replace
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