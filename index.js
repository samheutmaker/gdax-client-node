// let sum = (array) => array.length ? array.pop() + sum(array) : 0;
// let average = (array) => sum(array) / array.length;

// const GdaxWebsocket = require('./lib/gdax-websocket');

// var socket = new GdaxWebsocket();


// socket.on('message', (data) => console.log(JSON.stringify(data)));

const Client = require('./lib/public-client');

let publicClient = new Client();

// publicClient.getProducts()
// .then((products) => {
// 	console.log(products);
// });


// publicClient.getBook()
// .then((res) => {
// 	console.log(res.body);
// })
// .catch((err) => console.error(err));


// publicClient.getTrades()
// .then((res) => {
// 	console.log(res.body);
// })
// .catch((err) => console.error(err));


// publicClient.getHistoricRates({
// 	start: new Date('27 June 2017 14:48 UTC').toISOString(),
// 	end: new Date('27 June 2017 16:48 UTC').toISOString(),
// 	granularity: 60
// })
// .then((res) => {
// 	console.log(res.body[0][0])
// 	console.log(res.body[res.body.length - 1][0])
// 	console.log(new Date(res.body[0][0]*1000));
// 	console.log(new Date(res.body[res.body.length - 1][0]*1000));
// })
// .catch((err) => console.error(err));



// publicClient.get24HourStats()
// .then((res) => {
// 	console.log(res.body);
// })
// .catch((err) => console.error(err));


// publicClient.getCurrencies()
// .then((res) => {
// 	console.log(res.body);
// })
// .catch((err) => console.error(err));


// publicClient.getTicker().then((res) => console.log(res.body));



publicClient.getTime()
.then((res) => {
	console.log(res.body);
})
.catch((err) => console.error(err));
