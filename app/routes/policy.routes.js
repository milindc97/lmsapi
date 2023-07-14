const controller = require("../controllers/policy.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/policy/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.createPolicy);
  app.post("/api/config/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateTopMessageConfig);
  app.post("/api/config-know/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateKnowConfig);
  app.post("/api/chairman-config/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateChairmanMessageConfig);
  app.put("/api/policy/update/:id",[authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updatePolicy);
  app.get("/api/policy/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSinglePolicy);
  app.get("/api/policy/per/:per", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSinglePolicyByPercentage);
  app.get("/api/policy", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllPolicy);
  app.get("/api/config", [authJwt.verifyToken, authJwt.storeAccessData],controller.getTopMessageConfig);
  app.get("/api/config-know", [authJwt.verifyToken, authJwt.storeAccessData],controller.getKnowConfig);
  app.get("/api/chairman-config", [authJwt.verifyToken, authJwt.storeAccessData],controller.getChairmanMessageConfig);
  app.delete("/api/policy/:id", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.deletePolicy);
};

 