require('dotenv').config(); // ❗ ЗАДЪЛЖИТЕЛНО първо

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnector = require('./config/db');
const config = require('./config/config');
const apiRouter = require('./router');
const usersRouter = require('./router/users');
const { errorHandler } = require('./utils');

dbConnector()
  .then(() => {
    const app = express();

    // ако имаш ./config/express, остави го тук:
    if (typeof require('./config/express') === 'function') {
      require('./config/express')(app);
    }
    app.use(cookieParser()); // <--- ЗАДЪЛЖИТЕЛНО ЗА JWT от cookie

    app.use(cors({
      origin: config.origin,
      credentials: true
    }));

    app.use(express.json());

    // Първо user, после другите
    app.use('/api/users', usersRouter);
    app.use('/api', apiRouter);

    app.use(errorHandler);

    app.listen(config.port, () => {
      console.log(`✅ Listening on port ${config.port}!`);
      console.log('✅ Mongo URI:', config.dbURL);
    });
  })
  .catch(console.error);
