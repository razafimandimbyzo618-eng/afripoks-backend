const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");

dotenv.config();

 console.log('Dialect:', process.env.DB_DIALECT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: true,
  }
);
//connexion  dot env
module.exports = sequelize;