const { authJwt,verifySignUp } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/all",controller.getAllUsers);
  app.get("/api/session-activity",controller.getAllSessionActivityPrintData);
  app.get("/api/department/all",controller.getAllDepartments);
  app.get("/api/profilepic/all",controller.getAllProfilePicUpdation);
  app.get("/api/user/all-pagination/:page",controller.getAllUsersByPagination);
  app.post("/api/user/status",controller.getAllUsersByStatus);
  app.get("/api/user-dept/:department",controller.getAllUsersByDept);
  app.get("/api/user-group/:group",controller.getAllUsersByGroup);
  app.put("/api/user/import-update",[authJwt.verifyToken],controller.updateImportUser);
  app.put("/api/user/update/:id",[authJwt.verifyToken,verifySignUp.checkDuplicateUsernameOrEmail],controller.updateUser);
  app.put("/api/user-update/:id",[authJwt.verifyToken],controller.update);
  app.get("/api/user/logout/:id",[authJwt.verifyToken],controller.insertLogoutTime);
  app.get("/api/user/:id",[authJwt.verifyToken],controller.singleUser);
  app.get("/api/userbirthday",[authJwt.verifyToken],controller.birthdaysonweek);
  app.put("/api/user/change-password/:id",[authJwt.verifyToken],controller.changeUserPassword);
  app.put("/api/user/update/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusUser);
  app.put("/api/user/profileupdate/status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateProfileStatusUser);
  app.put("/api/user/update/active-wall-status/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateActiveWallStatusUser);
  app.get("/api/user/emp/count",[authJwt.verifyToken],controller.getTotalEmployeeCount);
  app.get("/api/user-head-kpi",[authJwt.verifyToken],controller.getUserHeadKpi);
  app.get("/api/user-all-admin",[authJwt.verifyToken],controller.getAdminAllUsers);
  app.post("/api/user/create",[authJwt.verifyToken,verifySignUp.checkDuplicateUsernameOrEmail],controller.createUser);
};

