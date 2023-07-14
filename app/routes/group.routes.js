const controller = require("../controllers/group.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/group/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createGroup);
  app.put("/api/group/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateGroup);
  app.get("/api/group/:id", [authJwt.verifyToken],controller.getSingleGroup);
  app.get("/api/group", [authJwt.verifyToken],controller.getAllGroup);
  app.get("/api/group-empcount", [authJwt.verifyToken],controller.getAllGroupByEmpCount);
  app.post("/api/group/incremental-code", [authJwt.verifyToken],controller.getGroupIncrementalCode);
  app.delete("/api/group/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteGroup);
};
