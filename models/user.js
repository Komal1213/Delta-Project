const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
    }
})

userSchema.plugin(passportLocalMongoose);   //here passportLocalMongoose is passed as a parameter as 'schema.plugin is a parameter'
module.exports = mongoose.model("User",userSchema);