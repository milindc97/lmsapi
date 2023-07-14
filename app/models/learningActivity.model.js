const mongoose = require("mongoose");

const LearningActivity = new mongoose.Schema({
  code: {
    type: Number,
    required: [true, 'Code required']
  },
  title: {
    type: String,
    required: [true, 'Title must not be empty']
  },
  keywords: {
    type: String,
    required: [true, 'Keywords must not be empty']
  },
  description: {
    type: String,
    required: [true, 'Description must not be empty']
  },
  isLearningActivity:{
    type:Boolean,
    default:false
  },
  courses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
      },
      index:{
        type:Number,
      },
      module: [
        {
          moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "modules"
          },
          index:{
            type:Number
          },
          unlock:{
            type:Boolean,
            default:false
          },
          questionbank: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "questionBank"
          }
        }
      ],
    }
  ],
  thumbnail: {
    type: String,
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


LearningActivity.set('timestamps', true);


module.exports = mongoose.model("learningActivities", LearningActivity);