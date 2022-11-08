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

Accessing params:

```javascript
// natural (like general js function) 
function add(a, b) {
    return a + b;
}

// using destruction
function createUser({ name, email }) {
    const user = { /* handle user creation */ };

    return user;
}

// using this.params
function createUser() {
    const { name, email } = this.params;

    const user = { /* handle user creation */ };

    return user;
}

// using ...
function sort(...numbers) {
    return numbers.sort();
}

// using "arguments"
// parameter names must be empty here
function sum() {
    const numbers = arguments[0];

    return Object.values(numbers).reduce((s, c) => s + c, 0);
}
```

Method class:

```javascript
import jepc, { Method } from 'jepc';

class SumMethod extends Method {
    handle(params) {
        return Object.values(params)
            .reduce((s, c) => s + c, 0);
    }
}

class ReturnId extends Method {
    handle(params, context) {
        return context.request.id;
    }
}

const sum = new SumMethod();

const { handle } = jepc({ sum });
```

Errors:

```javascript
import jepc, { JsonRpcError } from 'jepc';

function divide(a, b) {
    if (b === 0) {
        throw new JsonRpcError(-32602, 'Cannot divide by zero');
    }

    return a / b;
}

jepc({ divide });
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
