import http from 'http';
import url from 'url';
// import pm2 from 'pm2';
import pm3 from '../util/pm2-as-promised';
// import promisify from '../util/promisify';

const pkg = require('../package.json'),
    PORT = pkg.monitor.port || 9000;
    // pm3 = {
    //     connect: promisify(pm2.connect).bind(pm2),
    //     list: promisify(pm2.list).bind(pm2),
    //     launchBus: promisify(pm2.launchBus).bind(pm2),
    //     sendDataToProcessId: promisify(pm2.sendDataToProcessId).bind(pm2)
    // };

const server = http.createServer(function(req, res) {
    let path;

    // Add CORS headers to allow browsers to fetch data directly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // We always send json
    res.setHeader('Content-Type','application/json');

    path = url.parse(req.url).pathname;

    if (path === '/') {
        let processList;

        const data = {
            processes: [],
            metrics: []
        };

        pm3.connect()
            .then(function() {
                return pm3.list();
            })
            .then(function(list) {
                processList = list.filter(function(p) {
                    return p.name !== 'monitor';
                });

                for (let process of list) {
                    let { pid, name, monit } = process;
                    data.processes.push({
                        id: process.pm_id,
                        pid,
                        name,
                        monit
                    });
                }


                return pm3.launchBus();
            })
            .then(function(bus) {
                let sending = [];

                bus.on('process:msg', function(result) {
                    if (data.metrics.push(result) >= processList.length) {
                        res.statusCode = 200;
                        res.write(JSON.stringify(data));
                        res.end();
                    }
                });

                for (let process of processList) {
                    sending.push(pm3.sendDataToProcessId(
                        process.pm_id,
                        {
                            topic: 'process:msg',
                            data: { some: 'data' }
                        })
                    );
                }


                return Promise.all(sending);
            })
            .then(function(result) {
                data.result = result;
            })
            .catch(function(err) {
                res.statusCode = 500;
                res.write(JSON.stringify({ error: err }));
                res.end();
            });

    } else {
        res.statusCode = 404;
        res.write(JSON.stringify({ error: '404' }));
        return res.end();
    }
});

server.listen(PORT, function(err) {
    if (err) {
        console.log(err);
    }

    console.log('monitor listening on port ' + PORT);
});
