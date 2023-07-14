const { authJwt } = require("../middlewares");
const controller = require("../controllers/userRequests.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/userRequests/create",controller.createUserRequests);
  app.get("/api/userRequests/all",controller.getAllUserRequests);
  app.get("/api/userRequests/pending",controller.getPendingUserRequests);
  app.get("/api/userRequests/old",controller.getOldUserRequests);
  app.get("/api/userRequests/count",controller.countByStatus);
  app.get("/api/userRequests/success",controller.getSuccessUserRequests);
  app.get("/api/userRequests/rejected",controller.getRejectedUserRequests);
  app.get("/api/userRequests/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.singleUserRequest);
  app.put("/api/userRequests/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusUserRequests);
  app.delete("/api/userRequests/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteUserRequests);
};