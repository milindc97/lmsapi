const mongoose = require("mongoose");

const News = new mongoose.Schema({
   description:{type:String},
   photo:{type:String},
   date:{type:Date},
   type:{
      type:String
   },
   category:{
      type:String,
      required:true
   }
});


News.set('timestamps',true);


module.exports = mongoose.model("news",News);