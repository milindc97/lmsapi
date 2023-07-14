const mongoose = require("mongoose");

const Appversion = new mongoose.Schema({
    version: {
        type: String
    },
    isLatest: {
        type: Boolean,
        default: false
    }
});


Appversion.set('timestamps', true);


module.exports = mongoose.model("Appversions", Appversion);