const mongoose = require("mongoose");

const RedeemItems = new mongoose.Schema({
   photo:{type:String},
   name:{type:String},
   points:{type:Number},
   status:{type:Number},
});


RedeemItems.set('timestamps',true);


module.exports = mongoose.model("redeemItems",RedeemItems);