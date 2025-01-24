const User = require("../models/user");

module.exports.renderSignupForm = (req,res) =>{
    res.render("users/signup.ejs");
}

module.exports.signup = async(req,res)=>{
    try{
        let{username, email, password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await  User.register(newUser,password);
        console.log(registeredUser);
        //below is a middleware that doing signup will automatically  
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to VacationVibes!");
            res.redirect("/listings");
        });

    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }

}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async(req,res)=>{
    //here pasport.authenticate is a middleware in case to login the user or if user do not exist in database or exist but enter wrong info. by mistake 
     req.flash("success","Welcome back to VacationVibes!");
     let redirectUrl = res.locals.redirectUrl || "/listings";
     res.redirect(redirectUrl);
}

module.exports.logout = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    })
}