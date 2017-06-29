const num = require('num')

let comparator = (a, b) => {
	return a.cmp(b);
}

class Book {
	constructor() {
		this._ordersById = {};
		this._bidsByPrice = {};
		this._asksByPrice = {};
	}
	_getHash(side) {
		return side == 'buy' ? this._bidsByPrice : this._asksByPrice;
	}
	state(book) {

	}
	addOrder(order) {
		order = {
			id: order.order_id || order.id,
			side: order.side,
			price: num(order.price),
			size: num(order.size || order.remaining_size)
		};
		let hash = this._getHash(order.side);
		let node = hash[order.price.toString()];
		if (!node || !node.orders || !node.orders.length) {
			node = { orders: [] };
			hash[order.price.toString()] = node;
		}
		node.orders.push(order);
		this._ordersById[order.id] = order;
	}
	removeOrder(orderId){
		let order = this._ordersById[orderId];
		if(!order) return;
		let hash = this._getHash(order.side);
		let node = hash[order.price.toString()];
		if (!node) throw new Error(`Error removing order with id, does not exist: ${order.orderId}`);
		node = {orders: node.orders.filter((storedOrder) => storedOrder.id != order.id)};
		hash[order.price.toString()] = node;
		if(!node.orders.length) delete hash[order.price.toString()];
		delete this._ordersById[order.id];
	}
}

exports = module.exports = Book;