const mongoose = require("mongoose");

const LearningActivityWatch = mongoose.model(
  "LearningActivityWatch",
  new mongoose.Schema({
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs"
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  }, {
    timestamps: true
  })
);

module.exports = LearningActivityWatch;