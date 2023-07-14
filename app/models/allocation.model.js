const mongoose = require("mongoose");

const Allocation = mongoose.model(
  "Allocation",
  new mongoose.Schema({
    allocateBy:{
        type:String
    },
    allocationType:{
        type:String
    },
    programData:{
        programId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "programs"
        },
    },
    courseData:{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "courses"
        },
    },
    moduleData:{
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "modules"
        },
    },
    employeeData: [{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deleted:{
        type:Boolean,
        default:false
    }
  }, {
    timestamps: true
  })
);

module.exports = Allocation;