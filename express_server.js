const express = require("express");
const cookieParser = require('cookie-parser');
//another new dependency
const cookieSession = require("cookie-session");
//new dependency therefore new require
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

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

const urlsForUser = function(id) {
  //received type error userID is undefined updated function 
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlObject = urlDatabase[shortURL];
    if (urlObject && urlObject.userID === id) {
      userUrls[shortURL] = urlObject;
    }
  }
  return userUrls;
}
 
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

//add cookieSession 
app.use(cookieSession ({
  name: 'session',
  keys: ['abc', 'def', 'ghi'/*no need to add this for now, or even midterms*/],

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
  //password needs to be udpated from register
  
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
  // declare hashedpassword before using it in newuser during registry
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userID = generateRandomString();
  
  const newUser = {
    id: userID,
    email: email,
    //password for newuser should now be stored as a hashed password
    password: hashedPassword,
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
  //password needs to be hashed in login as well to compare match

  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("email not found");
    return;
  }

  //need to update how the hashed password comparison works. is password correct return true or false
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  //upate for comparison, if hashed key doesn't match 
  if (!isPasswordCorrect) {
    res.status(403).send("incorrect password");
    return;
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  //should return a relevant error message if id does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  //should return a relevant error message if the user is not logged in
  //first update to new cookie session
  if (!req.session.user_id) {
    return res.status(404).send("You must log in to delete URLs");
  }

  //should return a relevant error message if the user does not own the URL
  const user_id = req.session.user_id;

  if (user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Unable to delete another users URL");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;

  //should return a relevant error message if id does not exist
  //changed shortURL to id
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  //should return a relevant error message if the user is not logged in
  if (!req.session.user_id) {
    return res.status(404).send("You must log in to edit URLs");
  }

  //should return a relevant error message if the user does not own the URL
  const user_id = req.session.user_id;

  if (user_id !== urlDatabase[id].userID) {
    return res.status(403).send("Unable to edit another users URL");
  }


  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if  (!req.session.user_id) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const user_id = req.session.user_id;
 
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user_id,
  };
  
  res.redirect(`/urls/${shortURL}`);
});


app.get("/login", (req, res) => {
  
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  res.render("login");
  }
});

app.get("/register", (req, res) => {
  
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  res.render("register");
  }
});

app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {


  const user_id =req.session.user_id;
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
};
  
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

  const templateVars  = { 
    user: users[user_id],
    urls : userUrls,
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