const GdaxWebSocket = require('./gdax-websocket');
const Book = require('./book');

class RealtimeBook extends GdaxWebSocket {
  constructor(productId = 'ETH-USD', apiURI = 'https://api.gdax.com', websocketURI = 'wss://ws-feed.gdax.com') {
    super(productId, websocketURI);

    this.productId = productId;
    this._queue = [];
    this.sequence = -1;
    this.client = ;
    this.book = new Book();
  }
}

module.exports = exports = RealtimeBook;