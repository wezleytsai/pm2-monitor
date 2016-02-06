import express from 'pm-express';

const app = express();

// return json of metrics
app.get('/', function(req, res) {
    res.sendStatus(200);
});

// catch
app.use((req, res) => {
    res.sendStatus(403);
});

process.on('message', function(msg) {
    process.send({
        type: 'process:msg',
        data: {
            hello: msg
        }
    });
});
