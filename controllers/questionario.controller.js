const db = require("../models");
const Questionario = db.questionario;
const TipodeQuestionario = db.tipodequestionario;
const PartedoQuestionario = db.partedoquestionario;
const TipodePartedoQuestionario = db.tipodepartedoquestionario
const Usuarios = db.user
const Resposta = db.resposta

const Sequelize = require('sequelize');
const Op = Sequelize.Op
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/database.sqlite'
})

function verificarAutorizacaoParaEditarQuestionario(id, req, res) {
    try {
        return new Promise(async function(resolve, reject) {
            await Questionario.findOne({where: {id: id}}, {attributes: ['id', 'criadorId']})
            .then(async r => {
                if (r.aprovadorId != null){
                    res.status(403)
                    res.send({ status: 'error', message: "Questionário já está concluído e aprovado e não pode ser editado"});
                }
                else if (r.criadorId != null && r.colocadoemrevisaoId == null){
                    res.status(403)
                    res.send({ status: 'error', message: "Questionário está concluido, coloque em revisão para poder alterar"});
                }
                else {
                    resolve(true)
                    reject(false)
                }
            })
        });
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.listQuestionarios = async (req, res) => {
    try {
        const dataatual = new Date()
        let setediasatras = new Date()
        setediasatras.setDate(setediasatras.getDate() - 15)
        setediasatras.setHours(0,0,0,0)
        let diatual = dataatual.getDay()
        let ultimasemana = []
        var dataultimasemana = new Date()
        var data = dataultimasemana
        for (i = 0; i<= 14; i++) {
            ultimasemana.unshift({dia: diatual, data: new Date(data)})
            diatual--
            var data = dataultimasemana.setDate(dataultimasemana.getDate() - 1)
            if (diatual == -1)
                diatual = 6
        }
        const questionarioArray = []
        await Questionario.findAll({
            include: [{
                model: TipodeQuestionario,
                attributes: ["descricao"],
                required: true,
                as: "tipo"
            },
            {
                model: Usuarios,
                as: "criador",
                required: false,
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "aprovador",
                required: false,
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "colocadoemrevisao",
                required: false,
                attributes: ["username"]
            },
            {
                model: Resposta,
                as: "respostas",
                required: false,
                attributes: ["createdAt"],
                where: {createdAt: {[Op.between]: [setediasatras, dataatual]}},
                order: [['createdAt', 'DESC']],
            }],
            order: [['createdAt', 'DESC']]
      }).then(result => {
            result.forEach((f) => {
                const questionario = {};
                questionario.id = f.dataValues.id;
                questionario.nome = f.dataValues.nome;
                questionario.tipo = f.dataValues.tipo;
                questionario.updatedAt = f.updatedAt
                questionario.status = 0;
                questionario.statustexto = "Em digitação"
                diasdasemana = {}
                for (i=0; i<=6; i++)
                    diasdasemana[i] = false   
                if (f.diasdasemana != null && f.diasdasemana != "")
                    diasdasemana = JSON.parse(f.diasdasemana)
                //console.log("----------------------------------------------------------------------")
                questionario.diasdasemana = []
                totalchecktrue = 0
                totalchecktruecomresposta = 0
                ultimasemana.forEach (dia => {
                    oknok = "nok"
                    f.dataValues.respostas.forEach(resposta => {
                        if (dia.data.toDateString() == resposta.createdAt.toDateString())
                            oknok = "ok"
                    })
                    if (diasdasemana[dia.dia])
                        totalchecktrue++
                    if (diasdasemana[dia.dia] && oknok == "ok")
                        totalchecktruecomresposta++
                    questionario.diasdasemana.push({"dia": dia.dia, "check": diasdasemana[dia.dia], "oknok": oknok})
                })
                //console.log(questionario.diasdasemana)
                //console.log(totalchecktrue)
                //console.log(totalchecktruecomresposta)
                //console.log((totalchecktruecomresposta/totalchecktrue)*100)
                questionario.percentualderegistro = Math.round((totalchecktruecomresposta/totalchecktrue)*100)
                //console.log("----------------------------------------------------------------------")
                if (f.dataValues.criador != null) {
                    questionario.status = 1;
                    questionario.statustexto = "Concluído"
                }
                if (f.dataValues.aprovador != null) {
                    questionario.status = 2;
                    questionario.statustexto = "Aprovado"
                }
                if (f.dataValues.colocadoemrevisao != null) {
                    questionario.status = 3;
                    questionario.statustexto = "Em revisão"
                }
                questionarioArray.push(questionario);
            });
            res.status(200).send( questionarioArray );
        });
      } catch (err) {
        console.log(err)
        res.status(500)
        res.send({ status: 'error', message: err.message});
      }
};

exports.listTiposdeQuestionario = async (req, res) => {
    try {
      var id = req.params.id;
      const tiposdequestionario = await TipodeQuestionario.findAll({attributes: ["id", "descricao"]});
      res.status(200).json( tiposdequestionario );
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.adicionarQuestionario = async (req, res) => {
    console.log(req.body)
    try {
      await Questionario.create(req.body).then(function (result) {
        res.status(200).json( result );
      });
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

var questionarioporId = exports.questionarioporId = async (req, res) => {
    try {
        await Questionario.findOne({
            where: {id: req.body['id']},
            include: [{
                model: TipodeQuestionario,
                attributes: ["id", "descricao"],
                required: true,
                as: "tipo"
            },
            {
                model: Usuarios,
                as: "criador",
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "aprovador",
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "colocadoemrevisao",
                attributes: ["username"]
            }]
      }).then(f => {
            const questionario = {};
            questionario.id = f.id;
            questionario.nome = f.nome;
            questionario.tipo = f.tipo;
            questionario.criador = f.criador
            questionario.aprovador = f.aprovador
            questionario.colocadoemrevisao = f.colocadoemrevisao
            questionario.diasdasemana = JSON.parse(f.diasdasemana)
            questionario.updatedAt = f.updatedAt
            questionario.status = 0;
            questionario.statustexto = "Em digitação"
            if (f.criador != null) {
                questionario.status = 1;
                questionario.statustexto = "Concluído"
            }
            if (f.aprovador != null) {
                questionario.status = 2;
                questionario.statustexto = "Aprovado"
            }
            if (f.colocadoemrevisao != null) {
                questionario.status = 3;
                questionario.statustexto = "Em revisão"
            }
            res.status(200).send( questionario );
        });
      } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
      }
};

var partesdoquestionarioporId = exports.partesdoquestionarioporId = async (req, res) => {
    try {
        PartedoQuestionario.findAll({
            where: {questionarioId: req.body['id']},
            include: [{
                model: TipodePartedoQuestionario,
                as: "tipo"
            }]
        })
        .then(result => {
            res.status(200).json( result );
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
};

exports.listTiposdeRespostas = async (req, res) => {
    try {
      const tiposderespostas = await TipodePartedoQuestionario.findAll({attributes: ["id", "nome"], 
      });
      res.status(200).send( tiposderespostas );
    } catch (err) {
      res.status(500)
        res.send({ status: 'error', message: err.message});
    }
};

exports.concluirQuestionario = async (req, res) => {
    try {
        await Questionario.findOne({where: {id: req.body['id']}}, {attributes: ['id', 'criadorId']})
        .then(async r => {
            if (r.aprovadorId != null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário já está aprovado e não pode ser alterado"});
            }
            
            else if (r.criadorId != null && r.colocadoemrevisaoId == null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário já foi concluído"});
            }
            else {
                await Questionario.update(
                    {criadorId: req.userId, colocadoemrevisaoId: null},
                    {where: {id: req.body['id']}}
                )
                .then(async function () {
                    await questionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.aprovarQuestionario = async (req, res) => {
    try {
        await Questionario.findOne({where: {id: req.body['id']}}, {attributes: ['id', 'criadorId']})
        .then(async r => {
            if (r.criadorId == null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário não foi concluído"});
            }
            else if (r.colocadoemrevisaoId != null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário está em revisão"});
            }
            else if (r.aprovadorId != null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário já está aprovado"});
            }
            else if (r.criadorId == req.userId){
                res.status(403)
                res.send({ status: 'error', message: "A mesma pessoa não pode concluir a aprovar o mesmo Questionário"});
            }
            else {
                await Questionario.update(
                    {aprovadorId: req.userId},
                    {where: {id: req.body['id']}}
                )
                .then(async function () {
                    await questionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.revisarQuestionario = async (req, res) => {
    try {
        await Questionario.findOne({where: {id: req.body['id']}}, {attributes: ['id', 'criadorId']})
        .then(async r => {
            if (r.criadorId == null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário não foi concluído"});
            }
            else if (r.colocadoemrevisaoId != null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário já está em revisão"});
            }
            else if (r.aprovadorId != null){
                res.status(403)
                res.send({ status: 'error', message: "Questionário já está aprovado e não pode ser alterado"});
            }
            else {
                await Questionario.update(
                    {colocadoemrevisaoId: req.userId},
                    {where: {id: req.body['id']}}
                )
                .then(async function () {
                    await questionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.editarQuestionario = async (req, res) => {
    try {
        await verificarAutorizacaoParaEditarQuestionario(req.body['id'], req, res)
        .then(async function(r) {
            if (r == true) {
                await Questionario.update({
                    nome: req.body['nome'],
                    tipoId: req.body['tipoId'].id,
                    diasdasemana: req.body['diasdasemana']
                },
                    {where: {id: req.body['id']}}
                )
                .then(async function () {
                    await questionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.adicionarPartedoQuestionario = async (req, res) => {
    try {
        await verificarAutorizacaoParaEditarQuestionario(req.body['id'], req, res)
        .then(async function(r) {
            if (r == true) {
                await PartedoQuestionario.create({
                    nome: req.body['nome'],
                    questionarioId: req.body['id'],
                    tipoId: req.body['tipo'].id

                })
                .then(async function() {
                    await partesdoquestionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.editarPartedoQuestionario = async (req, res) => {
    try {
        await verificarAutorizacaoParaEditarQuestionario(req.body['id'], req, res)
        .then(async function(r) {
            if (r == true) {
                await PartedoQuestionario.update({
                    nome: req.body['nome'],
                    tipoId: req.body['tipo'].id
                }, {
                    where: {id: req.body['idPartedoQuestionario']}
                })
                .then(async function () {
                    await partesdoquestionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.excluirPartedoQuestionario = async (req, res) => {
    try {
        await verificarAutorizacaoParaEditarQuestionario(req.body['id'], req, res)
        .then(async function(r) {
            if (r == true) {
                await PartedoQuestionario.findOne({
                    where: {id: req.body['idPartedoQuestionario']}
                })
                .then(res => {
                    res.destroy()
                })
                .then(async function () {
                    await partesdoquestionarioporId(req, res)
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.listQuestionariosporTipos = async (req, res) => {
    try {
        const dataatual = new Date()
        let setediasatras = new Date()
        setediasatras.setDate(setediasatras.getDate() - 15)
        setediasatras.setHours(0,0,0,0)
        let diatual = dataatual.getDay()
        let ultimasemana = []
        var dataultimasemana = new Date()
        var data = dataultimasemana
        for (i = 0; i<= 14; i++) {
            ultimasemana.unshift({dia: diatual, data: new Date(data)})
            diatual--
            var data = dataultimasemana.setDate(dataultimasemana.getDate() - 1)
            if (diatual == -1)
                diatual = 6
        }
        const questionarioArray = []
        await Questionario.findAll({
            include: [{
                model: TipodeQuestionario,
                where: {id: req.params.ids.split(",")},
                attributes: ["descricao"],
                required: true,
                as: "tipo"
            },
            {
                model: Usuarios,
                as: "criador",
                required: false,
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "aprovador",
                required: false,
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "colocadoemrevisao",
                required: false,
                attributes: ["username"]
            },
            {
                model: Resposta,
                as: "respostas",
                required: false,
                attributes: ["createdAt"],
                where: {createdAt: {[Op.between]: [setediasatras, dataatual]}},
                order: [['createdAt', 'DESC']],
            }],
            order: [['createdAt', 'DESC']]
      }).then(result => {
            result.forEach((f) => {
                const questionario = {};
                questionario.id = f.dataValues.id;
                questionario.nome = f.dataValues.nome;
                questionario.tipo = f.dataValues.tipo;
                questionario.updatedAt = f.updatedAt
                questionario.status = 0;
                questionario.statustexto = "Em digitação"
                diasdasemana = {}
                for (i=0; i<=6; i++)
                    diasdasemana[i] = false   
                if (f.diasdasemana != null && f.diasdasemana != "")
                    diasdasemana = JSON.parse(f.diasdasemana)
                //console.log("----------------------------------------------------------------------")
                questionario.diasdasemana = []
                totalchecktrue = 0
                totalchecktruecomresposta = 0
                ultimasemana.forEach (dia => {
                    oknok = "nok"
                    f.dataValues.respostas.forEach(resposta => {
                        if (dia.data.toDateString() == resposta.createdAt.toDateString())
                            oknok = "ok"
                    })
                    if (diasdasemana[dia.dia])
                        totalchecktrue++
                    if (diasdasemana[dia.dia] && oknok == "ok")
                        totalchecktruecomresposta++
                    questionario.diasdasemana.push({"dia": dia.dia, "check": diasdasemana[dia.dia], "oknok": oknok})
                })
                //console.log(questionario.diasdasemana)
                //console.log(totalchecktrue)
                //console.log(totalchecktruecomresposta)
                //console.log((totalchecktruecomresposta/totalchecktrue)*100)
                questionario.percentualderegistro = Math.round((totalchecktruecomresposta/totalchecktrue)*100)
                //console.log("----------------------------------------------------------------------")
                if (f.dataValues.criador != null) {
                    questionario.status = 1;
                    questionario.statustexto = "Concluído"
                }
                if (f.dataValues.aprovador != null) {
                    questionario.status = 2;
                    questionario.statustexto = "Aprovado"
                }
                if (f.dataValues.colocadoemrevisao != null) {
                    questionario.status = 3;
                    questionario.statustexto = "Em revisão"
                }
                questionarioArray.push(questionario);
            });
            res.status(200).send( questionarioArray );
        });
      } catch (err) {
        console.log(err)
        res.status(500)
        res.send({ status: 'error', message: err.message});
      }
};

exports.listQuestionariosporTiposold = async (req, res) => {
    try {
        const questionarioArray = []
        await Questionario.findAll({
            include: [{
                model: TipodeQuestionario,
                where: {id: req.params.ids.split(",")},
                attributes: ["descricao"],
                required: true,
                as: "tipo"
            },
            {
                model: Usuarios,
                as: "criador",
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "aprovador",
                attributes: ["username"]
            },
            {
                model: Usuarios,
                as: "colocadoemrevisao",
                attributes: ["username"]
            }],
            order: [['createdAt', 'DESC']]
      }).then(result => {
            result.forEach((f) => {
                const questionario = {};
                questionario.id = f.dataValues.id;
                questionario.nome = f.dataValues.nome;
                questionario.tipo = f.dataValues.tipo;
                questionario.updatedAt = f.updatedAt
                questionario.status = 0;
                questionario.statustexto = "Em digitação"
                if (f.dataValues.criador != null) {
                    questionario.status = 1;
                    questionario.statustexto = "Concluído"
                }
                if (f.dataValues.aprovador != null) {
                    questionario.status = 2;
                    questionario.statustexto = "Aprovado"
                }
                if (f.dataValues.colocadoemrevisao != null) {
                    questionario.status = 3;
                    questionario.statustexto = "Em revisão"
                }
                questionarioArray.push(questionario);
            });
            res.status(200).send( questionarioArray );
        });
    }
    catch (err) {
      res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.listRespostas = async (req, res) => {
    try {
        Resposta.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('respostas.createdAt')), 'Date'],
                "id",
                "respostas",
                "questionarioId",
                "userId",
                "updatedAt"
            ],
            as: "respostas",
            include: [{
                model: Questionario,
                as: "questionario",
                include: [{
                    model: TipodeQuestionario,
                    attributes: ["descricao"],
                    required: true,
                    as: "tipo"
                }]    
            },
            {
                model: Usuarios,
                as: "usuario",
                attributes: ["username"]   
            }],
            order: [
                ["createdAt", "DESC"]
            ],
            //raw: true
        })
        .then(function (result) {
            respostas = []
            respostasnadata = []
            dataatual = null
            result.forEach( r => {
                if ((r.dataValues.Date == dataatual) || dataatual == null) {
                    respostasnadata.push(r)
                    dataatual = r.dataValues.Date
                }
                else {
                    respostas.push({data: dataatual, respostas: respostasnadata})
                    respostasnadata = []
                    respostasnadata.push(r)
                    dataatual = r.dataValues.Date
                }
            })
            respostas.push({data: dataatual, respostas: respostasnadata})
            console.log(respostas)
            res.status(200).json( respostas );
        });
    } catch (err) {
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}

exports.addRespostaQuestionario = async (req, res) => {
    console.log("-------------------")
    console.log(req.body)
    try {
        //await verificarAutorizacaoParaEditarQuestionario(req.body['id'], req, res)
        //.then(async function(r) {
        //    if (r == false) { //Só uma pequena validação reversa, se não está em edição, pode estar concluída, mas não deve, favor melhorar no futuro
                await Resposta.create({
                    questionarioId: req.body['id'],
                    respostas: req.body['respostas'],
                    userId: req.userId
                }).then(function (result) {
                    res.status(200).json(result);
                });
        //    }
        //})
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send({ status: 'error', message: err.message});
    }
}
