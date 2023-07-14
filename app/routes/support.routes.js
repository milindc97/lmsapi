const { authJwt } = require("../middlewares");
const controller = require("../controllers/support.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/support/create",[authJwt.verifyToken],controller.createSupportRequest);
  app.post("/api/support/mail",[authJwt.verifyToken],controller.sendSupportEmail);
  app.get("/api/support",[authJwt.verifyToken,authJwt.isAdmin],controller.getAllSupportRequest);
  app.get("/api/supportTransaction/:id",[authJwt.verifyToken,authJwt.isAdmin],controller.getAllSupportTransaction);
  app.put("/api/supportTransaction/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateSupportTransactionStatus);
  app.get("/api/support/emp/:id",[authJwt.verifyToken],controller.getAllSupportRequestByEmp);
  app.put("/api/support/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateSupportRequestStatus);
  app.delete("/api/support/delete/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.deleteSupportRequest);

};