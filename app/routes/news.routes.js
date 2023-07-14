const controller = require("../controllers/news.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/news/create", [authJwt.verifyToken, authJwt.isAdmin],controller.createNews);
  app.put("/api/news/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateNews);
  app.get("/api/news/:id", [authJwt.verifyToken],controller.getSingleNews);
  app.get("/api/news-type/:type", [authJwt.verifyToken],controller.getNewsByType);
  app.get("/api/news-category/:category", [authJwt.verifyToken],controller.getNewsByCategory);
  app.get("/api/news", [authJwt.verifyToken],controller.getAllNews);
  app.get("/api/news-count-type", [authJwt.verifyToken],controller.getNewsCountByType);
  app.delete("/api/news/:id", [authJwt.verifyToken, authJwt.isAdmin],controller.deleteNews);
};
