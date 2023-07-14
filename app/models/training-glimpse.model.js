const mongoose = require("mongoose");

const TrainingGlimpse = new mongoose.Schema({
  image:{type:String}
});


TrainingGlimpse.set('timestamps',true);


module.exports = mongoose.model("trainingGlimpses",TrainingGlimpse);
