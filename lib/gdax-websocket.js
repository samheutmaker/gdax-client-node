const EventEmitter = require('events').EventEmitter;
const Websocket = require('ws');

class GdaxWebSocket extends EventEmitter {
	constructor(productId = 'ETH-USD', URI = 'wss://ws-feed.gdax.com') {
		super();
		this.productId = 'ETH-USD';
		this.URI = URI;
		this.socket = null;
		this.pingInterval = null;
		this.connect();
	}
	connect() {
		this.socket = new Websocket(this.URI);
		this.socket.on('open', () => this.onOpen());
		this.socket.on('message', data => this.onMessage(data));
		this.socket.on('error', err => this.onError(err));
		this.socket.on('close', () => this.onClose(data));
		
	}
	onOpen() {
		this.emit('open');
		let subscribe = {
			type: 'subscribe',
			product_ids: [this.productId]
		};
		this.socket.send(JSON.stringify(subscribe));
		this.pingInterval = setInterval(() => this.socket.ping('keepalive'), 30000);
	}
	onMessage(data) {
		this.emit('message', JSON.parse(data));
	}
	onError(err) {
		if(!err) return;
		if(err.message.indexOf('429') > -1) {
			throw new Error('Websockets are beging throttled. Subscribe to all books on same connection');
		}
		self.emit('error', err);
	}
	onClose() {
		clearInterval(this.pinger);
		this.socket = null;
		this.emit('close');
	}
}



module.exports = exports = GdaxWebSocket;