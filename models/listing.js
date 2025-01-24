const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");   //we need to use Review model so require it

const listingSchema = new Schema({
    title: {
        type:String,
        required:true,
    },
    description: String,
    image: {
      url: String,
      filename: String,

    },
    price : String,
    location: String,
    country: String,
    //adding reviews in listing schema
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref:"Review",
      }
    ],
    owner:{
      type: Schema.Types.ObjectId,
      ref:"User",
    },
});

//when listing is deleted then, the reviews related to it  should also be deleted
listingSchema.post("findOneAndDelete", async(listing)=>{      //here listing means it has the data of that  listing that is to be deleted
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
});
const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;