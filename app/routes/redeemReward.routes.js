const controller = require("../controllers/redeemReward.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

   app.post("/api/redeemReward/create", controller.create); // Create Redeem Reward
   app.get("/api/redeemReward-all", controller.get); // Get All Redeem Reward
   app.get("/api/redeemReward/:id", controller.single); // Get Single Redeem Reward
   app.put("/api/redeemReward/:id", controller.update); // Update Single Redeem Reward
   app.delete("/api/redeemReward/:id", controller.delete); // Delete Single Redeem Reward
};
