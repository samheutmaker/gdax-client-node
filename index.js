let sum = (array) => array.length ? array.pop() + sum(array) : 0;
let average = (array) => sum(array) / array.length;

const PublicClient = require('./lib/public-client');

const publicClient = new PublicClient();

let params = {
  start: '2017-01-07T23:47:25.201Z',
  end: '2017-01-09T23:47:25.201Z',
  granularity: 60
};

publicClient.getHistoricRates(params)
  .then(res => {
  	res.reduce((cur, next) => {
  		let first = cur[0] - 60;
  		let second = next[0];
  		if( first != second) {
  			console.log(first);
  			console.log(second);
  		}
  		return next;
  	});
    
  })
  .catch(err => console.error(err));