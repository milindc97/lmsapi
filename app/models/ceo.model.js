const mongoose = require("mongoose");

const CEO = new mongoose.Schema({
   description:{type:String},
   photo:{type:String},
   youtubeLink:{type:String},
   default:{type:Boolean}
});


CEO.set('timestamps',true);


module.exports = mongoose.model("ceos",CEO);