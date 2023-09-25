require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//Session setup
app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}));

//Start passport
app.use(passport.initialize());
//Manage session using passport
app.use(passport.session());

mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.yb3jo2c.mongodb.net/${process.env.DB_COLLECTION}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Set up schema to use local-mongoose plugin
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",  userSchema);

//Passport local configuration
passport.use(User.createStrategy());
//Serialize
passport.serializeUser(User.serializeUser());
//Deserialize
passport.deserializeUser(User.deserializeUser());

//Home Page
app.get("/", (req, res) =>{
    res.render("home");
});

//Register Page
app.get("/register", (req, res) =>{
    res.render("register");
});

//Login Page
app.get("/login", (req, res) =>{
    res.render("login");
});

//Secrets Page
app.get("/secrets", (req, res) =>{
    //Check whether user is authenticated
    if(req.isAuthenticated()){
        res.render("secrets");
    }else {
        res.redirect("/login");
    }
});

//Logout Function
app.get("/logout", (req, res) =>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

//Register Function
app.post("/register", (req, res) =>{
   User.register({username: req.body.username}, req.body.password, (err, user) =>{
    if(err){
        console.log(err);
        res.redirect("/register");
    }else {
        passport.authenticate("local")(req, res, () =>{
            res.redirect("/secrets");
        });
    }
   });
});

//Login Function
app.post("/login", (req, res) =>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    //Check user
    req.login(user, (err) =>{
        if(err){
            console.log(err);
        }else {
            passport.authenticate("local")(req, res, () =>{
                res.redirect("/secrets");
            });
        }
    });
});

//Server
app.listen(3000, () =>{
    console.log("Server Running");
});