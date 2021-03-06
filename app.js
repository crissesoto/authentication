//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require('mongoose-encryption');
//const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('veiw engine', 'ejs');

// DATABASE 
mongoose.connect('mongodb://localhost:27017/secretsDB', {useNewUrlParser: true, useUnifiedTopology: true});

// test connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("succesfully connect with Mongoose")
});

// Create schema
const userSchema = new mongoose.Schema({ 
    email: String,
    password: String

});

// key to encrypt DB
//let secret = process.env.USER_SECRET;
// middleware for hashing passwords
//userSchema.plugin(encrypt, { secret: process.env.USER_SECRET, encryptedFields: ['password'] });



//create model
const User = mongoose.model('User', userSchema );


// HOME PAGE
app.route('/')
    .get(function (req, res) {
        res.render('home.ejs');
    })


// REGISTER PAGE
app.route('/register')
    .get(function (req, res) {
        res.render('register.ejs');
    })
    .post(function (req, res) {
        const data = req.body;
        console.log(data)


        const myPlaintextPassword = data.password;
        
        bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            if(!err){
                const newUser = new User({ 
                    email: data.email,
                    password: hash
                  });

                newUser.save(function (err) {
                if(err){
                    console.log("Could not save new user: " + err)
                }else{
                    res.render('secrets.ejs')
                }
            })
            }else{
                console.log(err)
            }
        });
    })



// LOGIN PAGE
app.route('/login')
    .get(function (req, res) {
        res.render('login.ejs');
    })
    .post(function (req, res) {
      const data = req.body;
      console.log(data)

        User.findOne({email: data.email}).exec(function (err, foundUser) {
            if(!err){
                if(foundUser){
                    bcrypt.compare(data.password, foundUser.password, function(err, result) {
                        if(result === true){
                            res.render("secrets.ejs") 
                        }else{
                            res.status(400).send("credentials don't match")
                        }
                    });
                }else{
                    res.status(400).send("Not such user found!")
                }
            }else{
                console.log(err)
            }
        })
    })
    

// SECRETS PAGE
app.route('/secrets')
    .get(function (req, res) {
        res.render('secrets.ejs');
    })

//LOGOUT PAGE
app.get('/logout',function (req, res) {
    res.render('home.ejs')
})

// SUBMIT PAGE
app.route('/submit')
    .get(function (req, res) {
        res.render('submit.ejs');
    })




const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log(`Server started at port: ${PORT}`);
});