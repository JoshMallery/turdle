// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
let gamesPlayed = 0;
let winPercent = null;
let avgAttempts = null;
let gamesWon = 0;
let totalRows = 0;
let currentWinStatus = null;
let words

//Fetch Data
fetch('http://localhost:3001/api/v1/words').then(data => data.json()).then(data => defineWords(data));

fetch('http://localhost:3001/api/v1/games').then(data => data.json()).then(data => retrieveStats(data));

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var spaceHolder = document.querySelector('.space-holder');
var totalGamesText = document.querySelector('#stats-total-games');
var percentCorrectText = document.querySelector('#stats-percent-correct');
var avgGuessesText = document.querySelector('#stats-average-guesses');
// Event Listeners

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function defineWords(wordData) {
  words = wordData;
  setGame();
}

function retrieveStats(data) {
  gamesPlayed = data.length;
  totalRows = data
  .filter(game => game.solved)
  .reduce((acc,cur) =>{
    acc+= Number(cur.numGuesses);
    return acc
  },0);

  gamesWon = data.filter(game => game.solved).length;
  loadStats()
}

function loadStats() {
  winPercent = ((gamesWon/gamesPlayed) * 100).toFixed(1);
  avgAttempts = (totalRows/gamesWon).toFixed(1);
  totalGamesText.innerText = `${gamesPlayed}`;
  percentCorrectText.innerText = `${winPercent}`;
  avgGuessesText.innerText = `${avgAttempts}`;
}

function setGame() {
  winningWord = getRandomWord();
  updateInputPermissions();
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      declareWinner();
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  if(currentRow === 6){
    declareLoser();
  }
  currentRow++;
  updateInputPermissions();
}

function declareLoser(){
  spaceHolder.innerText = `You Lost Turdle! the word was ${winningWord}`;
  gamesPlayed++
  winPercent = ((gamesWon/gamesPlayed) * 100).toFixed(1);
  currentWinStatus = false;
  updateStats();
  setTimeout(resetGame,4000)
}

function declareWinner() {
  spaceHolder.innerText = `You Won Turdle in ${currentRow}`;

  if(currentRow > 1) {
    spaceHolder.innerText += ` guesses!`;
  } else {
    spaceHolder.innerText += ` guess!`
  }

  gamesPlayed++
  gamesWon++
  winPercent = ((gamesWon/gamesPlayed) * 100).toFixed(1);
  totalRows += currentRow;
  avgAttempts = (totalRows/gamesWon).toFixed(1);
  currentWinStatus = true;
  updateStats();
  setTimeout(resetGame,4000)
}

function updateStats() {
  totalGamesText.innerText = `${gamesPlayed}`;
  percentCorrectText.innerText = `${winPercent}`;
  avgGuessesText.innerText = `${avgAttempts}`;

  fetch('http://localhost:3001/api/v1/games',{
    method:'POST',
    body:JSON.stringify({solved: currentWinStatus,guesses:`${currentRow}`}),
    headers:{'Content-type': 'application/json'}
    })
    .then(response => response.json());
}


function resetGame() {
  spaceHolder.innerText = "";
  currentRow = 1;
  guess = "";
  resetInputs();
  setGame();
}

function resetInputs() {
  for(var i = 0; i < 30; i++) {
  inputs[i].classList =""
  inputs[i].value ="";
  keyLetters[i].classList ="";
  }
  inputs[0].focus();
}

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}
