const Sequelize = require('sequelize');
const database = require('.');
module.exports = (sequelize, Sequelize) => {
    const Resposta = sequelize.define("respostas", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        respostas: {
            type: Sequelize.JSON
        }
    });
    return Resposta;
};