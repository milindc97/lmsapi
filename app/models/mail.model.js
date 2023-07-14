const mongoose = require("mongoose");

const Mail = new mongoose.Schema({
    type: {
        type: String
    },
    to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    subject: {
        type: String
    },
    message: {
        type: String
    },
    select:{
        type:String
    },
    attachments: [{
        filename:{
            type:String
        },
        size:{
            type:String
        },
        path:{
            type:String
        },
        type:{
            type:String
        }
    }]
});


Mail.set('timestamps', true);


module.exports = mongoose.model("mails", Mail);