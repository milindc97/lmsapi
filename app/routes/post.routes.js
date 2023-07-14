const controller = require("../controllers/post.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/post/create", [authJwt.verifyToken, authJwt.storeAccessData],controller.createPost);
  app.post("/api/postlikes/create",[authJwt.verifyToken,authJwt.storeAccessData],controller.createPostLikes);
  app.get("/api/post/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getSinglePost);
  app.put("/api/post/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusApprove);
  app.put("/api/post/reject/update/:id",[authJwt.verifyToken, authJwt.isAdmin],controller.updateStatusReject);
  app.get("/api/postactive", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllActivePost);
  app.get("/api/postactive-user/:id", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllActivePostByUser);
  app.get("/api/postpending", [authJwt.verifyToken, authJwt.storeAccessData],controller.getAllPendingPost);
  app.delete("/api/post/:id", [authJwt.verifyToken,authJwt.storeAccessData],controller.deletePost);
  app.delete("/api/postlikes/:pId/:eId", [authJwt.verifyToken,authJwt.storeAccessData],controller.deletePostLikes);
};

 