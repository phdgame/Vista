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
  app.post("/add/questionario", controller.adicionarQuestionario);
  app.post("/list/questionario", controller.questionarioporId);
  app.post("/list/partesdoquestionario", controller.partesdoquestionarioporId);
  app.get("/list/tiposderespostas", controller.listTiposdeRespostas);
  app.post("/edit/concluirquestionario", controller.concluirQuestionario);
  app.post("/edit/aprovarquestionario", controller.aprovarQuestionario);
  app.post("/edit/revisarquestionario", controller.revisarQuestionario);
  app.post("/edit/questionario", controller.editarQuestionario);
  app.post("/add/partedoquestionario", controller.adicionarPartedoQuestionario);
  app.post("/edit/partedoquestionario", controller.editarPartedoQuestionario);
  app.post("/delete/partedoquestionario", controller.excluirPartedoQuestionario);
  app.get("/list/questionariosportipos/:ids", controller.listQuestionariosporTipos);
  app.get("/list/respostas", controller.listRespostas);
  app.post("/add/respostaquestionario", controller.addRespostaQuestionario);
};
