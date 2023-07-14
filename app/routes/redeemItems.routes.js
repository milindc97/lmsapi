const controller = require("../controllers/redeemItems.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

   app.post("/api/redeemItems/create", controller.create); // Create Redeem Items
   app.get("/api/redeemItems-all", controller.get); // Get All Redeem Items
   app.get("/api/redeemItems/:id", controller.single); // Get Single Redeem Items
   app.put("/api/redeemItems/:id", controller.update); // Update Single Redeem Items
   app.delete("/api/redeemItems/:id", controller.delete); // Delete Single Redeem Items
};
