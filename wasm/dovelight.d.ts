/* tslint:disable */
/* eslint-disable */
/**
* @param {string} chain_api
* @param {any} source_map
* @param {string} dialect
* @param {string} sender
* @returns {any}
*/
export function build(chain_api: string, source_map: any, dialect: string, sender: string): any;
/**
* @param {string} chain_api
* @param {string} dialect
* @param {string} address
* @param {string} module_name
* @returns {any}
*/
export function module_abi(chain_api: string, dialect: string, address: string, module_name: string): any;
/**
* @param {string} chain_api
* @param {any} source_map
* @param {string} dialect
* @param {string} address
* @returns {any}
*/
export function make_abi(chain_api: string, source_map: any, dialect: string, address: string): any;
/**
* Creating a transaction
* @param {string} chain_api
* @param {any} source_map
* @param {string} dialect
* @param {string} call
* @returns {any}
*/
export function tx(chain_api: string, source_map: any, dialect: string, call: string): any;
