const Sequelize = require('sequelize');
const database = require('.');
module.exports = (sequelize, Sequelize) => {
    const Questionario = sequelize.define("questionarios", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        diasdasemana: {
            type: Sequelize.STRING,
        }
    });
  
    return Questionario;
  };