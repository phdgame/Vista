module.exports = (sequelize, Sequelize) => {
    const PartedoQuestionario = sequelize.define("partedoquestionarios", {
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
    return PartedoQuestionario;
};
