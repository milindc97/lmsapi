const controller = require("../controllers/module.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/module/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createModule);
  app.put("/api/module/update-module/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateModule);
  app.get("/api/module/:id", [authJwt.verifyToken],controller.getSingleModule);
  app.get("/api/module", [authJwt.verifyToken],controller.getAllModule);
  app.get("/api/module-all", [authJwt.verifyToken],controller.getAll);
  app.get("/api/modulewatches", [authJwt.verifyToken],controller.getModuleWatches);
  app.get("/api/modulewatches/:id", [authJwt.verifyToken],controller.getModuleWatchesByEmp);
  app.get("/api/modulewatches-emp-module/:id1/:id2", [authJwt.verifyToken],controller.getModuleWatchesByEmpAndModule);
  app.get("/api/module-active", [authJwt.verifyToken],controller.getAllActiveModule);
  app.get("/api/module-inactive", [authJwt.verifyToken],controller.getAllInctiveModule);
  app.post("/api/module/incremental-code", [authJwt.verifyToken, authJwt.isAdmin],controller.getModuleIncrementalCode);
  app.delete("/api/module/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteModule);
  app.put("/api/module/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusModule);
  app.get("/api/module-learning", [authJwt.verifyToken],controller.getAllModuleLearningActivity);
  app.get("/api/module-learning-active", [authJwt.verifyToken],controller.getAllActiveModuleLearningActivity);
  app.get("/api/module-learning-inactive", [authJwt.verifyToken],controller.getAllInctiveModuleLearningActivity);
  // app.post("/api/modulesWatch/create", [authJwt.verifyToken],controller.saveModulesWatch);
};
