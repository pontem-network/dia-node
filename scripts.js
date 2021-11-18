import fs from 'fs';
import path from 'path';

function loadModule(moduleName) {
    return fs.readFileSync(path.resolve("./move_scripts", moduleName + '.move'), 'utf8');
}

module.exports = {
    SET_VALUE: loadModule('set_value')
};
