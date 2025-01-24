const express = require("express");
const router = express.Router({mergeParams:true});  //mergeParams: true is option available in router that help to use any parameter(child) present in parent url to use in callbacks
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError =  require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//REVIEWS 
//Review Post Route
router.post("/",isLoggedIn ,validateReview,wrapAsync(reviewController.createReview));

//Review Delete Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;