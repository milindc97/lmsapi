const controller = require("../controllers/programsWatch.controller");
const courseController = require("../controllers/coursesWatch.controller");
const moduleController = require("../controllers/modulesWatch.controller");
const questionBankController = require("../controllers/questionBankWatch.controller");
const learningActivityWatchController = require("../controllers/learningActivityWatch.controller");
const learningActivityModuleController = require("../controllers/learningActivityModule.controller");
const learningActivityController = require("../controllers/learningActivity.controller");
const winnersController = require("../controllers/winners.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/programswatch", [authJwt.verifyToken],controller.get);
  app.get("/api/programswatch-single/:id", [authJwt.verifyToken],controller.single);
  app.get("/api/programswatch-single-count/:id",[authJwt.verifyToken],controller.singleCount);
  app.put("/api/programswatch/:id", [authJwt.verifyToken], controller.update);
  app.put("/api/programswatch-program/:id", [authJwt.verifyToken], controller.updateProgramData);
  app.put("/api/programswatch-course/:id/:courseId", [authJwt.verifyToken], controller.updateCourseData);
  app.put("/api/programswatch-c/:id/:courseId", [authJwt.verifyToken], controller.updateCourse);
  app.put("/api/programswatch-module/:id/:courseId/:moduleId", [authJwt.verifyToken], controller.updateModuleData);
  app.get("/api/programswatch-single-module/:id/:courseId",[authJwt.verifyToken],controller.singleForModule);
  app.get("/api/programswatch-single-module-count/:id/:courseId",[authJwt.verifyToken],controller.singleForModuleCount);
  app.get("/api/programswatch-single-module-details/:id/:courseId/:moduleId", [authJwt.verifyToken],controller.singleForModuleDetails);
  app.get("/api/programswatch-emp/:id", [authJwt.verifyToken],controller.getByEmp);
  app.get("/api/programswatch-emp-count/:id", [authJwt.verifyToken],controller.getByEmpCount);
  app.get("/api/programswatch-certified/:id/:quizId",[authJwt.verifyToken],controller.getCertifiedData);
  app.get("/api/programswatch-emp-date/:id/:date1/:date2", [authJwt.verifyToken],controller.getByEmpAndDate);
