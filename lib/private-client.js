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
  getAccounts() {
    let method = 'GET';
    let uriParts = ['accounts'];
    return this._request(method, uriParts);
  }
  getAccount(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId];
    return this._request(method, uriParts);
  }
  getAccountHistory(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'ledger'];
    return this._request(method, uriParts);
  }
  getHolds(accountId) {
    let method = 'GET';
    let uriParts = ['accounts', accountId, 'holds'];
    return this._request(method, uriParts);
  }
  getOrder(orderId){
  	let method = 'GET';
  	let uriParts = ['orders', orderId];
  	return this._request(method, uriParts)
  }
  listOrders(params){
  	let method = 'GET';
  	let uriParts = ['orders'];
  	return this._request(method, uriParts, params)
  }
  placeOrder(postBody){
  	let method = 'POST';
  	let uriParts = ['orders'];
    return this._request(method, uriParts, null, postBody);	
  }
  buy(postBody){
  	postBody.side = 'buy';
  	return this.placeOrder(postBody);
  }
  sell(postBody){
  	postBody.side = 'sell';
  	return this.placeOrder(postBody);
  }
  cancelOrder(orderId){
  	let method = 'DELETE';
  	let uriParts = ['orders', orderId];
    return this._request(method, uriParts);	
  }
  cancelAllOrders(params){
  	let method = 'DELETE';
  	let uriParts = ['orders'];
    return this._request(method, uriParts, params);		
  }
  getFills(params = {}) {
    let method = 'GET';
    let uriParts = ['fills'];
    return this._request(method, uriParts, params);
  }
}

module.exports = exports = PrivateClient;