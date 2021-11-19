# Dia Node

Posting oracle prices to Dia contract. 

Known issues:

* Comments in [set_value.move](contracts/set_value.move) breaks dovelight (should be fixed).
* Addresses parsing of dovelight (see large hex address, it should be fixed).

### Installation 

You need working Pontem node with opened RPC and WS endpoints.
First deploy Dia contract and make account in Diem Standard Library, see [Dia README](https://github.com/pontem-network/dia#dia-smart-contracts).

    vim ./contracts/set_value.move # Replace Dia address with correct one.
    cp .env.example .env
    npm install

See configuration in [.env.example](./.env.example).

### Launch

    npm run

### WASM Update

In case of WASM update be sure it correctly resolves `wasm_resolver.js`.

## LICENSE

MIT.
