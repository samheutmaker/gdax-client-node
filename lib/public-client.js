const agent = require('superagent-promise')(require('superagent'), Promise);

class PublicClient {
  constructor(productId = 'ETH-USD', apiURL = 'https://api.gdax.com') {
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
  _request(method, url, query = {}, postBody = {}) {
    return agent(method, url)
      .query(query)
      .send(postBody)
      .end()
      .then(this._handleResponse)
      .catch(this._handleError);
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
  getBook(params = {
    level: '3'
  }) {
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

    // The max number of candles allowed in a single response
    let maxResults = 450;
    let startSeconds = Date.parse(params.start) / 1000;
    let endSeconds = Date.parse(params.end) / 1000;
    let intervalSeconds = endSeconds - startSeconds;
    let numberOfCandles = intervalSeconds / params.granularity;

    console.log(intervalSeconds)

    if (numberOfCandles > maxResults) {
      let maxIntervalSeconds = maxResults * params.granularity;
      let requests = [];
      let requestEndSeconds = startSeconds + maxIntervalSeconds;

      while (requestEndSeconds < endSeconds) {
        requestEndSeconds = startSeconds + maxIntervalSeconds;
        let end = requestEndSeconds >= endSeconds ? new Date(endSeconds * 1000).toISOString() :
          new Date(requestEndSeconds * 1000).toISOString();
        let requestParams = {
          start: new Date(startSeconds * 1000).toISOString(),
          end: end,
          granularity: params.granularity
        };
        requests.push(requestParams);
        startSeconds = requestEndSeconds;
      }
      return Promise.all(requests.map(this.getHistoricRates.bind(this)))
        .then(res => {
          let results = res.reduce((cur, next) => {
            return [...cur, ...next.body];
          }, []);

          return results;
        })
        .catch(this._handleError)
    }
    return this._request(method, url, params);
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