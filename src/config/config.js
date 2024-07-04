require('dotenv').config();

module.exports =

{
  "development": {
    "username": String(process.env.DBUSER),
    "password": String(process.env.DBPASSWORD),
    "database": String(process.env.DBNAME),
    "host": String(process.env.DBHOST),
    "dialect": "postgres"
  },
  "test": {
    "username": String(process.env.DBUSER),
    "password": String(process.env.DBPASSWORD),
    "database": String(process.env.DBTEST),
    "host": String(process.env.DBHOST),
    "dialect": "postgres"
  },
  "production": {
    "username": String(process.env.DBUSER),
    "password": String(process.env.DBPASSWORD),
    "database": String(process.env.DBNAME),
    "host": String(process.env.DBHOST),
    "dialect": "postgres"
  }
}
