const controller = require("../controllers/rewardPoints.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

   app.post("/api/rewardPoints/create", controller.create); // Create Reward Points
   app.get("/api/rewardPoints-all", controller.get); // Get All Reward Points
   app.get("/api/rewardPoints-emp/:id", controller.getByEmp); // Get All Reward Points
   app.get("/api/rewardPoints/:id", controller.single); // Get Single Reward Points
   app.get("/api/rewardPoints-total/:id", controller.getTotalByEmp); // Get Total Reward Points
   app.put("/api/rewardPoints/:id", controller.update); // Update Single Reward Points
   app.delete("/api/rewardPoints/:id", controller.delete); // Delete Single Reward Points
};
