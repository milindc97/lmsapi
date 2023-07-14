const db = require("../models");
const {
    redeemItems: RedeemItems
} = db;

exports.create = (req, res) => {
    const redeemItems = new RedeemItems(req.body);

    redeemItems.save((err, data) => {
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
            status: 'success',
            message: "RedeemItems created successfully!"
        });
    });
};

exports.get = async (req, res) => {
    let redeemItems = await RedeemItems.find({}).sort({createdAt:1});
    res.status(200).send({
        status: "success",
        message: "All RedeemItemss retrieved",
        data: redeemItems
    });
}

exports.single = async (req, res) => {
    let redeemItems = await RedeemItems.findById(req.params.id);
    res.status(200).send({
        status: "success",
        message: "Single RedeemItems retrieved",
        data: redeemItems
    });
}

exports.update = async (req, res) => {
    RedeemItems.findByIdAndUpdate(req.params.id,{$set:req.body}, (err, data) => {
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
            message: "RedeemItems successfully Updated",
        });
    });
}

exports.delete = async (req, res) => {
    RedeemItems.findByIdAndDelete(req.params.id, (err, data) => {
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
            message: "RedeemItems successfully Deleted",
        });
    });
}
