import getParameterNames from "get-parameter-names";

export class JsonRpcError {
    constructor(code, message, data = undefined) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

function createMethodHandler(fn) {
    const names = getParameterNames(fn);

    return (params) => {
        if (names[0] && (names[0].startsWith('{') || names[0].startsWith('['))) {
            return fn(params);
        }

        if (!Array.isArray(params)) {
            params = names.map((name) => params[name]);
        }

        return fn(...params);
    };
}

function makeError(id, error) {
    return {
        jsonrpc: '2.0',
        error,
        id,
    };
}

function makeResult(id, result) {
    return {
        jsonrpc: '2.0',
        result,
        id,
    };
}

function jepc(methods = {}) {
    methods = { ...methods };

    Object.entries(methods).forEach(([name, fn]) => {
        methods[name] = createMethodHandler(fn);
    });

    async function handleSingle(request) {
        // { "jsonrpc": "2.0", "method": "...", "params": [], "id": 1 }
        if (!request || typeof request !== 'object') {
            return makeError(null, {
                code: -32600,
                message: 'Invalid Request',
            });
        }

        let { jsonrpc, method, params = [], id = null } = request;

        // 2.0
        if (jsonrpc !== '2.0') {
            return makeError(id, {
                code: -32600,
                message: 'Invalid Request',
            });
        }

        // "getUsers"
        if (typeof method !== 'string') {
            return makeError(id, {
                code: -32600,
                message: 'Invalid Request',
            });
        }

        // {}, []
        if (!params || typeof request !== 'object') {
            return makeError(id, {
                code: -32600,
                message: 'Invalid Request',
            });
        }

        // 1, 3.14, "ha.sh"
        if (id && typeof id !== "string" && typeof id !== "number") {
            return makeError(id, {
                code: -32600,
                message: 'Invalid Request',
            });
        }

        if (!(method in methods)) {
            return makeError(id, {
                code: -32601,
                message: 'Method not found'
            });
        }

        try {
            const result = await methods[method](params);

            const madeResult = makeResult(id, result);

            if (!id) {
                return '';
            }

            return madeResult;
        } catch (e) {
            if (!id) {
                return '';
            }

            if (e instanceof JsonRpcError) {
                return makeError(id, {
                    code: e.code,
                    message: e.message,
                    data: e.data,
                });
            } else {
                return makeError(id, {
                    code: -32603,
                    message: 'Internal error',
                });
            }
        }
    }

    async function handle(message) {
        let request;

        if (typeof message === 'string') {
            try {
                request = JSON.parse(message);
            } catch (e) {
                return makeError(null, {
                    code: -32700,
                    message: 'Parse error'
                });
            }
        } else {
            request = message;
        }

        let output;

        if (Array.isArray(request)) {
            if (!request.length) {
                return makeError(null, {
                    code: -32600,
                    message: 'Invalid Request',
                });
            }

            output = (await Promise.all(request.map((request) => handleSingle(request))))
                .filter((v) => !!v);

            if (!output.length) {
                return undefined;
            }
        } else {
            output = await handleSingle(request);
        }

        if (output) {
            return output;
        } else {
            return undefined;
        }
    }

    return { methods, handle };
}

export default jepc;
