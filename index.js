import * as Dove from './wasm/dovelight.js';
import fs from 'fs';

function main() {
    const sources = new Map();
    sources["set_value.move"] = fs.readFileSync("./contracts/set_value.move", 'utf8');

    const sources_map = {
        source_map: sources
    };

    console.log("dove build");
    const timestamp = Date.now();
    const tx = Dove.tx("http://localhost:10900/", sources_map, "pont", "set_value<0x1::PONT::PONT, 0x1::KSM::KSM>(100, 100)");

    console.log('tx', tx);
    const bytecode = Buffer.from(tx.bytecode);

    console.log('bytecode: ', bytecode.toString('hex'));
    
}

main();
