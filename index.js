import * as Dove from './wasm/dovelight.js';
import * as scripts from './scripts.js';

function main() {
    const sources = new Map();
    const script_name = "SET_VALUE";

    sources[script_name + ".move"] = scripts[script_name];

    const sources_map = {
        source_map: sources
    };

    console.log("dove build");
    const tx = Dove.tx("http://localhost:9946/", sources_map, "pont", "set_value<0x1::PONT::PONT, 0x1::PONT::PONT>(100, 100)");

    console.log('tx', tx);
    const bytecode = Buffer.from(tx.bytecode);

    console.log('bytecode: ', bytecode.toString('hex'));

}

main();
