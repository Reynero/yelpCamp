const campgroundModel = require("./models/campground");
const reviewModel = require("./models/review");
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){//this is another integrated function of passport
        //basically it makes sure there is data in session (like localstorage)
        req.session.returnTo = req.originalUrl;//req.original gets the complete Url in which you were before
        req.flash("error", "you must be signed in!");
        
        return res.redirect("/login");
    }
    next();
}
//IN THE NEWEST VERSION OF PASSPORT IT CLEARS ALL THE DATA ONCE IT COMPARES THE DATA WHEN YOU ARE LOGGING IN
//THIS IS WHY YOU COULDNT ENTER TO SOME ADDRESS BECAUSE THE DATA WAS BEING ERASED
/**By using the storeReturnTo middleware function, we can save the returnTo value to res.locals 
 * before passport.authenticate() clears the session and deletes req.session.returnTo. */
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


//middleware that verifies that the currentuser is equal to campground's user
//so only the camp's user can edit and delete it  
module.exports.isAuthor = async (req, res, next) =>{
    const {id} = req.params;
    const userFound = await campgroundModel.findById(id);
    //console.log(idFound.author._id + " " + req.user._id);
    if(!userFound.author.equals(req.user._id)){// i dunno why it only works with equals and not ===
        req.flash("error", "you dont have permission to do that!");
        return res.redirect("/campgrounds/"+id);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) =>{
    const {id, reviewId} = req.params;
    const userFound = await reviewModel.findById(reviewId);
    //console.log(idFound.author._id + " " + req.user._id);
    if(!userFound.author.equals(req.user._id)){// i dunno why it only works with equals and not ===
        req.flash("error", "you dont have permission to do that!");
        return res.redirect("/campgrounds/"+id);
    }
    next();
}