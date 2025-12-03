if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
//console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError =  require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo'); 
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//these lines of code are removed after restructuring the code into review.js and listing.js in routes folder,as now are not used in app.js 
//const {listingSchema,reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");
// const Listing = require("./models/listing.js");
//const wrapAsync = require("./utils/wrapAsync.js");
//two lines of code for listing.js and review.js for restructuring and is IMPORTANT.
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



//const MONGO_URL = 'mongodb://127.0.0.1:27017/VacationVibes'
const dburl = process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dburl);
}
app.set("/view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//creating MongoStore
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
})



const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};
store.on("create", () => {
    console.log("Mongo store created");
    });

store.on("destroy", () => {
    console.log("Mongo store destroyed");
});


// app.get("/",(req,res)=>{
//     res.send("Hi, I am root");
// });
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//app.use(flash()) will be written before the routes are required as it will be used with the help of  routes.and now will define a middleware for flash
app.use((req,res,next)=>{
    console.log("Current user:", req.user?.username || "Not logged in");

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");  //success is like the key that has value as new listing created in listing.js create route
    res.locals.currUser = req.user;
    next();
     //next() will automativcally take the route written in next code so next() is IMP.
 });


//  COMMENTING THE NEXT LINES AS ALSREADY HAVING / ..THEN THESE TWO ROUTES WILL FIRGHT AND NOT REACHES THE LISTINGS
// app.get("/", (req, res) => {
//     res.render("listings/index.ejs"); // or render a view, like res.render('index.ejs')
// });


//TRYING MY OWN CODE FOR SEARCH BAR FUNCTIONALITY actually this code will be shifted and modifies in routes listing.js but want to keep it here but commenting
// app.get("/listings/search",async(req,res)=>{
//     //console.log(req.query);
//     let {country} = req.query; 
//     if(!country){
//       console.log("no country");
//       return res.redirect("/listings");
//     }else{
//       const listings = await Listing.find({country: new RegExp(country,'i')});
//       res.render("listings/search.ejs",{listings,country});
//     }
// })

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     })
//     //this register method will automatically save the password and it will also check if the username is unique or not
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })
//restructure the code of app.js with help of  one more file that is listing.js ....url matching /listings in listings
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//error handling in case any error occur but it will not disturb the functioning just will give message
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

// app.get("/testlistings",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My villa",
//         description:"by garden",
//         price:2000,
//         location:"Ahmedabad",
//         country:"India",
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful");
// })

app.get("/", (req, res) => {
    res.render('home');
});



app.listen(8080,()=>{
    console.log("app is listening on port 8080");
})

