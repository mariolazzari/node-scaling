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
```

### Cluster with PM2

```sh
pm2 start app.js -i 3 # 3 instances
pm2 list
pm2 stop app
pm2 delete app
pm2 start app-js -i -1 # auto
pm2 logs
pm2 monit
```

## Databases

### Incorporating database

```js
const http = require("http");
const { LocalStorage } = require("node-localstorage");

const db = new LocalStorage("./data");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    let requests = db.getItem("requests");
    db.setItem("requests", ++requests);
    console.log(`${process.pid}: ${requests}`);

    res.end(JSON.stringify(requests));
  }
});

server.listen(3000);
console.log(`counting requests`);
```

### Horizontal partitioning (sharding)

```js
const { LocalStorage } = require("node-localstorage");

const dbA = new LocalStorage("data-a-m");
const dbB = new LocalStorage("data-m-z");

const whichDB = name => (name.match(/^[A-M]|^[a-m]/) ? dbA : dbB);

const loadCats = db => JSON.parse(db.getItem("cats") || "[]");

const hasCat = name =>
  loadCats(whichDB(name))
    .map(cat => cat.name)
    .includes(name);

module.exports = {
  addCat(newCat) {
    if (!hasCat(newCat.name)) {
      let db = whichDB(newCat.name);
      let cats = loadCats(db);
      cats.push(newCat);
      db.setItem("cats", JSON.stringify(cats, null, 2));
    }
  },

  findCatByName(name) {
    let db = whichDB(name);
    let cats = loadCats(db);
    return cats.find(cat => cat.name === name);
  },

  findCatsByColor(color) {
    return [
      ...loadCats(dbA).filter(cat => cat.color === color),
      ...loadCats(dbB).filter(cat => cat.color === color),
    ];
  },
};
```

## 