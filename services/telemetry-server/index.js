/* eslint-env node */
const { Server, Config } = require("@iracing-data/sdk-server");

const main = async () => {
  const config = Config.readEnvironment({
    port: 3030,
  });

  const server = Server.create({ config });
  await server.start();

  const shutdown = async () => {
    await server.stop();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
