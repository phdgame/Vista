const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isComprador = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].id === 2) {
        return next();
      }
    }

    return res.status(403).send({
      message: "Requer usuário 'Comprador'!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Incapaz de validar a permissão do usuário, entrar em contato com o admnistrador do sistema",
    });
  }
};

isMontadordeFerramentas = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].id === 3) {
        return next();
      }
    }

    return res.status(403).send({
      message: "Requer usuário 'Montador de Ferramentas'!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Incapaz de validar a permissão do usuário, entrar em contato com o admnistrador do sistema",
    });
  }
};

isCompradorOrMontadordeFerramentas = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].id === 2) {
        return next();
      }

      if (roles[i].id === 3) {
        return next();
      }
    }

    return res.status(403).send({
      message: "Requer usuário 'Comprador' ou 'Montador de Ferramentas'!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate Moderator or Admin role!",
    });
  }
};

const authJwt = {
  verifyToken,
  isComprador,
  isMontadordeFerramentas,
  isCompradorOrMontadordeFerramentas,
};
module.exports = authJwt;