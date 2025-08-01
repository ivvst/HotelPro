require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    port: process.env.PORT || 3000,
    dbURL: process.env.MONGODB_URI,
    origin: 'http://localhost:4200'
  },
  production: {
    port: process.env.PORT || 3000,
    dbURL: process.env.MONGODB_URI,
    origin: []
  }
};
console.log('🌱 ENV:', env);
console.log('🔐 MONGODB_URI:', process.env.MONGODB_URI);

module.exports = config[env];
