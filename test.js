import jepc from "./src/main.js";

const add = (a, b) => a + b;
const ping = (a, b) => a + b;

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
