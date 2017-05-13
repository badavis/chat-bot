const mongo = require('./mongo');
const seedData = require("../news");
const words = seedData.articles.split(' ');
const _ = require('lodash');

mongo.db()
  .then(data => {
    handleWord(words[0], words, 0);
  })

const handleWord = (word, words, i) => {
  if (i >= words.length)
    return;
  const query = { word: word };
  const nextWord = words[i+1];
  mongo.find(query, 'words')
    .then(data => {
      if (!data) {
        return insertNewWord(word, nextWord)
          .then(data => handleWord(words[i+1], words, i+1))
      }
      data.totalCount += 1;
      // if the word already exists update the next word list
      for(let j = 0; j < data.nextWords.length; j++) {
        if (data.nextWords[j].word === nextWord) {
          data.nextWords[j].count++;
          return recalulateProbability(data, data.totalCount)
            .then(newData => mongo.updateOne({ _id: data._id }, newData, 'words'))
            .then(data => handleWord(words[i+1], words, i+1))
        }
      }
      // word is not a next word to the current word so create new object
      const newNextWord = {
        word: nextWord,
        count: 1,
        probability: 1 / data.totalCount * 100
      }
      data.nextWords.push(newNextWord);
      return recalulateProbability(data, data.totalCount)
        .then(newData => mongo.updateOne({ _id: data._id }, newData, 'words'))
        .then(data => handleWord(words[i+1], words, i+1))
    })
    .catch(error => {
      console.log('error', error);
    })
}

const recalulateProbability = (data, totalCount) => {
  data.nextWords.forEach(word => {
    word.probability = word.count / totalCount * 100;
  })
  return Promise.resolve(data);
}

const seed = () => {
  _.forEach(words, (word, index) => {
    if (words.length <= index + 1) {
      return;
    }
    const nextWord = words[index + 1];
    const query = { word: word }
    mongo.find(query, 'words')
      .then(data => {
        if (data.length === 0) {
          console.log('data', data);
          return insertNewWord(word, nextWord);
        }

        console.log('data', data);
      })
      .catch(error => {
        console.log('error seed', error);
      });
  })
}

const insertNewWord = (word, nextWord) => {
  const data = {
    word: word,
    totalCount: 1,
    nextWords: [
      {
        word: nextWord,
        count: 1,
        probability: 100
      }
    ]
  }
  return mongo.insert(data, 'words')
    .then(data => Promise.resolve(data))
    .catch(error => Promise.resolve(error))
}

exports.seed = seed;
exports.insertNewWord = insertNewWord;
