const LiveBook = require('./lib/live-book');

let book = new LiveBook();

book.on('message', (data) => {
	let asks = book.book.getState().asks;
	console.log(asks.length)
	let values = book.book._ordersById;
	console.log(Object.values(values).filter((v) => v.side == 'sell').length);
	console.log('\n');
});