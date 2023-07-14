const mongoose = require("mongoose");

const Config = new mongoose.Schema({
   message:{type:String},
   photo:{type:String},
   name:{type:String}
});


Config.set('timestamps',true);


module.exports = mongoose.model("config",Config);