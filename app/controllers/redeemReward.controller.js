const db = require("../models");
const {
    redeemReward: RedeemRewards,user:User,notificationTrans:NotificationTrans
} = db;
const moment = require('moment-timezone');

exports.create = (req, res) => {
    const redeemReward = new RedeemRewards(req.body);

    redeemReward.save(async (err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }
        let user = await User.findById(data.employeeId);
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: user._id,
          title: "Reward Points redeemtion request submission",
          message: "You have redeemed your reward points. Click to view details.",
          image: user.profilephoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
          NotificationTrans.insertMany(notTrnasAr);
        res.status(200).send({
            status: 'success',
            message: "RedeemRewards created successfully!"
        });
    });
};

exports.get = async (req, res) => {
    let redeemReward = await RedeemRewards.find({}).populate("items.itemId").populate("employeeId").sort({createdAt:1});
    res.status(200).send({
        status: "success",
        message: "All RedeemRewardss retrieved",
        data: redeemReward
    });
}

exports.single = async (req, res) => {
    let redeemReward = await RedeemRewards.findById(req.params.id).populate("items.itemId").populate("employeeId");
    res.status(200).send({
        status: "success",
        message: "Single RedeemRewards retrieved",
        data: redeemReward
    });
}

exports.update = async (req, res) => {
    RedeemRewards.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "RedeemRewards successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    RedeemRewards.findByIdAndDelete(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                error: {
                    status: "error",
                    message: err
                }
            });
            return;
        }

        res.status(200).send({
            status: "success",
            message: "RedeemRewards successfully Deleted",
        });
    });
}
