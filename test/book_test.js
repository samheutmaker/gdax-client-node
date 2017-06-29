const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

let Book = require('./../lib/book');
let testOrders = JSON.parse(fs.readFileSync('test/data/order.json'));

let uniqueOrderCount = Object.keys(testOrders.reduce((cur, next) => {
	cur[next.order_id] = true;
	return cur;
}, {})).length

let getOrderCount = (byPrice) => {
	return Object.values(byPrice).reduce((cur, node) => {
		return cur + node.orders.length;
	}, 0);
}

describe('The GDAX order book', () => {
	let book = new Book();
	it('should add an order at the specified key', () => {
		// Add test orders to book
		testOrders.forEach(book.addOrder.bind(book));
		let bids = book._bidsByPrice;
		let asks = book._asksByPrice;
		// Test that all buys and sells were stored in the book
		expect(getOrderCount(bids) + getOrderCount(asks)).to.equal(testOrders.length);
		// Test that the order are stored by Id
		expect(Object.keys(book._ordersById).length).to.equal(uniqueOrderCount);
	});
	it('should remove an order at the specifed key', () => {
		// Remove all the orders from the book
		testOrders.map((order) => order.id || order.order_id).forEach(book.removeOrder.bind(book));
		let bids = book._bidsByPrice;
		let asks = book._asksByPrice;
		// Test that all orders have been removed
		expect(getOrderCount(bids) + getOrderCount(asks)).to.equal(0);
		// Test that bid book is empty
		expect(Object.keys(bids).length).to.equal(0);
		// Test that ask book is empty
		expect(Object.keys(asks).length).to.equal(0);
		// Test that the orders stored by Id are removed
		expect(Object.keys(book._ordersById).length).to.equal(0);
	});
});