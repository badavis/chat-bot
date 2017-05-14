const mongo = require('./lib/mongo');
const scrubData = require('./lib/scrub').scrubData;
const consume = require('./lib/consume').consume;

// Main
init().then(() => {
  return getSeedData().then(seedData => {
    const cleanData = scrubData(seedData);
    return consume(cleanData);
  }).then(() => {
    mongo.db().close();
  });
}).catch(err => {
  console.log('init:', err);
});

// Helpers

function getSeedData() {
  return mongo.find({}, 'seedData').then(seedData => {
    if (!seedData) {
      console.log('No seed data');
      return Promise.resolve('');
    }

    return Promise.resolve(seedData[0].text);
  });
}

function init() {
  console.log('connecting to mongodb...');
  return mongo.db().then(() => {
    console.log('connected');
    return Promise.resolve();
  }).catch(err => {
    console.log(err);
  });
}
