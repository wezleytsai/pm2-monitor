import pm2 from 'pm2';
import path from 'path';
import promisify from './util/promisify';

const pkg = require(path.resolve(__dirname, 'package.json')),
    connect = promisify(pm2.connect).bind(pm2),
    start = promisify(pm2.start).bind(pm2),
    src = {
        script: 'src/index.js',
        exec_mode: 'cluster',
        instances: 0,
        name: pkg.name,
        watch: true
    },
    monitor = {
        script: 'monitor/index.js',
        exec_mode: 'fork',
        name: 'monitor',
        watch: true
    };

connect()
    .then(function() {
        return start(src);
    })
    .then(function() {
        return start(monitor);
    });
