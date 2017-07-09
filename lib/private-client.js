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
  _route(uriParts) {
    return `${this.apiURL}/${uriParts.join('/')}`;
  }
  _signRequest(timestamp, method, url, postBody) {
    let signature = timestamp + method + url + JSON.stringify(postBody);
    // decode the base64 secret
    let key = Buffer(this._secret, 'base64');
    // create a sha256 hmac with the secret

    let hmac = crypto.createHmac('sha256', key);
    // sign the require message with the hmac
    // and finally base64 encode the result
    return hmac.update(signature).digest('base64');
  }
  _request(method, url, query = {}, postBody = {}) {
    let timestamp = Date.now() / 1000;
    let signature = this._signRequest(timestamp, method, '/accounts', postBody);
    let headers = {
      'CB-ACCESS-KEY': this._key,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': this._passphrase
    };
    return agent(method, url)
      .set(headers)
      .query(query)
      .send(postBody)
      .end()
      .then(this._handleResponse)
      .catch(this._handleError);
  }
  getAccounts() {
    let method = 'GET';
    let url = this._route(['accounts']);
    return this._request(method, url);
  }
}

module.exports = exports = PrivateClient;