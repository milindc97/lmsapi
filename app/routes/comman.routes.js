const controller = require("../controllers/comman.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/upload", [authJwt.verifyToken],controller.uploadFile);
  app.post("/api/upload-doc", [authJwt.verifyToken],controller.uploadDoc);
  // app.get("/api/retrieve/:file/:token", [authJwt.verifyToken],controller.retrieveFile);
  app.get("/api/retrieve/certificate/:file",controller.retrieveCertificateFile);
  app.get("/api/download-image/:file",controller.downloadImageFile);
  app.get("/api/download/:file",controller.downloadCSVFile);
  app.get("/api/employee-sync",controller.employeeSync);
  app.get("/api/overall-snapshot", [authJwt.verifyToken, authJwt.isAdmin],controller.overallSnapshot);
  app.get("/api/overall-snapshot-learning", [authJwt.verifyToken, authJwt.isAdmin],controller.overallSnapshotLearning);
  app.get("/api/api-log-report", [authJwt.verifyToken, authJwt.isAdmin],controller.apiLogReport);
  app.post("/api/search-program-employee",controller.searchProgramForEmployee);
  app.post("/api/search-learning-activity-employee",controller.searchLearningActivityProgramForEmployee);
  app.post("/api/search-course-employee",controller.searchCourseForEmployee);
  app.post("/api/search-module-employee",controller.searchModuleForEmployee);
  app.post("/api/search-quiz-employee",controller.searchQuizForEmployee);
  app.post("/api/create-certificate",controller.createCertificate);
  app.get("/api/emp-dashboard",controller.getEmpDashboardData);

  app.get("/api/appversion",controller.getAllAppversion);
};
 

