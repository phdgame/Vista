const { authJwt } = require("../middleware");
const controller = require("../controllers/questionario.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/list/questionarios", controller.listQuestionarios);
  app.get("/list/tiposdequestionarios", controller.listTiposdeQuestionario);
  app.post("/add/questionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.adicionarQuestionario);
  app.post("/list/questionario", controller.questionarioporId);
  app.post("/list/partesdoquestionario", controller.partesdoquestionarioporId);
  app.get("/list/tiposderespostas", controller.listTiposdeRespostas);
  app.post("/edit/concluirquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.concluirQuestionario);
  app.post("/edit/aprovarquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.aprovarQuestionario);
  app.post("/edit/revisarquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.revisarQuestionario);
  app.post("/edit/questionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.editarQuestionario);
  app.post("/add/partedoquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.adicionarPartedoQuestionario);
  app.post("/edit/partedoquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.editarPartedoQuestionario);
  app.post("/delete/partedoquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.excluirPartedoQuestionario);
  app.get("/list/questionariosportipos/:ids", controller.listQuestionariosporTipos);
  app.get("/list/respostas", controller.listRespostas);
  app.post("/add/respostaquestionario", [authJwt.verifyToken, authJwt.isCompradorOrMontadordeFerramentas], controller.addRespostaQuestionario);
};