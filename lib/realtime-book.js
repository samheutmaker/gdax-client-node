const GdaxWebSocket = require('./gdax-websocket');
const PublicClient = require('./public-client');
const Book = require('./book');

class RealtimeBook extends GdaxWebSocket {
  constructor(productId = 'ETH-USD', apiURI = 'https://api.gdax.com', websocketURI = 'wss://ws-feed.gdax.com') {
    super(productId, websocketURI);

    this.productId = productId;
    this.apiURI = apiURI;
    this.websocketURI = websocketURI;

    this.book;
    this._queue = [];
    this._sequence = -1;
    this._publicClient;
    this._initialize()
    .then(() => console.log('Initial book and queue loaded -- streaming live'));

  }
  _initialize() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.book = new Book({debugLevel: 'INFO'});
        this._queue = [];
        this._sequence = -1;
        this._publicClient = new PublicClient(this.productId, this.apiURI);

        this.loadBook()
          .then(() => this._processQueue())
          .then(() => resolve())
          .catch((err) => console.error(err) || reject(err));
      }, 1000);
    });
  }
  _processQueue() {
  	return new Promise((resolve) => {
  		this._queue = this._queue.filter(q => q.sequence > this._sequence);
	     while(this._queue.length) {
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
        this.book.addOrder(data);
        break;
      case 'done':
        this.book.removeOrder(data.order_id);
        break;
      case 'match':
        this.book.matchOrder(data);
        break;
      case 'change':
        this.book.changeOrder(data);
        break;
    }
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
  loadBook() {
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

}

module.exports = exports = RealtimeBook;