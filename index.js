const seedData = require("./news");
const words = seedData.articles.split(' ');
const dict = { words: [], length: 0 };

const mongo = require('./lib/mongo');

mongo.db()
  .then(() => {
    mongo.insert();
  })
  .catch(error => {

  });

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

for(var i = 0; i < words.length - 1; i++) {
  if (!dict[words[i]]) {
    dict[words[i]] = {
      next: {},
      words: [],
      count: 0
    };
  }
  dict.words.push(words[i]);
  if (! (dict[words[i]].next[words[i+1]] && dict[words[i]].next[words[i+1]].count) ) {
    dict[words[i]].next[words[i+1]] = {
      count: 0,
      probability: 100
    }
  }

  dict[words[i]].next[words[i+1]].count++;
  dict[words[i]].words.push(words[i+1]);
  dict[words[i]].next[words[i+1]].probability = ( dict[words[i]].next[words[i+1]].count / dict[words[i]].words.length ) * 100;
  dict[words[i]].count++;
  dict.length++;

}

// generate new sentence:
let rand = getRandomInt(0, dict.length);
let randWord = words[rand];
let randSentence = [];

for(var i = 0; i < 10; i++) {
  randSentence.push(randWord);
  rand = getRandomInt(0, dict[randWord].words.length );
  randWord = dict[randWord].words[rand];
}


// console.log(dict)
console.log(randSentence.join(' '));
