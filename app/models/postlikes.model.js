const mongoose = require("mongoose");

const Postlikes = new mongoose.Schema({
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
   employeeId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});


Postlikes.set('timestamps',true);


module.exports = mongoose.model("postlikes",Postlikes);