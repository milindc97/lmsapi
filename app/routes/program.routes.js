const controller = require("../controllers/program.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/program/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.createProgram);
  app.put("/api/program/update/:id",[authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateProgram);
  app.put("/api/program/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateStatusProgram);
  app.get("/api/program/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleProgram);
  app.get("/api/program/code/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleProgramByCode);
  app.get("/api/program", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllProgram);
  app.get("/api/program-all", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAll);
  app.get("/api/program-active", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllActiveProgram);
  app.get("/api/program-inactive", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllInactiveProgram);
  app.post("/api/program/incremental-code", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.getProgramIncrementalCode);
  app.delete("/api/program/:id", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.deleteProgram);
  app.get("/api/program-learning", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllLearningActivity);
  app.get("/api/program-learning-active", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllActiveLearningActivity);
  app.get("/api/program-learning-inactive", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllInactiveLearningActivity);
};

 