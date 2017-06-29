const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

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
	let secondBook = new Book();

	// addOrder
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
	// getState
	it('should return the current book state', () => {
		// Get the state of the book
		let state = book.getState();
		let bids = book._bidsByPrice;
		let asks = book._asksByPrice;
		// Check that all bids are stored
		expect(getOrderCount(bids)).to.equal(state.bids.length);
		// Check that all asks are stored
		expect(getOrderCount(asks)).to.equal(state.asks.length);
	});
	// setState
	it('should populate the book from the book parameter', () => {
		
	});
	// removeOrder
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