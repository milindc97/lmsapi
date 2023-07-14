const mongoose = require("mongoose");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: {type:String,required:[true,'Name must not be required']}
  })
);

module.exports = Role;