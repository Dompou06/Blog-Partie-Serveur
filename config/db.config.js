require('dotenv').config()
module.exports = {
    HOST: process.env.DBHOST,
    USER: process.env.DBUSER,
    PASSWORD: process.env.DBPASSWORD,
    DB1: process.env.DB1,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}