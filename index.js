import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import * as Dove from './wasm/dovelight.js';
import fs from 'fs';
import BN from 'bn.js';

async function main() {
    const types = JSON.parse(fs.readFileSync("./types.json", 'utf8'));

    const sources = new Map();
    sources["set_value.move"] = fs.readFileSync("./contracts/set_value.move", 'utf8');

    const sources_map = {
        source_map: sources
    };

    console.log("Dove build");

    const timestamp = Date.now();
    const price = 23148148; // 10 Decimals supported, let's say 1 PONT costs 0.0023148148 KSM.

    /// PNT/KSM price.
    const tx = Dove.tx("http://localhost:10900/", sources_map, "pont", `set_value<0x1::KSM::KSM>(${price}, ${timestamp})`);

    const bytecode = Buffer.from(tx.bytecode);

    console.log('Tx Bytecode: ', bytecode.toString('hex'));

    /// Send transaction finally
    const wsProvider = new WsProvider('ws://127.0.0.1:9946');
    const mnemonic = "//Bob";

    const api = await ApiPromise.create({ types: types, provider: wsProvider });
    const keyring = new Keyring({ type: "sr25519", ss58Format: 105 });

    const keyRing = keyring.addFromMnemonic(mnemonic);
    console.log('Address is: ' + keyRing.address);

    /// Get nonce.
    let { nonce } = await api.query.system.account(keyRing.address);
    let nextNonce = new BN(nonce.toString());

    console.log('send transaction: ' + nextNonce);
    /// Send transaction.
    const mvmTx = api.tx.mvm.execute('0x' + bytecode.toString('hex'), '1000000');
    const unsub = await mvmTx.signAndSend(keyRing, { nonce: nextNonce }, result => {
        console.log(`Current status is ${result.status}`);

        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          unsub();
        }
    });
}

main();
