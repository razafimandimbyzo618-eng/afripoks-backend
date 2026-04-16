const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  "railway",
  "root",
  "PxvrhZVtIbMxpXDQHNMNzpbVlYqvcqJs",
  {
    host: "trolley.proxy.rlwy.net",
    dialect: "mysql",
    port: 49162,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;