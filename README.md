# Advanced Node.js: Scaling Applications

## Cloning

### Scale cube

- x axis -> instances
- y axis -> partitioning
- z axis -> microservices

### Scaling x axis (cloning)

- Multiple instances
- Load balancers

### Forking processes

```js
const { fork } = require("child_process");

const processes = [
  fork("./app.js", ["3001"]),
  fork("./app.js", ["3002"]),
  fork("./app.js", ["3003"]),
];

console.log(`Forked ${processes.length} processes`);
```

### Using a cluster module

```js
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
```

### Architecting zero downtime

```js

```