module.exports = (sequelize, Sequelize) => {
    const TipodeQuestionario = sequelize.define("tipodequestionarios", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        descricao: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return TipodeQuestionario;
};
