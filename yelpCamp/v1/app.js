var app = require("express")();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var methodOverride = require("method-override");
// var User = require("./models/user")
seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");


//Schema Setup


// Campground.create(
//     {
//     name: "Boca", 
//     image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144291f1c371a2e4bc_340.jpg",
//     description: "Golden beach"
//     }, function(err, campground){
//         if(err){
//             console.log(err);
//         }else{
//             console.log("NEWLY CREATED CAMPGROUND");
//             console.log(campground);
//         }
//     });

// var campground = [
//         {name: "Big Bend", image: "https://pixabay.com/get/e837b1072af4003ed1584d05fb1d4e97e07ee3d21cac104496f4c17aa7eeb1bc_340.jpg"},
//         {name: "White Sand", image: "https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104496f4c17aa7eeb1bc_340.jpg"},
//         {name: "Bat Cave", image: "https://pixabay.com/get/e83db40e28fd033ed1584d05fb1d4e97e07ee3d21cac104496f4c17aa7eeb1bc_340.jpg"},
//         ]


//passport config

app.use(require("express-session")({
    secret: "Rusty is the best",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

//---------Route-------------

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campground", function(req, res){
        Campground.find({}, function(err, allCampground){
            if(err){
                console.log(err);
            }else{
                res.render("campgrounds/campground", {campground: allCampground, currentUser: req.user});
            }
        });
});

app.post("/campground", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampGround = {name: name, image: image, description: description, author: author}
    Campground.create(newCampGround, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campground");
        }
    });
});

app.get("/campground/new", function(req, res){
    res.render("campgrounds/new");
});

app.get("/campground/:id", function(req, res){
    //find the campground with provided ID
    var theAuthor = req.user;
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, author: theAuthor});
        }
    });
});

//update campground route
app.get("/campground/:id/edit", function(req, res){
    //is the user loged in 
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, findCampground){
        if(err){
            res.redirect("/campground");
        }else{
            res.render("campgrounds/edit", {campground: findCampground});
        }
    });
    }else{
        res.send("You should login first");
    }
});

app.put("/campground/:id", function(req, res){
    //update
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campground");
        }else{
            res.redirect("/campground/" + req.params.id);
        }
    });
})
//destroy campground route

app.delete("/campground/:id", function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campground");
        }else{
            res.redirect("/campground");
        }
    });
});
//===================
//COMMENTS ROUTES
//===================


app.get("/campground/:id/comments/new", isLogedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground}); 
        }
    });
});

app.post("/campground/:id/comments", isLogedIn, function(req, res){
    //Look up campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("/campground")
        }else{
            Comment.create(req.body.comments, function(err, comment){
                if(err){
                    console.log(err);
                }else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campground/' + campground._id);
                }
            });
        }
    });
    //create new comments
    //connect comments to campground
    //redirect to show page
});

//----------Authenticate route---------------

//sign up
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    req.body.username;
    req.body.password;
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
       if(err){
           console.log(err);
           return res.render("register");
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campground");
       });
    });
});

//login
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/campground",
    failureRedirect: "/login"
}), function(req, res){
});

//logout
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campground");
});

function isLogedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//////////////////////////////


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is running!!!");
});