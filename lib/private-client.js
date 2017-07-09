const crypto = require('crypto');
const agent = require('superagent-promise')(require('superagent'), Promise);

let hasKeys = obj => obj && Object.keys(obj).length > 0;

let serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

class PrivateClient {
  constructor(passphrase = '', key = '', secret = '', productId = 'ETH-USD', apiURL = 'https://api.gdax.com') {
    this._passphrase = passphrase;
    this._key = key;
    this._secret = secret;
    this.productId = productId;
    this.apiURL = apiURL;
  }
  _handleResponse(res) {
    return res;
  }
  _handleError(err) {
    throw err;
    return err;
  }
  _route(uriParts, isRelative = false) {
    let relative = `/${uriParts.join('/')}`;
    if (isRelative) return relative;
    return `${this.apiURL}${relative}`;
  }
  _signRequest(timestamp, method, url, postBody) {
    let signature = timestamp + method + url + postBody;
    let key = Buffer(this._secret, 'base64');
    let hmac = crypto.createHmac('sha256', key);
    return hmac.update(signature).digest('base64');
  }
  _request(method, uriParts, query = {}, postBody = {}) {
    let timestamp = Date.now() / 1000;

    let signature = this._signRequest(
      timestamp,
      method,
      this._route(uriParts, true),
      hasKeys(query) ? '?' + serialize(query) : hasKeys(postBody) ? JSON.stringify(postBody) : ''
    );

    let headers = {
      'CB-ACCESS-KEY': this._key,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': this._passphrase
    };

    let request = agent(method, this._route(uriParts)).set(headers);

    if (method == 'GET' || method == 'DELETE') {
      return request
        .query(query)
        .end()
        .then(this._handleResponse)
        .catch(this._handleError);
    }

    if (method == 'POST') {
      return request
        .send(postBody)
        .end()
        .then(this._handleResponse)
        .catch(this._handleError);
    }
  }

  /**
   * Get a list of trading accounts
   * @returns {Promise}
   */
  listAccounts() {
    let method = 'GET';
    let uriParts = ['accounts'];
    return this._request(method, uriParts);
  }

  /**
   * Get information for a single trading account
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getAccount(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId];
    return this._request(method, uriParts);
  }

  /**
   * Get account historical information
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getAccountHistory(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'ledger'];
    return this._request(method, uriParts);
  }

  /**
   * Get current holds on an account
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getHolds(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'holds'];
    return this._request(method, uriParts);
  }

  /**
   * Get an order
   * @param {String} orderId - The ID of the order
   * @returns {Promise}
   */
  getOrder(orderId) {
    let method = 'GET';
    let uriParts = ['orders', orderId];
    return this._request(method, uriParts)
  }

  /**
   * Get currently open orders
   * @param {Object} params - The request paramters
   * @param {String} params.status - Limit the response to open, pending, active or all orders
   * @param {String} params.product_id - Limit the response to orders for a specific product
   * @returns {Promise}
   */
  listOrders(params) {
    let method = 'GET';
    let uriParts = ['orders'];
    return this._request(method, uriParts, params)
  }

  /**
   * Get currently open orders
   * @param {Object} postBody - The request post body
   * @param {String} postBody.client_oid - Order ID selected to identify your order
   * @param {String} postBody.side - buy or sell
   * @param {String} postBody.product_id - The ID of the product to place an order of
   * @param {String} postBody.type - [optional] limit, market, or stop (default is limit)
   * @param {String} postBody.stp - [optional] Self-trade prevention flag
   * @returns {Promise}
   */
  placeOrder(postBody) {
    let method = 'POST';
    let uriParts = ['orders'];
    return this._request(method, uriParts, null, postBody);
  }
  buy(postBody) {
    postBody.side = 'buy';
    return this.placeOrder(postBody);
  }
  sell(postBody) {
    postBody.side = 'sell';
    return this.placeOrder(postBody);
  }
  cancelOrder(orderId) {
    let method = 'DELETE';
    let uriParts = ['orders', orderId];
    return this._request(method, uriParts);
  }
  cancelAllOrders(params) {
    let method = 'DELETE';
    let uriParts = ['orders'];
    return this._request(method, uriParts, params);
  }
  getFills(params = {}) {
    let method = 'GET';
    let uriParts = ['fills'];
    return this._request(method, uriParts, params);
  }
  listFundings(params) {
    let method = 'GET';
    let uriParts = ['funding'];
    return this._request(method, uriParts, params);
  }
  repayFunding(postBody) {
    let method = 'POST';
    let uriParts = ['funding', 'repay'];
    return this._request(method, uriParts, null, postBody);
  }
  marginTransfer(postBody) {
    let method = 'POST';
    let uriParts = ['profiles', 'margin-transfer'];
    return this._request(method, uriParts, null, postBody);
  }
  getPosition() {
    let method = 'GET';
    let uriParts = ['position'];
    return this._request(method, uriParts, null);
  }
  closePosition(postBody) {
    let method = 'POST';
    let uriParts = ['position', 'close'];
    return this._request(method, uriParts, null, postBody);
  }
  depositFunds(postBody) {
    let method = 'POST';
    let uriParts = ['deposits', 'payment-method'];
    return this._request(method, uriParts, null, postBody);
  }
  depositFundsCoinbase(postBody) {
    let method = 'POST';
    let uriParts = ['deposits', 'coinbase-account'];
    return this._request(method, uriParts, null, postBody);
  }
  withdrawFunds(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'payment-method'];
    return this._request(method, uriParts, null, postBody);
  }
  withdrawFundsCoinbase(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'coinbase'];
    return this._request(method, uriParts, null, postBody);
  }
  withdrawFundsCrypto(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'crypto'];
    return this._request(method, uriParts, null, postBody);
  }
  listPaymentMethods() {
    let method = 'GET';
    let uriParts = ['payment-methods'];
    return this._request(method, uriParts, null);
  }
  listCoinbaseAccounts() {
    let method = 'GET';
    let uriParts = ['coinbase-accounts'];
    return this._request(method, uriParts, null);
  }
  createReport(postBody) {
    let method = 'POST';
    let uriParts = ['reports'];
    return this._request(method, uriParts, null, postBody);
  }
  getReport(reportId) {
    let method = 'GET';
    let uriParts = ['reports', reportId];
    return this._request(method, uriParts);
  }
  getTrailingVolume() {
    let method = 'GET';
    let uriParts = ['users', 'self', 'trailing-volume'];
    return this._request(method, uriParts);
  }

}

module.exports = exports = PrivateClient;