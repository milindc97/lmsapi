const mongoose = require("mongoose");

const Support = new mongoose.Schema({
   subject:{type:String},
   message:{type:String},
   file:{type:String},
   status:{type:Number},
   employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},
remark:{type:String}
});


Support.set('timestamps',true);


module.exports = mongoose.model("supports",Support);