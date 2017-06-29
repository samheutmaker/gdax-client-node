const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

const PublicClient = require('./../lib/public-client');
let client = new PublicClient();

describe('The GDAX public client', () => {

  // getProducts
  it('should get products', (done) => {
    client.getProducts()
      .then((res) => {
        expect(res).to.be.an('object');
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.not.equal(0);
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getBook
  it('should get product book at level 1', (done) => {
    client.getBook({
        level: 1
      })
      .then((res) => {
        expect(res).to.be.an('object');
        expect(res.body).to.be.a('object');
        expect(res.body.bids).to.be.a('array');
        expect(res.body.asks).to.be.a('array');
        expect(res.body.bids.length).to.equal(1);
        expect(res.body.asks.length).to.equal(1);
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });
  it('should get product book at level 2', (done) => {
    client.getBook({
        level: 2
      })
      .then((res) => {
        expect(res).to.be.an('object');
        expect(res.body).to.be.a('object');
        expect(res.body.bids).to.be.a('array');
        expect(res.body.asks).to.be.a('array');
        expect(res.body.bids.length).to.equal(50);
        expect(res.body.asks.length).to.equal(50);
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });
  it('should get product book at level 3', (done) => {
    client.getBook({
        level: 3
      })
      .then((res) => {
        expect(res).to.be.an('object');
        expect(res.body).to.be.a('object');
        expect(res.body.bids).to.be.a('array');
        expect(res.body.asks).to.be.a('array');
        expect(res.body.bids.length).to.be.above(50);
        expect(res.body.asks.length).to.be.above(50);
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getTicker
  it('should get product ticker', (done) => {
    client.getTicker()
      .then((res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('trade_id');
        expect(res.body).to.have.property('price');
        expect(res.body).to.have.property('size');
        expect(res.body).to.have.property('bid');
        expect(res.body).to.have.property('ask');
        expect(res.body).to.have.property('volume');
        expect(res.body).to.have.property('time');
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getTrades
  it('should get product trades', (done) => {
    client.getTrades()
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.not.equal(0);
        expect(res.body[0]).to.have.property('time');
        expect(res.body[0]).to.have.property('trade_id');
        expect(res.body[0]).to.have.property('price');
        expect(res.body[0]).to.have.property('size');
        expect(res.body[0]).to.have.property('side');
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getHistoricRates
  it('should get product historic rates', (done) => {
    let start = new Date('27 June 2017 14:48 UTC').toISOString();
    let end = new Date('27 June 2017 16:48 UTC').toISOString();
    client.getHistoricRates({
        start: start,
        end: end,
        granularity: 60
      })
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(120);
        // Check start time is equal to last response item time
        expect(new Date(res.body[res.body.length - 1][0] * 1000).toISOString()).to.equal(start);
        done()
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // get24HourStats 
  it('should get the 24hr stats', (done) => {
    client.get24HourStats()
      .then((res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('open');
        expect(res.body).to.have.property('high');
        expect(res.body).to.have.property('low');
        expect(res.body).to.have.property('volume');
        expect(res.body).to.have.property('last');
        expect(res.body).to.have.property('volume_30day');
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getCurrencies
  it('should list the currencies', (done) => {
    client.getCurrencies()
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.not.equal(0);
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

  // getTime
    it('should list the currencies', (done) => {
    client.getTime()
      .then((res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('iso');
        expect(res.body).to.have.property('epoch');
        done();
      })
      .catch((err) => {
        if (err != null) throw new Error(err);
        done();
      })
      .catch(done);
  });

})