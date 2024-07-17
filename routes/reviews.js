const express = require("express");
const ErrorClass = require("../errorHandlers/ErrorClass");
const router = express.Router();//here {mergeParams: true} see explanation below
const reviewsModel = require("../models/review");
const { validateReview } = require("../valdationMiddlewares/index");
const campgroundModel = require("../models/campground");
const {isLoggedIn, isReviewAuthor} = require("../middleware");

//in case you would've wanted to leave this like "/" and set the prefix in main.js file as /campgrounds/:id/reviews
//you must add the option {mergeParams: true} in the router require
//because here you are calling req.params.id and if you take it out express wouldnt be abe to find it as it is
router.post("/campgrounds/:id/reviews", isLoggedIn, validateReview, async (req, res, next)=>{
    try{
        const found = await campgroundModel.findById(req.params.id);
        const newReview = new reviewsModel(req.body.review);//review[]
        newReview.author = req.user;//here we are assigning the logged in user to the review
        found.review.push(newReview);
        await newReview.save();
        await found.save();
        req.flash("success", "Successfully created a review!");//flash messages appear just once 
        res.redirect("/campgrounds/"+found._id);

    }catch(err){
        next(err);
    }
});

router.delete("/campgrounds/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, async (req, res)=>{
    try{
        //so what pull does is that it actually 'pulls' out the element which has the id inserted from the array
        //thats how you take out the review reference from campground
        // and then you just erase the whole review
        await campgroundModel.findByIdAndUpdate(req.params.id, {$pull:{review: req.params.reviewId}});
        await reviewsModel.findByIdAndDelete(req.params.reviewId);
        req.flash("success", "Successfully deleted a review!");//flash messages appear just once 
        res.redirect("/campgrounds/"+ req.params.id);
    }catch(err){
        next(err);
    }
});

module.exports = router;