var mongoose = require("mongoose");
var PassportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    Username: String,
    Passwaord: String
});

userSchema.plugin(PassportLocalMongoose);
module.exports = mongoose.model("user", userSchema);