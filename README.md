# pm2-monitor
Proof of concept - pm2 running a monitoring process with messaging between all instances of an app in cluster mode.

![pm2 list](http://i.imgur.com/UcHjlLm.png)

This was a pain because of the inconsistent and overall lack of documentation for pm2 API...

## The Monitor

The [launcher](launcher.js) uses pm2's programmatic API to start x instances of the app in [src](src/) in cluster mode (where x is the number of cores), and also spawn an instance of the `monitor`.

The `monitor` listens on a port (a different port from the src app) as specified in the [package.json](package.json) under `"monitor"`, and can respond with arbitrary data as JSON

Using `sendDataToProcessId` and the bus system, the `monitor` can send messages to each app instance and listen for messages from each instance through `bus.on()`.

The `monitor` can potentailly include more aggregation logic for various metrics reported by each instance, _including_ the standard cpu/memory usage stats available through `pm2 web`.

## Start

```bash
$ npm start
```
