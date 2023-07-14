const { authJwt } = require("../middlewares");
const controller = require("../controllers/question.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/question/create/single",[authJwt.verifyToken, authJwt.isAdmin],controller.createSingleQuestion);
  app.post("/api/question/create/bulk",[authJwt.verifyToken, authJwt.isAdmin],controller.createBulkQuestion);
  app.get("/api/singleQuestion/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.getSingleQuestion);
  app.get("/api/question/:id",[authJwt.verifyToken],controller.getAllQuestion);
  app.put("/api/question/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateQuestion);
  app.delete("/api/question/delete/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.deleteQuestion);

};