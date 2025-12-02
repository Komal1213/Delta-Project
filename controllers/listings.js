const Listing = require("../models/listing");

module.exports.index = async(req,res)=>{
    const allListings =await Listing.find({});
    res.render("listings/index",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} =  req.params;
    const listing =   await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
     req.flash("error","Listing you requested for does not exist!");
     return res.redirect("/listings");
    }
    //console.log(listing);
    
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async(req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    //  let {title,description,image,price,country,location}=req.body;
    //or
   //   let listing =  req.body.listing;
   //or
   const newListing = new Listing(req.body.listing);
   //below line for adding lisitng but also giving owner name that is current user's username
   newListing.owner = req.user._id; 
   newListing.image = {url, filename};
    //   console.log(listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} =  req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
     req.flash("error","Listing you requested for does not exist!")
     res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

module.exports.updateListing = async(req,res)=>{
    let {id} =  req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    //this below if code will help to edit with a new file 
    //if req.file has the content that it needs then the if block of code will execute otherwise if we do not send anything to backend then it will match to undefine and the if code will not workout
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");    //deconstruct the body parameters that os the object in javascript and finally updating them.
    return res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} =  req.params;
    let listing =  await Listing.findById(id);
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}

//search bar
module.exports.searchByCountry =async(req,res)=>{
    //console.log(req.query);
    let {country} = req.query; 
    if(!country){
      console.log("no country");
      return res.redirect("/listings");
    }else{
      const listings = await Listing.find({country: new RegExp(country,'i')});
      res.render("listings/search.ejs",{listings,country});
    }
}

