require('dotenv').config()
module.exports = {
    'development': {
        'username': process.env.DBUSER_DEV,
        'password': process.env.DBPASSWORD_DEV,
        'database': process.env.DB_DEV,
        'host': process.env.DBHOST_DEV,
        'dialect': 'mysql'
    },
    'production': {
        'username': process.env.DBUSER,
        'password': process.env.DBPASSWORD,
        'database': process.env.DB,
        'host': process.env.DBHOST,
        'dialect': 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}