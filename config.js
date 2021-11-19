import dotenv from 'dotenv';

dotenv.config();

export default {
    WS_ENDPOINT: process.env.WS_ENDPOINT,
    RPC_ENDPOINT: process.env.RPC_ENDPOINT,
    MNEMONIC: process.env.MNEMONIC,
    SS58_FORMAT: process.env.SS58_FORMAT || 42,
    TIMEOUT: process.env.TIMEOUT || 5000,
}
