const _ = require('lodash');
const mongo = require('./mongo');

// Main seed loop
async function consume(data) {
  for(var i = 0 ; i < data.length -1 ; i++) {
    await handleWord(data[i], data[i + 1]);
  }

  console.log('done');
  return Promise.resolve();
}

// Seed helper functions

const handleWord = (word, nextWord) => {
  const query = { word: word };
  return mongo.find(query, 'words')
    .then(result => {
      if (!result || result.length === 0) {
        return insertNewWord(word, nextWord);
      }

      const data = result[0];
      data.totalCount++;
      if (! data.nextWords.hasOwnProperty(nextWord)) {  // word is not a next word to the current word so create new object
        data.nextWords[nextWord] = {
          word: nextWord,
          count: 1,
          probability: (1 / data.totalCount) * 100
        }
      } else {
        data.nextWords[nextWord].count++;
      }

      return recalculateProbabilities(data, data.totalCount)
        .then(newData => mongo.updateOne({ _id: data._id }, newData, 'words'));
    })
    .catch(error => {
      console.log('error', error);
    })
}

const recalculateProbabilities = (data, totalCount) => {
  _.forEach(data.nextWords, (value, word) => {
    value.probability = (value.count / totalCount) * 100;
  });

  return Promise.resolve(data);
}

const insertNewWord = (word, nextWord) => {
  const data = {
    word: word,
    totalCount: 1,
    nextWords: {}
  };

  data.nextWords[nextWord] = {
    word: nextWord,
    count: 1,
    probability: 100
  };

  return mongo.insert(data, 'words')
    .then(data => Promise.resolve(data))
    .catch(error => Promise.reject(error))
}

exports.consume = consume;
exports.insertNewWord = insertNewWord;
