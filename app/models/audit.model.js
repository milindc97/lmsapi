const mongoose = require("mongoose");

const audit = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  url:{type: String},
  ip:{type:String},
  token:{type:String}
});


audit.set('timestamps',true);


module.exports = mongoose.model("audits",audit);