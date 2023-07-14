const mongoose = require("mongoose");

const NotificationTrans = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title:{type: String},
  message:{type: String},
  image:{type:String},
  createdAt: {type: Date},
  status:{type:String}

});


NotificationTrans.set('timestamps',true);


module.exports = mongoose.model("notificationTrans",NotificationTrans);
