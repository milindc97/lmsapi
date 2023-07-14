const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
  title:{type: String},
  message:{type: String},
  segment: {type: String},
  segmentId: {type: String},
  image:{type:String},
  createdAt: {type: Date}
});


Notification.set('timestamps',true);


module.exports = mongoose.model("notification",Notification);
