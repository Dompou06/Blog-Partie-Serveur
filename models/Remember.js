module.exports = (sequelize, DataTypes) => {
    const Remembers = sequelize.define('Remembers', {
        refresh: {
            type: DataTypes.STRING,
            allowNull: true
        },
        remember: {
            type: DataTypes.STRING,
            allowNull: true
        },
    })
    return Remembers
}