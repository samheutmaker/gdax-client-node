const GdaxWebSocket = require('./gdax-websocket');
const PublicClient = require('./public-client');
const Book = require('./book');

class RealtimeBook extends GdaxWebSocket {
  constructor(productId = 'ETH-USD', apiURI = 'https://api.gdax.com', websocketURI = 'wss://ws-feed.gdax.com', debugLevel = 'INFO') {
    super(productId, websocketURI);

    this.productId = productId;
    this.apiURI = apiURI;
    this.websocketURI = websocketURI;

    this.book = new Book();
    this._queue = [];
    this._sequence = -1;
    this._publicClient;
    this._debugLevel = debugLevel;
    this._initialize()
      .then(() => {
      	if(this._debugLevel == 'INFO') console.log('Initial book and queue loaded -- streaming live');
      })
      .catch(() => {
      	console.warn('Failed to load initial book -- retrying');
      	this._initialize();
      });
  }
  _initialize() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.book = new Book();
        this._queue = [];
        this._sequence = -1;
        this._publicClient = new PublicClient(this.productId, this.apiURI);

        this._loadBook()
          .then(() => this._processQueue())
          .then(() => resolve())
          .catch((err) => {
          	console.error(err);
          	reject(err)
          });
      }, 1000);
    });
  }
  _processQueue() {
    return new Promise((resolve) => {
      this._queue = this._queue.filter(q => q.sequence > this._sequence);
      while (this._queue.length) {
        let q = this._queue.shift();
        this._processMessage(q);
      }
      resolve();
    });
  }
  _processMessage(data) {
    if (this._sequence === -1) return console.log('Waiting for initial book');
    if (this._sequence + 1 != data.sequence) return console.error('Missed a packet');
    this._sequence = data.sequence;
    switch (data.type) {
      case 'open':
        if (this._debugLevel == 'INFO') console.log(`Add Order: ${data.order_id}`)
        this.book.addOrder(data);
        break;
      case 'done':
        if (this._debugLevel == 'INFO') console.log(`Remove Order: ${data.order_id}`)
        this.book.removeOrder(data.order_id);
        break;
      case 'match':
        if (this._debugLevel == 'INFO') console.log(`Match Order: ${data.maker_order_id}`)
        this.book.matchOrder(data);
        break;
      case 'change':
        if (this._debugLevel == 'INFO') console.log(`Change Order: ${data.order_id}`)
        this.book.changeOrder(data);
        break;
    }
  }
  _loadBook() {
    return this._publicClient.getBook({
        level: 3
      })
      .then((res) => {
        let data = res.body;
        this.book.setState(data);
        this._sequence = data.sequence;
      })
      .catch((err) => console.error(err));
  }
  onMessage(data) {
    super.onMessage(data);
    data = JSON.parse(data);

    if (this._sequence + 1 === data.sequence) {
      this._processMessage(data);
    } else {
      this._queue.push(data);
    }
  }
}

module.exports = exports = RealtimeBook;