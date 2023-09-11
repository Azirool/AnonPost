const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://<YourUsername>:<YourPassword>@cluster0.yb3jo2c.mongodb.net/<YourCollectionName>');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User",  userSchema);

app.get("/", (req, res) =>{
    res.render("home");
});

app.get("/register", (req, res) =>{
    res.render("register");
});

app.get("/login", (req, res) =>{
    res.render("login");
});

app.post("/register", (req, res) =>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then((success) =>{
        if(success){
            res.render("secrets");
        }else{
            console.log("Check your code again");
        }
    });
});

app.post("/login", (req, res) =>{
    const username = req.body.username;
    const password = req.body.password;
    
    User.findOne({email:username}).then((foundUser) =>{
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            } else {
                console.log("Wrong password");
            }
        }
    }).catch((err) => {
        console.log(err);
    })
})


app.listen(3000, () =>{
    console.log("Server Running");
})