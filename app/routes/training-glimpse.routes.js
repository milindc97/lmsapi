const controller = require("../controllers/training-glimpse.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

   app.post("/api/training-glimpse/create", controller.create); // Create Mail
   app.get("/api/training-glimpse-all", controller.get); // Get All Mail
   app.get("/api/training-glimpse/:id", controller.single); // Get Single Mail
   app.put("/api/training-glimpse/:id", controller.update); // Update Single Mail
   app.delete("/api/training-glimpse/:id", controller.delete); // Delete Single Mail
};
