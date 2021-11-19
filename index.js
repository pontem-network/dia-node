import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import * as Dove from './wasm/dovelight.js';
import fs from 'fs/promises';
import config from './config.js';
import axios from 'axios';

/**
 * Supported currencies list.
 */
const Currencies = {
    KSM: {
        symbol: 'KSM',
        generic: '0x1::KSM::KSM',
    },
};

/**
 * Timeout promise. 
 * @param {*} ms 
 * @returns 
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Load Pontem runtime types.
 * 
 * @returns {Object}
 */
async function loadTypes() {
    let rawTypes = await fs.readFile('./types.json', 'utf8');
    return JSON.parse(rawTypes);
}

/**
 * Load contracts into sources map.
 * 
 * @returns {Map}
 */
async function loadContracts() {
    const source_map = new Map();

    source_map["setValue"] = await fs.readFile('./contracts/set_value.move', 'utf8');

    return {
        source_map
    };
}

/**
 * Compile script to Move VM execute transaction bytecode.
 * 
 * @param {Object} sources_map Script source code to compile.
 * @param {string} funcName  Script name to execute.
 * @param {Array} generics  Script generics.
 * @param {Array} args Script arguments.
 * @returns {Object} Compiled script.
 */
function buildTx(sources_map, funcName, generics, args) {
    let toExecute = `${funcName}`;

    if (generics && generics.length > 0) {
        toExecute += `<${generics.join(',')}>`;
    }

    toExecute += '(';
    if (args && args.length > 0) {
        toExecute += args.join(',');
    }
    toExecute += ')';

    return Dove.tx(config.RPC_ENDPOINT, sources_map, "pont", toExecute);
}

/**
 * Compile `set_value` script.
 * 
 * @param {Object} sources_map Script source code to compile.
 * @param {*} currency Currency.
 * @param {*} value Current value.
 * @param {*} timestamp Current timestamp.
 * @returns {Object} Compiled script.
 */
function buildSetValueTx(sources_map, currency, value, timestamp) {
    return buildTx(sources_map, "set_value", [currency.generic], [value, timestamp]);
}

/**
 * Convert price to integer with max decimals, not great than u64.
 * 
 * @param {Number} price 
 * @returns 
 */
function formatPrice(price) {
    const MAX_U64 = 18446744073709551615;
    const DEC_LENGTH = 10;

    let [integer, decimals] = price.toString().split('.');

    if (decimals.length < DEC_LENGTH) {
        let l = DEC_LENGTH - decimals.length;

        for (let i = 0; i < l; i++) {
            decimals += "0";
        }
    } else {
        decimals = decimals.substr(0, DEC_LENGTH);
    }

    const r = `${integer}${decimals}`;

    if (parseInt(r) > MAX_U64) {
        throw new Error('Price can\'t be placed into u64');
    }

    return `${integer}${decimals}`;
}

/**
 * Fetch price from dia data.
 * 
 * @param {Object} currency 
 * @returns 
 */
function fetchPrice(currency) {
    return axios
        .get(`https://api.diadata.org/v1/quotation/${currency.symbol}`)
        .then(resp => {
            return {
                value: resp.data.Price,
                time: new Date(resp.data.Time),
            }
        });
}

/**
 * Start main flow loop.
 * 
 * @param {*} contracts 
 */
async function startLoop(contracts, api, account) {
    for (let key in Currencies) {
        const currency = Currencies[key];

        console.log(`Fetching price: ${currency.symbol}`);

        // First we fetch price.
        let value, time;
        try {
            const priceData = await fetchPrice(currency);
            value = formatPrice(priceData.value);
            time = priceData.time;
        } catch (e) {
            console.error('Error during fetching price: ', e);
            continue;
        }

        console.log('Building tx...');
        const tx = buildSetValueTx(contracts, Currencies.KSM, value, time.getTime());
        const bytecode = Buffer.from(tx.bytecode);

        console.log('Sending transaction...');
        let { nonce } = await api.query.system.account(account.address);
        const execute = api.tx.mvm.execute('0x' + bytecode.toString('hex'), '1000000');
        
        const resolve_tx = () => {
            return new Promise(async (resolve) => {
                const unsub = await execute.signAndSend(account, { nonce }, result => {
                    // TODO: would be good to know if transaction successful executed.
                    if (result.status.isInBlock) {
                        unsub();
                        resolve();
                    }
                });
            });
        }

        try {
            await resolve_tx();
        } catch (e) {
            console.log('Can\'t send transaction: ', e);
        }

        console.log('Transaction sent');
    }

    await sleep(config.TIMEOUT);
    await startLoop(contracts, api, account);
}

async function main() {
    // Check config.
    if (!config.WS_ENDPOINT) {
        throw new Error('Missed `WS_ENDPOINT` env var');
    }

    if (!config.RPC_ENDPOINT) {
        throw new Error('Missed `WS_ENDPOINT` env var');
    }

    if (!config.MNEMONIC) {
        throw new Error('Missed `MNEMONIC` env var');
    }

    // Load types.
    const pontemTypes = await loadTypes();

    // Load contracts.
    const contracts = await loadContracts();

    // Create Polkadot API.
    const wsProvider = new WsProvider(config.WS_ENDPOINT);
    const api = await ApiPromise.create({ types: pontemTypes, provider: wsProvider });
    const keyring = new Keyring({ type: "sr25519", ss58Format: config.SS58_FORMAT });
    const account = keyring.addFromMnemonic(config.MNEMONIC);
    console.log(`Account address is: ${account.address}`);

    startLoop(contracts, api, account);
}

main();