//   app.get("/api/modulewatches-emp-module/:id1/:id2", [authJwt.verifyToken],controller.getModuleWatchesByEmpAndModule);
  app.post("/api/programswatch/create", [authJwt.verifyToken],controller.saveProgramsWatch);
  app.delete("/api/programswatch/:id", [authJwt.verifyToken],controller.delete);

  app.get("/api/learningactivity", [authJwt.verifyToken],learningActivityController.get);
  app.get("/api/training-of-the-day",learningActivityController.getTrainingOfTheDay);
  app.get("/api/top-100-winners/:id",learningActivityController.top100Winners);
  app.get("/api/state-wise-winners/:id",learningActivityController.stateWiseWinners);
  app.get("/api/score-wise-winners/:id",learningActivityController.scoreWiseWinners);
  app.get("/api/department-wise-winners/:id",learningActivityController.departmentWiseWinners);
  app.get("/api/learningactivity-emp/:id", [authJwt.verifyToken],learningActivityController.getByEmp);
  app.get("/api/learningactivity-emp-count/:id", [authJwt.verifyToken],learningActivityController.getByEmpCount);
  app.get("/api/learningactivity-emp-date/:id/:date1/:date2", [authJwt.verifyToken],learningActivityController.getByEmpAndDate);

  app.get("/api/courseswatch", [authJwt.verifyToken],courseController.get);
  app.get("/api/courseswatch-single/:id", [authJwt.verifyToken],courseController.single);
  app.get("/api/courseswatch-single-count/:id",[authJwt.verifyToken],courseController.singleCount);
  app.get("/api/courseswatch-single-module/:id/:moduleId", [authJwt.verifyToken],courseController.singleForModule);
  app.put("/api/courseswatch/:id", [authJwt.verifyToken], courseController.update);
  app.put("/api/courseswatch-course/:id", [authJwt.verifyToken], courseController.updateCourseData);
  app.put("/api/courseswatch-module/:id/:moduleId", [authJwt.verifyToken], courseController.updateModuleData);
  app.get("/api/courseswatch-emp/:id", [authJwt.verifyToken],courseController.getByEmp);
  app.get("/api/courseswatch-emp-count/:id",[authJwt.verifyToken],courseController.getByEmpCount);
  app.get("/api/courseswatch-certified/:id/:quizId",[authJwt.verifyToken],courseController.getCertifiedData);
  app.get("/api/courseswatch-emp-date/:id/:date1/:date2", [authJwt.verifyToken],courseController.getByEmpAndDate);
  app.post("/api/courseswatch/create", [authJwt.verifyToken],courseController.saveCoursesWatch);
  app.delete("/api/courseswatch/:id", [authJwt.verifyToken],courseController.delete);

  app.get("/api/moduleswatch", [authJwt.verifyToken],moduleController.get);
  app.get("/api/moduleswatch-single/:id/:moduleId", [authJwt.verifyToken],moduleController.single);
  app.put("/api/moduleswatch/:id", [authJwt.verifyToken], moduleController.update);
  app.put("/api/moduleswatch-iswatch/:id", [authJwt.verifyToken], moduleController.updateIsWatch);
  app.post("/api/moduleswatch/create", [authJwt.verifyToken],moduleController.saveModulesWatch);
  app.get("/api/moduleswatch-emp/:id", [authJwt.verifyToken],moduleController.getByEmp);
  app.get("/api/moduleswatch-emp-count/:id",[authJwt.verifyToken],moduleController.getByEmpCount);
  app.get("/api/moduleswatch-certified/:id/:quizId",moduleController.getCertifiedData);
  app.get("/api/moduleswatch-emp-date/:id/:date1/:date2", [authJwt.verifyToken],moduleController.getByEmpAndDate);
  app.delete("/api/moduleswatch/:id", [authJwt.verifyToken],moduleController.delete);

  app.get("/api/questionbankswatch", [authJwt.verifyToken],questionBankController.get);
  app.get("/api/questionbankswatch-emp/:id", [authJwt.verifyToken],questionBankController.getByEmp);
  app.post("/api/questionbankswatch/create", [authJwt.verifyToken],questionBankController.saveQuestionBanksWatch);

  app.get("/api/learningactivitywatch-single/:id", [authJwt.verifyToken],learningActivityWatchController.single);
  app.get("/api/learningactivitywatch-module-details/:programId/:courseId/:moduleId/:empId", [authJwt.verifyToken],learningActivityModuleController.getByProgramCourseModuleEmp);
  app.put("/api/learningactivitywatch/:id", [authJwt.verifyToken], learningActivityWatchController.update);
  app.get("/api/learningactivitywatch-emp/:id", learningActivityWatchController.getByEmp);
  app.get("/api/learningactivitywatch-emp-count/:id", [authJwt.verifyToken],learningActivityWatchController.getByEmpCount);
  app.get("/api/learningactivitywatch-course-count/:id/:empId", [authJwt.verifyToken],learningActivityController.getCourseDoneCount);
  app.get("/api/learningactivitywatch-module-count/:id/:courseId/:empId", [authJwt.verifyToken],learningActivityController.getModuleDoneCount);
  app.get("/api/learningactivitywatch-emp-date/:id/:date1/:date2", [authJwt.verifyToken],learningActivityWatchController.getByEmpAndDate);
//   app.get("/api/modulewatches-emp-module/:id1/:id2", [authJwt.verifyToken],learningActivityWatchController.getModuleWatchesByEmpAndModule);
  app.post("/api/learningactivitywatch/create", [authJwt.verifyToken],learningActivityWatchController.saveLearningActivityWatch);
  app.delete("/api/learningactivitywatch/:id", [authJwt.verifyToken],learningActivityWatchController.delete);

  app.post("/api/learningactivity-module/create", learningActivityModuleController.create);
   app.get("/api/learningactivity-module-all", learningActivityModuleController.get);
   app.get("/api/learningactivity-module/:id", learningActivityModuleController.single);
   app.put("/api/learningactivity-module/:id", learningActivityModuleController.update);
   app.delete("/api/learningactivity-module/:id", learningActivityModuleController.delete);

   app.get("/api/top-winners",winnersController.getWinners);
   app.get("/api/all-winners",winnersController.getAllWinners);
   app.get("/api/all-winners-quiz/:programId/:quizId",winnersController.getAllWinnersByProgramAndQuiz);

};

