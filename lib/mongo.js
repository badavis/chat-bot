var MongoClient = require('mongodb').MongoClient

let host = process.env.HOST || 'localhost';
let port = process.env.PORT || '27017';
let database = process.env.DATABASE || 'chatbot';
let db;

exports.db = () => {
  if (typeof db === 'undefined') {
    db = MongoClient.connect(`mongodb://${host}:${port}/${database}`)
      .then(dbCursor => {
        db = dbCursor;
        return Promise.resolve(db);
      })
      .catch((err) => {
        edebug('Error connecting to Mongo...', err);
        throw err;
      });
  }
  return db;
};

const updateOne = (filter, newData, collection) => {
	return db.collection(collection)
		.updateOne(filter, { $set: newData })
		.then(result => Promise.resolve(result))
		.catch(error => Promise.reject('error', error));
}

const insert = (data, collection) => {
	return db.collection(collection)
		.insert(data)
		.then(result => Promise.resolve(result))
		.catch(error => Promise.reject('error', error));
}

const find = (data, collection) => {
	return db.collection(collection)
		.find(data)
		.toArray()
		.then(result => Promise.resolve(result))
		.catch(error => Promise.reject('error', error));
}

exports.insert = insert;
exports.find = find;
exports.updateOne = updateOne;
