const controller = require("../controllers/leaderboard.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/leaderboard/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createLeaderboard);
  app.put("/api/leaderboard/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateLeaderboard);
  app.get("/api/leaderboard/:id", [authJwt.verifyToken],controller.getSingleLeaderboard);
  app.get("/api/leaderboard", [authJwt.verifyToken],controller.getAllLeaderboard);
  app.delete("/api/leaderboard/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteLeaderboard);
};
