const mongoose = require("mongoose");

const RewardPoints = new mongoose.Schema({
  title:{type: String},
  points:{type: Number},
  type: {type: String},
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
});


RewardPoints.set('timestamps',true);


module.exports = mongoose.model("rewardPoints",RewardPoints);
