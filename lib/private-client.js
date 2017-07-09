const crypto = require('crypto');
const agent = require('superagent-promise')(require('superagent'), Promise);

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
    let signature = timestamp + method + url + JSON.stringify(postBody);
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
      postBody
    );

    let headers = {
      'CB-ACCESS-KEY': this._key,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': this._passphrase
    };
    return agent(method, this._route(uriParts))
      .set(headers)
      .query(query)
      .send(postBody)
      .end()
      .then(this._handleResponse)
      .catch(this._handleError);
  }
  getAccounts() {
    let method = 'GET';
    let uriParts = ['accounts'];
    return this._request(method, uriParts);
  }
  getAccount(accountId){
  	let method = 'GET';
  	let uriParts = ['accounts', accountId];
  	return this._request(method, uriParts);
  }
  getAccountHistory(accountId){
  	let method = 'GET';
  	let uriParts = ['accounts', accountId, 'ledger'];
  	return this._request(method, uriParts);	
  }
  getHolds(accountId){
  	let method = 'GET';
  	let uriParts = ['accounts', accountId, 'holds'];
  	return this._request(method, uriParts);	
  }
}

module.exports = exports = PrivateClient;