const env = require("./config/env");
const app = require("./App");

class Server {
  constructor() {
    this.port = env.PORT;
    this.app = app;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

const server = new Server();

// Start server if this file is run directly
if (require.main === module) {
  server.start();
}

module.exports = server;

