const controller = require("../controllers/programAllocation.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/programAllocation/create/bulk",[authJwt.verifyToken, authJwt.isAdmin],controller.createBulkProgramAllocation);
  app.get("/api/programAllocation/:id",[authJwt.verifyToken],controller.getAssignedProgramById);
  app.get("/api/programAllocation/calender/:id",[authJwt.verifyToken],controller.getAssignedProgramByIdForCalender);
  app.get("/api/programAllocation/calender-emp/:id",[authJwt.verifyToken],controller.getAssignedProgramByIdForCalenderEmp);
  app.get("/api/programAllocation/calender-date/:id/:date1/:date2",[authJwt.verifyToken],controller.getAssignedProgramByIdForCalenderbyDate);
  app.get("/api/todayAssignedProgram/:id",[authJwt.verifyToken],controller.getTodayAssignedProgram);
  app.get("/api/getProgramActivity",[authJwt.verifyToken],controller.getProgramActivity);
  app.get("/api/getProgramCompletionStatusByEmp/:id",[authJwt.verifyToken],controller.getProgramCompletionStatusByEmp);
  app.get("/api/quizCountForProgram/:id",[authJwt.verifyToken],controller.quizCountForProgram);
  app.get("/api/quizCountForCourse/:id",[authJwt.verifyToken],controller.quizCountForCourse);
  app.get("/api/quizCountForModule/:id",[authJwt.verifyToken],controller.quizCountForModule);
  app.get("/api/quizCountForQuiz/:id",[authJwt.verifyToken],controller.quizCountForQuiz);
  app.get("/api/getCourseCompletionStatusByEmp/:id",[authJwt.verifyToken],controller.getCourseCompletionStatusByEmp);
  app.get("/api/getModuleCompletionStatusByEmp/:id",[authJwt.verifyToken],controller.getModuleCompletionStatusByEmp);
  app.get("/api/getQuizCompletionStatusByEmp/:id",[authJwt.verifyToken],controller.getQuizCompletionStatusByEmp);
  app.get("/api/getQuizAllocation",[authJwt.verifyToken],controller.getQuizAllocation);
  app.get("/api/getQuizAllocationByQuiz/:id",[authJwt.verifyToken],controller.getQuizAllocationByQuiz);
  app.get("/api/getProgramAllocation",[authJwt.verifyToken],controller.getProgramAllocation);
  app.get("/api/getModuleAllocation",[authJwt.verifyToken],controller.getModuleAllocation);
  app.get("/api/getCourseAllocation",[authJwt.verifyToken],controller.getCourseAllocation);
  app.get("/api/getCourseAllocationByCourse/:id",[authJwt.verifyToken],controller.getCourseAllocationByCourse);
  app.get("/api/sendNotificationToAssEmp/:id",[authJwt.verifyToken],controller.sendNotificationToAssEmp);
  // app.delete("/api/allocation/:id", [authJwt.verifyToken],controller.deleteAllocation);
};

