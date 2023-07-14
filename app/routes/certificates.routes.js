const controller = require("../controllers/certificates.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/certificates/create", [authJwt.verifyToken],controller.createCertificateData);
  app.get("/api/certificates/:id", [authJwt.verifyToken],controller.getSingleCertificate);
  app.get("/api/certificates/quizEmp/:id1/:id2", [authJwt.verifyToken],controller.getSingleCertificateByQuizAndEmpId);
  app.get("/api/certificatesEmp/:id",controller.getAllCertificates);
};
