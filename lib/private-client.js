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

  /**
   * Create a URL from uriParts
   * @param {Array} uriParts - The URI pieces of the request address
   * @param {Boolean} isRelative - [optional] Indicates whether the returned url should be fully qualified
   * @returns {Promise}
   */
  _route(uriParts, isRelative = false) {
    let relative = `/${uriParts.join('/')}`;
    if (isRelative) return relative;
    return `${this.apiURL}${relative}`;
  }

  /**
   * Sign an authenticated request
   * @param {Number} timestamp - The current seconds since epoch
   * @param {String} method - The method of the request
   * @param {String} url - The url of the request to be made
   * @param {Object} postBody - [optional] The request post body or querystring parameters
   * @returns {Promise}
   */
  _signRequest(timestamp, method, url, postBody) {
    let signature = timestamp + method + url + postBody;
    let key = Buffer(this._secret, 'base64');
    let hmac = crypto.createHmac('sha256', key);
    return hmac.update(signature).digest('base64');
  }

  /**
   * Make an HTTP request
   * @param {String} method - The method of the HTTP request
   * @param {Array} uriParts - The URI pieces of the request address
   * @param {Object} query - [optional] The request url querystring parameters
   * @param {Object} postBody - [optional] The request post body
   * @returns {Promise}
   */
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
   * List trading accounts
   * @returns {Promise}
   */
  listAccounts() {
    let method = 'GET';
    let uriParts = ['accounts'];
    return this._request(method, uriParts);
  }

  /**
   * Get information for a single trading account.
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getAccount(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId];
    return this._request(method, uriParts);
  }

  /**
   * Get account historical information.
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getAccountHistory(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'ledger'];
    return this._request(method, uriParts);
  }

  /**
   * Get current holds on an account.
   * @param {String} accountId - The ID of the account
   * @returns {Promise}
   */
  getHolds(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'holds'];
    return this._request(method, uriParts);
  }

  /**
   * Get an order.
   * @param {String} orderId - The ID of the order
   * @returns {Promise}
   */
  getOrder(orderId) {
    let method = 'GET';
    let uriParts = ['orders', orderId];
    return this._request(method, uriParts)
  }

  /**
   * Get currently open orders.
   * @param {Object} params - The request parameters
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
   * Place a new order.
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

  /**
   * Place a buy order.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.client_oid - Order ID selected to identify your order
   * @param {String} postBody.product_id - The ID of the product to place an order of
   * @param {String} postBody.type - [optional] limit, market, or stop (default is limit)
   * @param {String} postBody.stp - [optional] Self-trade prevention flag
   * @returns {Promise}
   */
  buy(postBody) {
    postBody.side = 'buy';
    return this.placeOrder(postBody);
  }

  /**
   * Place a sell order.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.client_oid - Order ID selected to identify your order
   * @param {String} postBody.product_id - The ID of the product to place an order of
   * @param {String} postBody.type - [optional] limit, market, or stop (default is limit)
   * @param {String} postBody.stp - [optional] Self-trade prevention flag
   * @returns {Promise}
   */
  sell(postBody) {
    postBody.side = 'sell';
    return this.placeOrder(postBody);
  }

  /**
   * Cancel an existing order.
   * @param {String} orderId - The ID of the order to cancel
   * @returns {Promise}
   */
  cancelOrder(orderId) {
    let method = 'DELETE';
    let uriParts = ['orders', orderId];
    return this._request(method, uriParts);
  }

  /**
   * Cancel all existing orders.
   * @param {Object} params - The request parameters
   * @param {String} params.product_id - [optional] Only cancel orders open for a specific product
   * @returns {Promise}
   */
  cancelAllOrders(params) {
    let method = 'DELETE';
    let uriParts = ['orders'];
    return this._request(method, uriParts, params);
  }

  /**
   * Get a list of recent fills.
   * @param {Object} params - The request parameters
   * @param {String} params.order_id - [optional] Limit list of fills to this order_id
   * @param {String} params.product_id - [optional] Limit list of fills to this product_id
   * @returns {Promise}
   */
  getFills(params = {}) {
    let method = 'GET';
    let uriParts = ['fills'];
    return this._request(method, uriParts, params);
  }

  /**
   * List outstanding fundings -- for margin trading only.
   * @param {Object} params - The request parameters
   * @param {String} params.status - [optional] Limit list of funding to outstanding, settled, or rejected
   * @returns {Promise}
   */
  listFundings(params) {
    let method = 'GET';
    let uriParts = ['funding'];
    return this._request(method, uriParts, params);
  }


  /**
   * Repay funding. Repays the older funding records first.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount of curreny to repay
   * @param {String} postBody.currency - The curency, example BTC or ETH
   * @returns {Promise}
   */
  repayFunding(postBody) {
    let method = 'POST';
    let uriParts = ['funding', 'repay'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Transfer funds between your standard/default profile and a margin profile -- margin trading only.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.margin_profile_id - The id of the margin profile you’d like to deposit to or withdraw from
   * @param {String} postBody.type - The type of transfer, supports deposit or withdraw
   * @param {String} postBody.currency - The currency to transfer, currently only BTC or USD
   * @param {String} postBody.amount - The amount to transfer between the default and margin profil
   * @returns {Promise}
   */
  marginTransfer(postBody) {
    let method = 'POST';
    let uriParts = ['profiles', 'margin-transfer'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Get an overview of your profile.
   * @returns {Promise}
   */
  getPosition() {
    let method = 'GET';
    let uriParts = ['position'];
    return this._request(method, uriParts, null);
  }

  /**
   * Close a position.
   * @param {Object} postBody - The request post body
   * @param {Boolean} postBody.repay_only - true of false
   * @returns {Promise}
   */
  closePosition(postBody) {
    let method = 'POST';
    let uriParts = ['position', 'close'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Deposit funds from a payment method.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount to deposit
   * @param {String} postBody.currency - The type of currency
   * @param {String} postBody.payment_method_id - The ID of the payment method
   * @returns {Promise}
   */
  depositFunds(postBody) {
    let method = 'POST';
    let uriParts = ['deposits', 'payment-method'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Deposit funds from a coinbase account.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount to deposit
   * @param {String} postBody.currency - The type of currency
   * @param {String} postBody.coinbase_account_id - The ID of the coinbase account
   * @returns {Promise}
   */
  depositFundsCoinbase(postBody) {
    let method = 'POST';
    let uriParts = ['deposits', 'coinbase-account'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Withdraw funds to a payment method.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount to deposit
   * @param {String} postBody.currency - The type of currency
   * @param {String} postBody.payment_method_id - The ID of the payment method
   * @returns {Promise}
   */
  withdrawFunds(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'payment-method'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Withdraw funds to a coinbase account.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount to deposit
   * @param {String} postBody.currency - The type of currency
   * @param {String} postBody.coinbase_account_id - The ID of the coinbase account
   * @returns {Promise}
   */
  withdrawFundsCoinbase(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'coinbase'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Withdraw funds to a crypto address.
   * @param {Object} postBody - The request post body
   * @param {String} postBody.amount - The amount to deposit
   * @param {String} postBody.currency - The type of currency
   * @param {String} postBody.crypto_address - The crypto address of the recipient
   * @returns {Promise}
   */
  withdrawFundsCrypto(postBody) {
    let method = 'POST';
    let uriParts = ['withdrawals', 'crypto'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Get a list of your payment methods.
   * @returns {Promise}
   */
  listPaymentMethods() {
    let method = 'GET';
    let uriParts = ['payment-methods'];
    return this._request(method, uriParts, null);
  }

  /**
   * Get a list of your coinbase accounts.
   * @returns {Promise}
   */
  listCoinbaseAccounts() {
    let method = 'GET';
    let uriParts = ['coinbase-accounts'];
    return this._request(method, uriParts, null);
  }

  /**
   * Create a new report
   * @param {String} postBody.type - fills or account
   * @param {String} postBody.start_date - Starting date for the report (inclusive)
   * @param {String} postBody.end_date - Ending date for the report (inclusive)
   * @param {String} postBody.product_id - ID of the product to generate a fills report for. E.g. BTC-USD. Required if type is fills
   * @param {String} postBody.account_id - ID of the account to generate an account report for. Required if type is account
   * @param {String} postBody.format - pdf or csv (defualt is pdf)
   * @param {String} postBody.email - [optional] Email address to send the report to
   * @returns {Promise}
   */
  createReport(postBody) {
    let method = 'POST';
    let uriParts = ['reports'];
    return this._request(method, uriParts, null, postBody);
  }

  /**
   * Get the status of a report
   * @param {String} reportId - The id of the report to retrieve
   * @returns {Promise}
   */
  getReport(reportId) {
    let method = 'GET';
    let uriParts = ['reports', reportId];
    return this._request(method, uriParts);
  }

  /**
   * Get 30-day trailing volume for all products
   * @returns {Promise}
   */
  getTrailingVolume() {
    let method = 'GET';
    let uriParts = ['users', 'self', 'trailing-volume'];
    return this._request(method, uriParts);
  }

}

module.exports = exports = PrivateClient;