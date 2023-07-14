const mongoose = require("mongoose");

const Group = new mongoose.Schema({
   code: {type: Number},
   name:{type:String}
});


Group.set('timestamps',true);


module.exports = mongoose.model("group",Group);