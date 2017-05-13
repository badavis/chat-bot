const scrubData = (data) => {
  return splitWords(data);
}

// Helpers

function splitWords(words) {
  const wordArray = words.split(' ');
  return wordArray;
}

exports.scrubData = scrubData;
