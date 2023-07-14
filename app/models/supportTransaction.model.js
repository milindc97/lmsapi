const mongoose = require("mongoose");

const SupportTransaction = new mongoose.Schema({
   message:{type:String},
   supportId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Support"
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status:{type:Number}
});


SupportTransaction.set('timestamps',true);


module.exports = mongoose.model("supporttransactions",SupportTransaction);