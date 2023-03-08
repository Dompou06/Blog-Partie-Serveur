module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define('Roles', {
        Author: {
            type: DataTypes.STRING,
            defaultValue: 'true'
        },
        Administrator: {
            type: DataTypes.TEXT,
            defaultValue: 'false'
        },
        Manager: {
            type: DataTypes.TEXT,
            defaultValue: 'false'
        }
    })

    Roles.associate = (models) => {
        Roles.belongsTo(models.Users, {
            onDelete: 'cascade',
        })
    }
    
    return Roles
}