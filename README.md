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

```
