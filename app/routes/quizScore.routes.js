const controller = require("../controllers/quizScore.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/quizScore/create", [authJwt.verifyToken, authJwt.storeAccessData],controller.createQuizScore);
  app.put("/api/quizScore/update/:id",[authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.updateQuizScore);
  app.get("/api/quizScore/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScore);
  app.get("/api/quizScore/module/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScoreByModule);
  app.get("/api/quizScore/quiz/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScoreByQuiz);
  app.get("/api/quizScore/quizEmp/:id1/:id2", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScoreByQuizAndEmp);
  app.get("/api/quizScore/overallScore/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getOverallScore);
  app.get("/api/quizScore/program/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScoreByProgram);
  app.get("/api/quizScore/certified-quiz/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getQuizScoreForCertifiedByQuiz);
  app.get("/api/quizScore/employee/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSingleQuizScoreByEmployee);
  app.get("/api/quizScore/employee/all/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllQuizScoreByEmployee);
  app.get("/api/quizScore", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllQuizScore);
  app.post("/api/quizScoreByScore", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllQuizScoreByScore);
  app.get("/api/weekData/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getWeeklyData);
  app.get("/api/monthAndYearCount", [authJwt.verifyToken, authJwt.storeAccessData],controller.getMonthAndYearWiseCount);
  app.get("/api/topEmp", [authJwt.verifyToken, authJwt.storeAccessData],controller.getTopEmployee);
  app.delete("/api/quizScore/:id", [authJwt.verifyToken, authJwt.isAdmin, authJwt.storeAccessData],controller.deleteQuizScore);
  app.get("/api/top20Emp", [authJwt.verifyToken, authJwt.storeAccessData],controller.getTop20Employee);
  app.put("/api/quizScore/rating/:id",[authJwt.verifyToken, authJwt.storeAccessData],controller.updateRating);
};


