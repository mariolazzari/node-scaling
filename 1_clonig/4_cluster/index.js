const http = require("http");
const cluster = require("cluster");
const numCpus = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }
} else {
  http
    .createServer((_req, res) => {
      const msg = `Hello from worker ${process.pid}`;
      console.log(msg);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(msg);
    })
    .listen(3000, () => {
      console.log(`Worker process ${process.pid} is listening on port 3000`);
    });
}
