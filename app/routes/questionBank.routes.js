const controller = require("../controllers/questionBank.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/question-bank/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createQuestionBank);
  app.put("/api/question-bank/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateQuestionBank);
  app.get("/api/question-bank/:id", [authJwt.verifyToken],controller.getSingleQuestionBank);
  app.get("/api/question-bank", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllQuestionBank);
  app.get("/api/question-bank-all", [authJwt.verifyToken, authJwt.isAdmin],controller.getAll);
  app.get("/api/question-bank-active", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllActiveQuestionBank);
  app.get("/api/question-bank-inactive", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllInactiveQuestionBank);
  app.post("/api/question-bank/incremental-code", [authJwt.verifyToken, authJwt.isAdmin],controller.getQuestionBankIncrementalCode);
  app.delete("/api/question-bank/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteQuestionBank);
  app.put("/api/question-bank/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusQuestionBank);
  app.get("/api/question-bank-learning", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllQuestionBankLearningActivity);
  app.get("/api/question-bank-learning-active", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllActiveQuestionBankLearningActivity);
  app.get("/api/recent-open-quiz/:count", controller.getRecentlyOpenedQuiz);
  app.get("/api/question-bank-learning-inactive", [authJwt.verifyToken, authJwt.isAdmin],controller.getAllInactiveQuestionBankLearningActivity);
  
};
