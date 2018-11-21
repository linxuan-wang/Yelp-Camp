var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Cloud's rest",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0voXAnD5M6X5GzYytopZT-SGopBpefd5srL02FU4iRR0CUxAK",
        description: "blah blah blah"
    },
    
    {
        name: "Cloud's rest",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0voXAnD5M6X5GzYytopZT-SGopBpefd5srL02FU4iRR0CUxAK",
        description: "blah blah blah"
    },
    
    {
        name: "Cloud's rest",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0voXAnD5M6X5GzYytopZT-SGopBpefd5srL02FU4iRR0CUxAK",
        description: "blah blah blah"
    }
    ];

function seedDB(){
    Campground.remove({}, function(err){
    if(err) {
        console.log(err);
    }
    console.log("remove campgrounds!");
    //add a few campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else{
                    console.log("add a campground");
                    //add a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there is internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            }else{
                            campground.comments.push(comment);
                            campground.save();
                            console.log("created new comment");
                            }
                        });
                }
            });
         });
    });

}

module.exports = seedDB;
