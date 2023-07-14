const controller = require("../controllers/mail.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

   app.post("/api/mail/create", controller.create); // Create Mail
   app.get("/api/mail-all", controller.get); // Get All Mail
   app.get("/api/mail-type/:type", controller.getByType); // Get All Mail
   app.get("/api/mail/:id", controller.single); // Get Single Mail
   app.put("/api/mail/:id", controller.update); // Update Single Mail
   app.delete("/api/mail/:id", controller.delete); // Delete Single Mail
};
