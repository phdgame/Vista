module.exports = (sequelize, Sequelize) => {
    const TiposdeRespostas = sequelize.define("tipodepartedoquestionarios", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return TiposdeRespostas;
};
