const mongoose = require("mongoose");

const programAllocationSchema = new mongoose.Schema({
  uniqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program"
  },
  employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
  },
  type:{type:String},
  createdAt:{type:Date}
});


programAllocationSchema.set('timestamps',true);


module.exports = mongoose.model("programAllocation",programAllocationSchema);