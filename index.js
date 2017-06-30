// let sum = (array) => array.length ? array.pop() + sum(array) : 0;
// let average = (array) => sum(array) / array.length;

// const GdaxWebsocket = require('./lib/gdax-websocket');

// var socket = new GdaxWebsocket();


// socket.on('message', (data) => console.log(JSON.stringify(data)));

const RealtimeBook = require('./lib/realtime-book');

let liveBook = new RealtimeBook();

 