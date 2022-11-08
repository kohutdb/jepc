# jepc

Fully featured JSON-RPC handler for JavaScript/Node.js.
If you need a server, try [sepc](https://github.com/kohutd/sepc).
If you need a client, try [repc](https://github.com/kohutd/repc).
If you need details, read [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification).

## Installation

```shell
npm i jepc
```

## Usage

Basic:

```javascript
import jepc from 'jepc';

const add = (a, b) => a + b;
const ping = () => null;

const { handle } = jepc({ add, ping });

const result4 = await handle({ jsonrpc: '2.0', method: 'add', params: [2, 2], id: 1 });
const result8 = await handle('{ "jsonrpc": "2.0", "method": "add", "params": [4, 4], "id": 2 }');
const notificationResult = await handle({ jsonrpc: '2.0', method: 'ping' });
const batchResult = await handle([
    { jsonrpc: '2.0', method: 'add', params: [2, 2], id: 1 },
    { jsonrpc: '2.0', method: 'add', params: [4, 4], id: 2 },
    { jsonrpc: '2.0', method: 'ping' },
]);

console.log(result4); // { jsonrpc: '2.0', result: 4, id: 1 }
console.log(result8); // { jsonrpc: '2.0', result: 8, id: 2 }
console.log(notificationResult); // undefined
console.log(batchResult); // [{ jsonrpc: '2.0', result: 4, id: 1 }, { jsonrpc: '2.0', result: 8, id: 2 }]

```

Express:

```javascript
import jepc from 'jepc';
import express from 'express';

const add = (a, b) => a + b;

const { handle } = jepc({ add });

const app = express();

app.use(express.text({ type: '*/*' }));

app.post('/', (req, res) => {
    handle(req.body)
        .then((out) => res.send(out));
});
```

## API

### `handle`

Handle JSON-RPC request. Supports object, array and string as input.
If string is passed, it will be parsed as JSON.

- type: `function(object | array | string)`
- result: `Promise<object | array | undefined>`
- example:

```javascript
handle('{}'); // invalid request error
handle('[]'); // invalid request error
handle('a'); // parse error
handle({ "jsonrpc": "2.0", "method": "add", "params": [4, 4], "id": 2 }); // ok
handle('{ "jsonrpc": "2.0", "method": "ping" }'); // ok, undefined returned
handle([{ "jsonrpc": "2.0", "method": "add", "params": [4, 4], "id": 2 }]) // ok, array returned
```

### `methods`

Available methods.

- type: `Record<string, function>`
