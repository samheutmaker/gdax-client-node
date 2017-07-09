const colors = require('colors');

const VERBOSE = 'VERBOSE';
const INFO = 'INFO';
const WARN = 'WARN';
const ERROR = 'ERROR';

const levels = {
  VERBOSE,
  INFO,
  WARN,
  ERROR
};

const defaultConfig = {
  level: 'INFO',
  include: ['open', 'done', 'match', 'change']
}

class BookLogger {
  constructor(loggerConfig = defaultConfig) {
    let loggers = {
      open: this._logOpen,
      done: this._logDone,
      match: this._logMatch,
      change: this._logChange
    };

    this.level = levels[loggerConfig.level];
    this.loggers = loggerConfig.include.reduce((cur, type) => {
      cur[type] = loggers[type];
      return cur;
    }, {});
  }
  _getPrice(data) {
    if (!data.price) return `Reason: ${colors.bold(colors.green(data.reason.toUpperCase()))}`;
    let isSell = data.side == 'sell';
    let price = `$${data.price.toString().substring(0, 6)}${isSell ? '\u2191' : '\u2193' }`;
    return `Price: ${isSell ? colors.green(price) : colors.red(price)}`;
  }
  _getSize(data) {
    let size = data.size || data.remaining_size;
    if (!size) return;
    return `Size: ${(size).toString().substring(0, 10)}`;
  }
  _getType(data) {
    let output = `[${data.type.toUpperCase().substring(0,4)}]`;

    let dataColors = {
      open: colors.green,
      done: colors.red,
      match: colors.yellow,
      change: colors.blue
    };

    return colors.bold(dataColors[data.type](output));
  }
  _getInfo(data) {
    return `${this._getType(data)}  ${this._getSize(data)}  ${this._getPrice(data)}`;
  }
  _logOpen(data) {
    return `${this._getInfo(data)}`;
  }
  _logDone(data) {
    return `${this._getInfo(data)}`;
  }
  _logMatch(data) {
    return `${this._getInfo(data)} Maker ID: ${data.maker_order_id}  Taker ID: ${data.taker_order_id}`;
  }
  _logChange(data) {
    return `${this._getInfo(data)}`;
  }
  log(data) {
    let logger = this.loggers[data.type];
    if (logger) {
      let output = logger.call(this, data);
      console.log(output);
    };
  }

}

module.exports = exports = BookLogger;