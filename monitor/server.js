import http from 'http';
import url from 'url';
import pm2 from 'pm2';
import promisify from '../util/promisify';

const PORT = 9000;

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
        res.statusCode = 200;

        pm2.connect(function(err) {
            pm2.list(function(err, processList) {
                let i, process;

                const data = {
                    processes: [],
                    metrics: []
                };

                for (i = 0; i < processList.length; i++) {
                    let {
                        pid,
                        name,
                        monit
                    } = processList[i];

                    data.processes.push({
                        id: processList[i].pm_id,
                        pid,
                        name,
                        monit
                    });
                }

                pm2.launchBus(function(err, bus) {
                    if (err) {
                        console.log(err);
                    }

                    bus.on('process:msg', function(result) {
                        data.received = result;

                        res.write(JSON.stringify(data));
                        res.end();
                    });

                    pm2.sendDataToProcessId(
                        processList[0].pm_id,
                        {
                            topic: 'process:msg',
                            data: {
                                some: 'data'
                            }
                        }, 
                        function(err, result) {
                            data.result = err || result;
                        }
                    );
                });
            });
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
