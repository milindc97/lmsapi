const mongoose = require("mongoose");

const RedeemRewards = new mongoose.Schema({
   addressLine1:{type:String},
   addressLine2:{type:String},
   pincode:{type:Number},
   city:{type:String},
   state:{type:String},
   country:{type:String},
   items:[{
        itemId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "redeemItems"
        },
        qty:{
            type:Number
        }
   }],
   employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  remark:{type:String},
  status:{
    type:String,
    enum:["Pending","Approve"],
    default:"Pending"
  }
});


RedeemRewards.set('timestamps',true);


module.exports = mongoose.model("redeemRewards",RedeemRewards);