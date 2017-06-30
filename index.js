let sum = (array) => array.length ? array.pop() + sum(array) : 0;
let average = (array) => sum(array) / array.length;

const RealtimeBook = require('./lib/realtime-book');

let liveBook = new RealtimeBook();

liveBook.on('message', (data) => {
	
});

 