const mongoose = require("mongoose");

const Courses = new mongoose.Schema({
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
  isLearningActivity: {
    type: Boolean,
    default: false
  },
  modules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "modules"
    },
    index: {
      type: Number
    },
    unlock: {
      type: Boolean,
      default: false
    },
  }],
  thumbnail: {
    type: String
  },
  status: {
    type: Number
  },
  fusionBank: {
    type: Boolean
  },
  expiryDate: {
    type: Date
  }
});


Courses.set('timestamps', true);


module.exports = mongoose.model("courses", Courses);