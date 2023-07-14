const mongoose = require("mongoose");

const Policy = new mongoose.Schema({
   icon:{type:String},
   name:{type:String},
   percentage:{type:String}
});


Policy.set('timestamps',true);


module.exports = mongoose.model("policy",Policy);