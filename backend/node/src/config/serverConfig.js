const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

module.exports ={
    PORT: process.env.PORT,
    SALT: 10,
    JWT_KEY : process.env.JWT_KEY,
}