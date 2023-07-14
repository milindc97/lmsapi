const mongoose = require("mongoose");

const Post = new mongoose.Schema({
   message:{type:String},
   status:{type:Number},
   employeeId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  likes:{type:Array},
  images:{type:Array}
});


Post.set('timestamps',true);


module.exports = mongoose.model("posts",Post);