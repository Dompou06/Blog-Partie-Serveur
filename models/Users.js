module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
    })

    Users.associate = (models) => { 
        //Si ajout de la colonne ne fonctionne pas, supprimer tous les posts ou supprimer la table
        Users.hasMany(models.Posts, {
            onDelete: 'cascade',
        })
        Users.hasMany(models.Likes, {
            onDelete: 'cascade',
        })
        Users.hasMany(models.Comments, {
            onDelete: 'cascade',
        })
    }

    return Users
}