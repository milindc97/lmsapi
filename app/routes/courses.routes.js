const controller = require("../controllers/courses.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/courses/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createCourse);
  app.put("/api/courses/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateCourse);
  app.put("/api/courses/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusCourse);
  app.get("/api/courses/:id", [authJwt.verifyToken],controller.getSingleCourse);
  app.get("/api/courses", [authJwt.verifyToken],controller.getAllCourse);
  app.get("/api/courses-all", [authJwt.verifyToken],controller.getAll);
  app.get("/api/courses-active", [authJwt.verifyToken],controller.getAllActiveCourse);
  app.get("/api/courses-inactive", [authJwt.verifyToken],controller.getAllInactiveCourse);
  app.post("/api/courses/incremental-code", [authJwt.verifyToken, authJwt.isAdmin],controller.getCourseIncrementalCode);
  app.delete("/api/courses/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteCourse);
  app.get("/api/courses-learning", [authJwt.verifyToken],controller.getAllCourseLearningActivity);
  app.get("/api/courses-learning-active", [authJwt.verifyToken],controller.getAllActiveCourseLearningActivity);
  app.get("/api/courses-learning-inactive", [authJwt.verifyToken],controller.getAllInactiveCourseLearningActivity);
};
