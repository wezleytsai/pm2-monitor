// import pm2 from 'pm2';
import pm2 from '../util/pm2-as-promised';
import path from 'path';
// import promisify from './util/promisify';

const pkg = require(path.resolve(__dirname, '../package.json')),
    // connect = promisify(pm2.connect).bind(pm2),
    // start = promisify(pm2.start).bind(pm2),
    src = {
        script: 'src/index.js',
        exec_mode: 'cluster',
        instances: 2,
        name: pkg.server.name,
        watch: true
    },
    monitor = {
        script: 'monitor/index.js',
        exec_mode: 'fork',
        name: 'monitor',
        watch: true
    };

pm2.connect()
    .then(function() {
        return pm2.start(src);
    })
    .then(function() {
        return pm2.start(monitor);
    });
