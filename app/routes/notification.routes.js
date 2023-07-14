const controller = require("../controllers/notification.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/notification/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createNotification);
  app.put("/api/notification/update", [authJwt.verifyToken],controller.updateNotification);
  app.post("/api/notification-admin/create",controller.createNotificationForAdmin);
  app.get("/api/user/notification/:id", [authJwt.verifyToken],controller.notificationByUserId);
  app.get("/api/user/notification/clear/:id", [authJwt.verifyToken],controller.clearNotificationByUserId);
  app.delete("/api/user/notification/:id", [authJwt.verifyToken],controller.clearNotification);
  app.get("/api/notification", [authJwt.verifyToken],controller.getAllNotification);
  app.get("/api/notification/user/:id", [authJwt.verifyToken],controller.getAllNotificationByUser);
};


