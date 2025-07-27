const http = require("http");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`master process ${process.pid}`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
    );

    // console.log(`Only ${Object.keys(cluster.workers).length} workers left`);
    console.log("starting a new worker");
    cluster.fork();
  });
} else {
  http
    .createServer((req, res) => {
      const message = `worker process ${process.pid}`;
      res.end(message);

      if (req.url === "/kill") {
        process.exit(1);
      } else {
        console.log(message);
      }
    })
    .listen(3000);
}
