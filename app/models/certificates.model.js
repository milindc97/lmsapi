const mongoose = require("mongoose");

const Certificates = new mongoose.Schema({
  quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "questionBank"
  },
  quizScoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "quizScore"
},
  employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
  },
  certificate:{type:String}
});


Certificates.set('timestamps',true);


module.exports = mongoose.model("certificate",Certificates);