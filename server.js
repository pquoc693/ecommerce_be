const app = require("./src/app");

const config = require("./src/configs/config.mongodb");

const PORT = config.app.port || 3056;

const server = app.listen(PORT, () => {
  console.log(`${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit server "));
});
