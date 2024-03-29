//dependencies and frameworks
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const helpers = require('./helpers');

//other configurations
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//database initialization

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  }
};

//functions
//retrieve URLs associated with the user
const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlObject = urlDatabase[shortURL];
    if (urlObject && urlObject.userID === id) {
      userUrls[shortURL] = urlObject;
    }
  }
  return userUrls;
};

//provides short url to user
const generateRandomString = function() {
  let randomString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

//

app.use(express.urlencoded({ extended: true }));
//added the json information decoder for
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: ['abc', 'def', 'ghi'],

  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

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
  if (helpers.getUserByEmail(email, users)) {
    res.status(400).send("Email already registered.");
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userID = generateRandomString();
  
  const newUser = {
    id: userID,
    email: email,
    
    password: hashedPassword,
  };

  users[userID] = newUser,

  
  req.session.user_id = userID;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {

  
  req.session = null;
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  

  const email = req.body.email;
  const password = req.body.password;

  //get user by email is used here, udpated to use the getUserByEmail fucntion frm helpers
  const user = helpers.getUserByEmail(email, users);
  if (!user) {
    res.status(403).send("email not found");
    return;
  }

  
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  
  if (!isPasswordCorrect) {
    res.status(403).send("incorrect password");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  if (!req.session.user_id) {
    return res.status(404).send("You must log in to delete URLs");
  }

  const user_id = req.session.user_id;

  if (user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Unable to delete another users URL");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (!req.session.user_id) {
    return res.status(404).send("You must log in to edit URLs");
  }

  const user_id = req.session.user_id;

  if (user_id !== urlDatabase[id].userID) {
    return res.status(403).send("Unable to edit another users URL");
  }


  urlDatabase[id].longURL = newURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if  (!req.session.user_id) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }
  const longURL = req.body.longURL; //taking 
  if (!longURL.startsWith("http://")) {
    res.status(403).send("Your URL must include valid http:// path");
    return;
  }
  const shortURL = generateRandomString();
  const user_id = req.session.user_id;

  console.log("user_id:", user_id);
 
  urlDatabase[shortURL] = {
    longURL: longURL, //storing take extra consition for if url does not include http:
    userID: user_id,
  };

  console.log("urlDatabase:", urlDatabase);
  
  res.redirect(`/urls/${shortURL}`);
});


app.get("/login", (req, res) => {
  const user_id = req.session.user_id
  const templateVars = {
    user: user_id ? users[user_id] : null,
  };

  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id
  const templateVars = {
    user: user_id ? users[user_id] : null,
  };
  
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const user_id = req.session.user_id;
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
  res.redirect(longURL.longURL);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlObject = urlDatabase[shortURL];

  if (!urlObject) {
    res.status(404).send("url not found");
    return;
  }
  
  const longURL = urlObject.longURL;
  const user_id = req.session.user_id;

  if (user_id !== urlObject.userID) {
    res.status(403).send("Access to URL denied");
    return;
  }
  
  const templateVars = {
    id: shortURL,
    longURL:longURL,
    user: user_id,
    urlObject: urlObject,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send("please log in to access URLs");
  }

  const userUrls = urlsForUser(user_id);

  console.log("urlDatabase:", urlDatabase);
  console.log(userUrls);

  const templateVars = {
    user: users[user_id],
    urls : userUrls,
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/login");
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

module.exports = app;