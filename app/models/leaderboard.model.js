const mongoose = require("mongoose");

const Leaderboard = new mongoose.Schema({
   name:{type:String},
   message:{type:String},
   designation:{type:String},
   photo:{type:String}
});


Leaderboard.set('timestamps',true);


module.exports = mongoose.model("leaderboard",Leaderboard);