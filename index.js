// let sum = (array) => array.length ? array.pop() + sum(array) : 0;
// let average = (array) => sum(array) / array.length;

const PublicClient = require('./lib/public-client');

const publicClient = new PublicClient();

// publicClient.getTime()
// .then(r => console.log(r.body))

// let params = {
//   start: '2017-01-07T23:47:25.201Z',
//   end: '2017-01-09T23:47:25.201Z',
//   granularity: 60*60
// };

// publicClient.getHistoricRates(params)
//   .then(res => {
//   	res.reduce((cur, next) => {
//   		let first = cur[0] - 60*60;
//   		let second = next[0];
//   		if( first != second) {
//   			console.log(first);
//   			console.log(second);
//   		}
//   		return next;
//   	});

//   })
//   .catch(err => console.error(err));


const PrivateClient = require('./lib/private-client');
const passphrase = process.env.GDAX_PASSPHRASE;
const key = process.env.GDAX_KEY;
const secret = process.env.GDAX_SECRET;
let privateClient = new PrivateClient(passphrase, key, secret);
// privateClient.sell({
// 	type: 'limit',
// 	price: '250.00',
// 	size: '0.01',
// 	product_id: 'ETH-USD'
// });
// privateClient.cancelAllOrders()
// .then((r) => console.log(r.body))
// .catch((r) => console.log(r.response.text))
// privateClient.listOrders()
// .then((r) => console.log(r.body))
// .catch((r) => console.log(r.response.text))

privateClient.getTrailingVolume()
.then((r) => console.log(r.body))
.catch((r) => console.log(r.response.text))