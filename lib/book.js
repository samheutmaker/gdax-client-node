const num = require('num');

class Book {
  constructor() {
    this._ordersById = {};
    this._bidsByPrice = {};
    this._asksByPrice = {};
  }
  _getHash(side) {
    return side == 'buy' ? this._bidsByPrice : this._asksByPrice;
  }

  /**
   * Update the books state from a GDAX API repsonse;
   * @param {Object} book - A GDAX API repsonse
   *
   * @param {Array[Array]} book.bids - The current bids on the order book
   * @param {String} book.bids[0] - The bid price
   * @param {String} book.bids[1] - The bid size
   * @param {String} book.bids[2] - The bid id
   *
   * @param {Array[Array]} book.asks - The current asks on the order book
   * @param {String} book.asks[0] - The ask price
   * @param {String} book.asks[1] - The ask size
   * @param {String} book.asks[2] - The ask id
   *
   * @returns {Undefined}
   */
  setState(book = {}) {
    let parseAddOrder = (order, side) => {
      order = {
        id: order[2],
        side: side,
        price: num(order[0]),
        size: num(order[1])
      };
      this.addOrder(order);
    };

    book.bids.forEach((order) => parseAddOrder(order, 'buy'));
    book.asks.forEach((order) => parseAddOrder(order, 'sell'));
  }

  /**
   * Get the current state of the book
   * @returns {Object} Returns book with current bids and asks
   */
  getState() {
    let getOrdersFromBook = (ordersByPrice = {}) => {
      return Object.keys(ordersByPrice).reduce((cur, key) => {
        return [...cur, ...ordersByPrice[key].orders];
      }, []);
    };

    return {
      bids: getOrdersFromBook(this._bidsByPrice),
      asks: getOrdersFromBook(this._asksByPrice),
    };
  }

  /**
   * Get an order by Id
   * @param {String} orderId - The ID the order to be returned
   * @returns {Object} The specifed order
   */
  getOrder(orderId) {
    return this._ordersById[orderId];
  }

  /**
   * Add an order to the book
   * @param {Object} order - The order to be added to the book
   * @param {String} order._id || order.id - The id of the order
   * @param {String} order.price - The price of the order
   * @param {String} order.size || order.remaining_size - The size of the order
   * @returns {Undefined}
   */
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
      node = {
        orders: []
      };
      hash[order.price.toString()] = node;
    }
    node.orders.push(order);
    this._ordersById[order.id] = order;
  }

  /**
   * Remove an order from the book
   * @param {String} orderId - The ID of the order to be removed
   * @returns {Undefined}
   */
  removeOrder(orderId) {
    let order = this._ordersById[orderId];
    if (!order) return;
    let hash = this._getHash(order.side);
    let node = hash[order.price.toString()];
    if (!node) throw new Error(`Error removing order with id, does not exist: ${order.orderId}`);
    node = {
      orders: node.orders.filter((storedOrder) => storedOrder.id != order.id)
    };
    hash[order.price.toString()] = node;
    if (!node.orders.length) delete hash[order.price.toString()];
    delete this._ordersById[order.id];
  }
  match(match) {
    let size = num(size);
    let price = num(match.price);
    let hash = this._getHash(match.side);
    let node = hash[price];
    if (!node) throw new Error(`Error matching order with price, does not exist: ${price}`);
    let order = node.orders.find((order) => order.id == match.maker_order_id);
    if (!order) throw new Error(`Error matching order with id, does not exist: ${match.maker_order_id}`);
    order.size = order.size.sub(size);
    this._ordersById[order.id] = order;
    if (order.size.eq(0)) this.remove(order.id);
  }
  change(change) {
    let size = num(change.new_size);
    let price = num(change.price);
    let order = this.getOrder(change.order_id);
    let hash = this._getHash(change.side);
    let node = hash[price];
    if (!node || node.orders.indexOf(order) < 0) return;
    let nodeOrder = node.orders[node.orders.indexOf(order)];
    let newSize = parseFloat(order.size);
    let oldSize = parseFloat(change.old_size);
    if (oldSize != newSize) throw new Error(`Error changing order with id, incorrect size: ${order.order_id}`);
    nodeOrder.size = size;
    this._ordersById[nodeOrder.id] = nodeOrder;
  }
}

exports = module.exports = Book;