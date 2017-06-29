const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

let Book = require('./../lib/book');
let testOrders = JSON.parse(fs.readFileSync('test/data/order.json'));

describe('The GDAX order book', () => {
	let book = new Book();
	it('should add an order at the specified key', () => {
		// Add test orders to book
		testOrders.forEach(book.addOrder.bind(book));
		let bids = book._bids;
		let asks = book._asks;
		// Test that all buys and sells were stored in the book
		expect(bids.keys.length + asks.keys.length).to.equal(testOrders.length);
		// Test that the order are stored by Id
		expect(Object.keys(book._ordersById).length).to.equal(Object.keys(testOrders.reduce((cur, next) => {
			cur[next.order_id] = true;
			return cur;
		}, {})).length);
	});
	it('should remove an order at the specifed key', () => {

		let bids = book._bids;
		let asks = book._asks;
		console.log(Object.keys(book._ordersById).length);
		console.log(asks.length);
		console.log(bids.length);
		
		testOrders.map((order) => order.id || order.order_id).forEach(book.removeOrder.bind(book));
		bids = book._bids;
		asks = book._asks;

		console.log(Object.keys(book._ordersById).length);
		console.log(asks.length);
		console.log(bids.length);

		// console.log(asks.keys)

		// console.log(bids.keys.length);
	});
});