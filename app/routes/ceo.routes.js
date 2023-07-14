const controller = require("../controllers/ceo.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/ceo/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createCEO);
  app.put("/api/ceo/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateCEO);
  app.get("/api/ceo/:id", [authJwt.verifyToken],controller.getSingleCEO);
  app.get("/api/ceo", [authJwt.verifyToken],controller.getAllCEO);
  app.delete("/api/ceo/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteCEO);
};
