const agent = require('superagent-promise')(require('superagent'), Promise);

const API_LIMIT = 100;
const handleResponse = res => res;
const handleError = (err) => {
  throw new Error(err);
  return err;
}

class PublicClient {
  constructor(productId = 'ETH-USD', apiURL = 'https://api.gdax.com') {
    this.productId = productId;
    this.apiURL = apiURL;
  }
  _route(uriParts) {
    return `${this.apiURL}/${uriParts.join('/')}`;
  }
  _request(method, url, query = {}, postBody = {}) {
    return agent(method, url)
      .query(query)
      .send(postBody)
      .end()
      .then(handleResponse)
      .catch(handleError);
  }

  /**
   * Get information about all products
   * @returns {Promise}
   */
  getProducts() {
    let method = 'GET';
    let url = this._route(['products']);
    return this._request(method, url);
  }

  /**
   * Get Product Book 
   * @param {Object} params - The request paramters
   * @param {String} params.level - The repsonse detail level
   * @returns {Promise}
   */
  getBook(params = { level: '3' }) {
    let method = 'GET';
    let url = this._route(['products', this.productId, 'book']);
    return this._request(method, url, params);
  }

  /**
   * Get last trade (tick), best bid/ask and 24h volume.
   * @returns {Promise}
   */
  getTicker() {
    let method = 'GET';
    let url = this._route(['products', this.productId, 'ticker']);
    return this._request(method, url);
  }

  /**
   * Get the latest trades for a product.
   * @returns {Promise}
   */
  getTrades() {
    let method = 'GET';
    let url = this._route(['products', this.productId, 'trades']);
    return this._request(method, url);
  }

  /**
   * Get Historic Rates (Candlesticks)
   * @param {Object} params - The request paramters
   * @param {String} params.start - Start time in ISO 8601
   * @param {String} params.end - End time in ISO 8601
   * @param {Number} params.granularity - Desired timeslice in seconds
   * @returns {Promise}
   */
  getHistoricRates(params = {}) {
    let method = 'GET';
    let url = this._route(['products', this.productId, 'candles']);
    return this._request(method, url, params);
  }

  getAllHistoricRates(){
  	
  }

  /**
   * Get 24 hr stats. Volume is in base currency units. open, high, low are in quote currency units.
   * @returns {Promise}
   */
  get24HourStats() {
    let method = 'GET';
    let url = this._route(['products', this.productId, 'stats']);
    return this._request(method, url);
  }

  /**
   * List known currencies.
   * @returns {Promise}
   */
  getCurrencies() {
    let method = 'GET';
    let url = this._route(['currencies']);
    return this._request(method, url);
  }

  /** 
   * Get the API server time.
   * @returns {Promise}
   */
  getTime() {
    let method = 'GET';
    let url = this._route(['time']);
    return this._request(method, url);
  }

}

module.exports = exports = PublicClient;