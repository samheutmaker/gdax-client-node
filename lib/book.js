const createTree = require("functional-red-black-tree");
const num = require('num')

let comparator = (a, b) => {
	return a.cmp(b);
}

let count = 0;

class Book {
	constructor() {
		this._ordersById = {};
		this._ordersByPrice = {};
	}
	_getTree(side) {
		return side == 'buy' ? this._bids : this._asks;
	}
	_setTree(side, newTree) {
		if (side == 'buy') {
			this._bids = newTree;
		} else {
			this._asks = newTree;
		}
		return this._getTree(side);
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
		let tree = this._getTree(order.side);
		let node = tree.find(order.price);
		if (!node.orders || !node.orders.length) {
			node = {
				orders: []
			};
			tree = this._setTree(order.side, tree.insert(order.price, node));
		}
		node = tree.find(order.price);
		node.value.orders.push(order);
		this._ordersById[order.id] = order;
	}
	removeOrder(orderId) {
		let order = this._ordersById[orderId];
		if (!order) return;
		let tree = this._getTree(order.side);
		let node = tree.find(order.price);
		if (!node) throw new Error(`Error removing order with id, does not exist: ${order.orderId}`);
		let orders = node.value.orders;
		orders.splice(orders.indexOf(order), 1);
		if (!orders.length) {
			count++;
			this._setTree(order.side, tree.remove(order.price));
		}
		delete this._ordersById[order.id];
	}
}

exports = module.exports = Book;