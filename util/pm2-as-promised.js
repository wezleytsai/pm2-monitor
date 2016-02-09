import pm2 from 'pm2';
import promisify from './promisify';

const methods = [
    'start',
    'connect',
    'list',
    'launchBus',
    'sendDataToProcessId'
];

for (let method of methods) {
    if (typeof pm2[method] === 'function') {
        pm2[method] = promisify(pm2[method]);
    }
}

export default pm2;
