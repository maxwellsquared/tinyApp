// Create a random string of letters and numbers.
const generateRandomString = function(strLength) {
  let myChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randString = "";
  let randChar = "";
  for (let i = 0; i < strLength; i++) {
    randChar = myChars[Math.floor(Math.random() * myChars.length)];
    // Letters have a 50% chance to be uppercase
    if (Math.random() > 0.5) {
      randChar = randChar.toUpperCase();
    }
    randString += randChar;
  }
  return randString;
};

const addHTTP = function(input) {
  if (input === undefined) return input;
  if (input.substring(0, 3) !== "http") {
    input = "http://" + input;
  }
  return input;
};

const getUserByEmail = function(emailToCheck, database) {
  console.log("Checking", emailToCheck);
  for (let user in database) {
    if (database[user].email === emailToCheck) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = function(id, database) {
  let toReturn = {};
  for (let urlID in database) {
    if (database[urlID].userID === id) {
      toReturn[urlID] = database[urlID];
    }
  }
  return toReturn;
};

module.exports = { generateRandomString, addHTTP, getUserByEmail, urlsForUser };