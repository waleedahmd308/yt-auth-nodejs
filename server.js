require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");



var froute=require('./router/index');
var bodyparser= require('body-parser');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const reports=require('./models/reportSchema');
const bcrypt = require("bcryptjs");
const product=require('./models/productschema');
const path =require('path');
var urlencodedParser = bodyparser.urlencoded({ extended: false })
const producttype=require('./models/productype');

const Publishable_Key="pk_test_51L6GSFDDX3xl0iimMFP3T46vcGEz5TgcUEtGxQpKsKoTujOC0kydBj1Mrq4wOvDgp3iqxZ2GUg8JJGpNGoM6jjV000o52pbZtx";
const Secret_Key="sk_test_51L6GSFDDX3xl0iim2WKHjH1ajREJnbNjbdJdmpPxnnh9GYg63ZefRq2FBDRpZ6KBiESeTFbXL0x0ucJGY1IRZhwE00TDplBqrC";

const stripe = require('stripe')(Secret_Key)


const {
  checkAuthenticated,
  checkNotAuthenticated,

} = require("./middlewares/auth");

const app = express();

app.get('/paymentDone', function(req, res){
  res.render('userAccountsUploadViews/paymentDone', {
  key: Publishable_Key
  })
})

app.post('/payment', function(req, res){
 
  stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: 'Waleed Ahmed',
      address: {
          line1: 'TC 9/4 Old MES colony', 
          postal_code: '110092',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
      }
  })
  .then((customer) => {

      return stripe.charges.create({
          amount: 7000,    // Charing Rs 25
          description: 'Web Development Product',
          currency: 'USD',
          customer: customer.id
      });
  })
  .then((charge) => {
      res.send("Success") // If no error occurs
  })
  .catch((err) => {
      res.send(err)    // If some error occurs
  });
})

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});






app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", );
});

app.get("/profile", checkAuthenticated, (req, res) => {

  res.render("userProfile",{first_name:req.user.first_name,last_name:req.user.last_name,email:req.user.email,company:req.user.company,phone_number:req.user.phone_number,city:req.user.city,address:req.user.address,accountsUploaded:"2",accountsForsale:"3"} );
});

app.get("/forgotPassword", function (req, res) {
  res.render("userViews/forgotPassword");
});

var otpcode;

app.post("/sendOtp", function (req, res) {
  const rmail = req.body.recmail;
  otpcode = Math.floor(Math.random() * 10000 + 1);

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "f191001@nu.edu.pk",
      pass: "MAGNETOsaud@99",
    },
  });

  var mailOptions = {
    from: "f191001@nu.edu.pk",
    to: rmail,
    subject: "Password reset / Games Hub",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otpcode +
      "</h1>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.render("userViews/otp");
      console.log("Email sent: " + info.response);
    }
  });
});

 app.get("/confirm-otp", function (req, res) {
   res.render("userViews/otp");
 });

app.post("/confirm-otp", function (req, res) {
  userotp = req.body.otp;
  if (userotp == otpcode) {
    console.log("OTP success !");
    res.render("userViews/resetPass");
  } else {
    otpcode = 0;
    res.redirect("/confirm-otp");
    console.log("redirected due to otp failure");
  }
});




 app.get("/reset-pass", function (req, res) {
   res.render("userViews/resetPass");
 });

app.post("/reset-pass", async function (req, res) {
  
  prevP = req.body.prevpass;
  newP = req.body.newpass;
  confirmP = req.body.confirmpass;

  if(newP == confirmP){
   
    const hashedPassword = await bcrypt.hash(req.body.confirmpass, 10);
    User.findOneAndUpdate({email: req.body.recmail},{password: hashedPassword },{useFindAndModify:true},function(err,res){
      if (err) throw err;
       console.log("1 document updated");
    });
    res.render("userViews/resetSuccess");
    console.log("Reset successful");
  }else{
    res.redirect("/reset-pass");
    console.log("New password does not match with confirm password");
  }

 
  
});



//add css

  app.use('/static',express.static(path.join(__dirname,'public')))
  
  app.use('/assets',express.static(path.join(__dirname,'public/assets')))



  app.get("/report",(req,res)=>{
    res.render("reportsSend.ejs");
  })
  app.post('/reportuser', urlencodedParser, function(req,res){
    const add_reports = new reports({
        username:req.body.user,
        repusername:req.body.reportedusr,
        description:req.body.description,
        
    });
    add_reports.save()
    .then((result)=>{
        console.log('User reported successfully');
        res.redirect('/gameacc');
    }
    )
    .catch((err)=>{
        console.log(err);
    })
})
 
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});


app.get("/adminTables", (req, res) => {
  
  res.render("adminViews/adminTables");
});

app.get("/adminViewReports", (req, res) => {
  

  
  reports.find({}).exec(function(err, product) {
    if (err) throw err;
   console.log(product);
   res.render("adminViews/reports",{data:product, });
  
  })
});
app.get("/usersProfile",(req,res)=>{
 
  User.find({}).exec(function(err, product) {
    if (err) throw err;
   console.log(product);
   res.render("adminViews/profileUsers",{data:product, success:''});
  
  })
  
})

