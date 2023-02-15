module.exports = (sequelize, DataTypes) => {
    const Auths = sequelize.define('Auths', {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        
    })

    Auths.associate = (models) => { 
        //Si ajout de la colonne ne fonctionne pas, supprimer tous les posts ou supprimer la table
        Auths.belongsTo(models.Users)
    }
    return Auths
}