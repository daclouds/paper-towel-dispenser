const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const request = require('request');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const schedule = require('node-schedule');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/refill', function(req, res) {
  if (rest !== 0) {
    return res.send('nok');
  }
  rest = 100;
  job = schedule.scheduleJob('*/10 * * * * *', updateRandomUse);
  res.send('ok');
});

io.on('connection', function(socket) {
  socket.on('message', function(msg) {
    console.log(msg);
    io.emit('message', msg);
  });
});

let rest = 100;
let lastSync;
let job;

const updateUse = () => {
  return request('http://192.168.0.105', (error, response, body) => {
    console.log(body);
    if (!body) return updateRandomUse();
    try {
      const { RESTROOM: [ lastModified, id, use, acc, usePercent ]} = JSON.parse(body);
      if (lastSync && lastSync >= lastModified) {
        return;
      }
      io.emit('message', JSON.stringify({
        use: usePercent >= 100 ? 0 : use,
        rest: usePercent >= 100 ? 100 : 100 - usePercent,
      }));
    } catch (e) {
      return updateRandomUse()
    }
  });
}

const updateRandomUse = () => {
  const use = Math.random() * (10 - 1) + 1;
  rest -= use;
  if (rest <= 0) {
    rest = 0;
    job.cancel();
  }
  io.emit('message', JSON.stringify({
    use: Math.round(use),
    rest: Math.round(rest),
  }));
}

job = schedule.scheduleJob('*/10 * * * * *', updateUse);

http.listen(port, function(){
  console.log('listening on *:' + port);
});
