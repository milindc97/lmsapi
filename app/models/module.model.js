const mongoose = require("mongoose");

const Modules = new mongoose.Schema({
  code: {
    type: Number
  },
  title: {
    type: String
  },
  keywords: {
    type: String
  },
  description: {
    type: String
  },
  documents: {
    type: Array
  },
  youtubes: {
    type: Array
  },
  thumbnail: {
    type: String
  },
  onePager: {
    type: String
  },
  onePagers: {
    type: Array
  },
  isLearningActivity: {
    type: Boolean,
    default: false
  },
  questionbank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "questionBank"
  },
  rewardPoints: {
    type: Number
  },
  status: {
    type: Number
  },
  fusionBank: {
    type: Boolean
  },
  expiryDate: {
    type: Date
  },
  moduleWatchTime: {
    type: Number
  }
});


Modules.set('timestamps', true);


module.exports = mongoose.model("modules", Modules);