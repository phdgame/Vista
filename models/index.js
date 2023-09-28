const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/database.sqlite'
  })


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.ROLES = ["Usuário Padrão", "Analista", "Gerente"];

db.questionario = require("./questionario.model")(sequelize, Sequelize);
db.tipodequestionario = require("./tipodequestionario.model")(sequelize, Sequelize);
db.questionario.belongsTo(db.tipodequestionario, {foreignKey:"tipoId", targetKey: "id", as: "tipo", onDelete: 'NO ACTION'})
db.questionario.belongsTo(db.user, {foreignKey:"criadorId", targetKey: "id", as: "criador", onDelete: 'NO ACTION'})
db.questionario.belongsTo(db.user, {foreignKey:"aprovadorId", targetKey: "id", as: "aprovador", onDelete: 'NO ACTION'})
db.questionario.belongsTo(db.user, {foreignKey:"colocadoemrevisaoId", targetKey: "id", as: "colocadoemrevisao", onDelete: 'NO ACTION'})

db.partedoquestionario = require("./partedoquestionario.model")(sequelize, Sequelize);
db.tipodepartedoquestionario = require("./tipodepartedoquestionario.model.js")(sequelize, Sequelize);
db.partedoquestionario.belongsTo(db.questionario, { foreignKey: "questionarioId", targetKey: "id", as: "questionario", onDelete: 'NO ACTION' });
db.partedoquestionario.belongsTo(db.tipodepartedoquestionario, { foreignKey: "tipoId", targetKey: "id", as: "tipo", onDelete: 'NO ACTION' });

db.resposta = require("./resposta.model.js")(sequelize, Sequelize);
db.resposta.belongsTo(db.questionario, {foreignKey:"questionarioId", targetKey: "id", as: "questionario", onDelete: 'NO ACTION'})
db.resposta.belongsTo(db.user, {foreignKey:"userId", targetKey: "id", as: "usuario", onDelete: 'NO ACTION'})
db.questionario.hasMany(db.resposta)

/*db.sequelize.sync().then(() => {
  console.log('Resync Db');
});*/

module.exports = db;