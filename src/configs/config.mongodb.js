const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3352
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    user_name: process.env.DEV_DB_USER_NAME || "admin",
    password: process.env.DEV_DB_PASSWORD || "123456",
    port: process.env.DEV_DB_PORT || 27017
  }
};

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 3052
  },
  db: {
    host: process.env.PRO_DB_HOST || "localhost",
    user_name: process.env.PRO_DB_USER_NAME || "admin",
    password: process.env.PRO_DB_PASSWORD || "123456",
    port: process.env.PRO_DB_PORT || 27017
  }
};

const config = {
  dev,
  pro
};

const env = process.env.NODE_ENV || "dev";

module.exports = config[env];