app.get("/remove",function(req,res){
  console.log("me");
  userData= User.findByIdAndDelete(req.query.id);
  userData.exec(function(err, data){
    if (err) throw err;
    User.find({}).exec(function(err, product) {
      if (err) throw err;
     console.log(product);
     res.render("adminViews/profileUsers",{data:product, success:'User deleted successfully'});
    
    })
       
  })
});
//userLoginAuthentication
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
//admin loginAuthentication
app.get("/adminLoginPage", (req,res)=>{
  res.render("adminViews/adminLoginPage");
})
app.get("/adminDashboard",(req,res)=>{

  res.render("adminViews/adminDashboard");
})
app.post("/updateUserProfile",async (req,res)=>
{
  console.log(req.file);
  
  console.log(req.body.first_name);
  var newvalues = { $set:  {first_name: req.body.first_name,
    last_name:req.body.last_name,
    email: req.body.email,
    company:req.body.company,
    phone_number:req.body.phone_number,
    address:req.body.address,
    city:req.body.city,

    }};
    var myquery = { email: req.body.email };
  User.updateOne(myquery,newvalues,function(err,res){
    if (err) throw err;
    console.log("1 document updated");
    //req.flash("Done", "Profile updated");
   
  });
  req.flash("Done","Profile Updated");
  res.redirect("/");
})
app.post("/register", checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email });

  if (userFound) {
    req.flash("error", "User with that email already exists");
    res.redirect("/register");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        first_name: req.body.first_name,
        last_name:req.body.last_name,
        email: req.body.email,
        company:req.body.company,
        phone_number:req.body.phone_number,
        address:req.body.address,
        city:req.body.city,
        password: hashedPassword,
      });

      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});




//GMSidework
//addaccount
  //searchgameaccounttype
  app.get('/searchgametype', function(req, res) {
    producttype.find({title:req.query.search}).exec(function(err, producttypes) {
        if (err) throw err;
        res.render("userAccountsUploadViews/userAccountstype.ejs", { data: producttypes});
    });
});
app.get('/searchprice', function(req, res) {
    product.find({price:req.query.search}).exec(function(err, product) {
        if (err) throw err;
        res.render("userAccountsUploadViews/userAccounts", { data: product});
    });
});
/////adminsidesearch
    app.get('/searchg', function(req, res) {
        product.find({price:req.query.search}).exec(function(err, product) {
            if (err) throw err;
            res.render("adminUpload/gameaccount.ejs", { data: product});
        });
    });
   //searchgameaccounttype
   app.get('/searchtype', function(req, res) {
    producttype.find({title:req.query.search}).exec(function(err, producttypes) {
        if (err) throw err;
        res.render("adminUploadAccount/accountType.ejs", { data: producttypes});
    });
});
/////
app.get('/project', function(req, res) {
  producttype.find({}).exec(function(err, producttypes) {
      if (err) throw err;
      res.render("adminUploadAccount/accountType.ejs", { data: producttypes});
  });
});
app.get('/gameaccount', function(req, res) {
  product.find({title:req.query.title}).exec(function(err, product) {
    console.log(req.query.title);
      res.render("adminUploadAccount/adminAccount.ejs", { data: product});
    
  });
});
// app.get('/gameaccount', function(req, res) {
//         product.find({title:req.query.title}).exec(function(err, product) {
//             if (err) throw err;
//            if(product!='')
//             res.render("../view/gameaccount.ejs", { data: product});
//            else
//           { res.render("../view/notfoundadminside.ejs");
//           }
//         });
//     });
app.post('/addaccount',urlencodedParser,function(req,res){
  const product_data = new product({
      title:req.body.title,
      description:req.body.description,
      urlimage:req.body.urlimage
  });
  product_data.save()
  .then((result)=>{
      res.redirect("/gameaccount?title="+req.body.title);
  }
  )
  .catch((err)=>{
      console.log(err);
  })

   });
   app.post('/addaccounttype',urlencodedParser,function(req,res){
    const product_type = new producttype({
        accounttype:req.body.type,
        title:req.body.title,
        description:req.body.description,
        urlimage:req.body.urlimage
    });
    product_type.save()
    .then((result)=>{
        res.redirect("/project?title="+req.body.title);
    }
    )
    .catch((err)=>{
        console.log(err);
    })
  
     });
app.get("/allaccounts",(req, res) => {

   product.find({}).exec(function(err, product) {
            if (err) throw err;

            res.render("userAccountsUploadViews/userAccountstype.ejs", { data: product});
        });
});

app.get('/gameacc', function(req, res) {
  product.find({title:req.query.title}).exec(function(err, product) {
      if (err) throw err;
      if(product!='')
      res.render("userAccountsUploadViews/useraccounts.ejs", { data: product});
     else
     res.render("../view/notfound.ejs");
  });
});
app.get('/remove',function(req, res){
  userData= product.findByIdAndDelete(req.query.id);
  userData.exec(function(err, data){
    if (err) throw err;
    res.redirect("userAccountsUploadViews/gameaccount?title="+req.query.title)
  })
});
//updateaccount
app.get('/updateaccounttype',function(req,res)
{
  res.render("adminUploadAccount/updateAccountype.ejs", {data: req.query})
})
//update account type data
app.post('/updateacctype',urlencodedParser,function(req,res){
    producttype.findByIdAndUpdate(req.query.id,{ accounttype:req.body.acctype, title:req.body.title,
     description:req.body.description,urlimage:req.body.urlimage },
     function (err, docs) {
  if (err){
 console.log(err)
 }
 else{
    res.redirect("/project")
 }});
  });

const DbURl = 'mongodb+srv://waleedahmed:waleed@cluster0.3k3ao.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(DbURl, {
    
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    
    app.listen(3000, () => {
      console.log("Server is running on Port 3000");
    });
  });

  app.use('/',froute);