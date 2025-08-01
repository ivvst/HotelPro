require('dotenv').config(); // ❗ ЗАДЪЛЖИТЕЛНО първо

const express = require('express');
const cors = require('cors');
const dbConnector = require('./config/db');
const config = require('./config/config');
const apiRouter = require('./router');
const usersRouter = require('./router/users'); // 🔄 auth + profile логика
const { errorHandler } = require('./utils');

dbConnector()
  .then(() => {
    const app = express();

    require('./config/express')(app); // ако имаш такъв файл

    app.use(cors({
      origin: config.origin,
      credentials: true
    }));

    app.use(express.json());
    
    app.use('/api/users',usersRouter);

    // 🔐 Регистрация, вход, профил
    app.use('/api/users', usersRouter);

    // 👇 ако имаш други неща под /api
    app.use('/api', apiRouter);

    // 🧯 Глобален error handler
    app.use(errorHandler);

    app.listen(config.port, () => {
      console.log(`✅ Listening on port ${config.port}!`);
      console.log('✅ Mongo URI:', config.dbURL);
    });
  })
  .catch(console.error);
