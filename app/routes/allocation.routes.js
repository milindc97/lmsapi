const controller = require("../controllers/allocation.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/allocation/:id",[authJwt.verifyToken], controller.getSingleAllocation);
  app.get("/api/allocation",[authJwt.verifyToken],controller.getAllAllocation);
  app.get("/api/single-allocation/:id/:type",[authJwt.verifyToken],controller.getAllocation);
  app.put("/api/allocation/:id",[authJwt.verifyToken], controller.update);
  app.delete("/api/allocation/:id", [authJwt.verifyToken],controller.delete);
  app.delete("/api/delete-allocation/:id",[authJwt.verifyToken], controller.deleteSingle);
};
