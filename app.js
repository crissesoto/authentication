//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

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

// middleware for hashing passwords
const secret = "testestestest" || process.env.SOME_LONG_UNGUESSABLE_STRING;

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

//create model
const User = mongoose.model('User', userSchema );


// HOME PAGE
app.route('/')
    .get(function (req, res) {
        res.render('home.ejs');
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
          
        console.log(foundUser)
        if(foundUser){
            if(foundUser.password === data.password){
                res.render("secrets.ejs")
            }else{
                res.send("could found match")
            }
        }else{
            res.send("Not such user found!", err)
        }

      });

    })

// REGISTER PAGE
app.route('/register')
    .get(function (req, res) {
        res.render('register.ejs');
    })
    .post(function (req, res) {
        const data = req.body;
        console.log(data)

        const newUser = new User({ 
            email: data.email,
            password: data.password
          });

        newUser.save(function (err) {
            if(err){
                console.log("Could not save new user: " + err)
            }else{
                res.render('secrets.ejs')
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
})