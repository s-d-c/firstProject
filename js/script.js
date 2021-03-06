var HANGMAN = {
	//Setup varibles
	calledLetters: [],

	wrongGuesses: 0,

	answer: "",

	answerArr: [],

	displayArr: [],

	//Below are two jQuery variables used to alter text in the referenced elements
	guessed: $('.guesses').find('p').eq(1),

	response: $('.guesses').find('p').eq(0),

	//searchWord gets a random word from an API, stores it and calls displayBlanks to show the spaces on the screen
	searchWord: function(){
		$.ajax({
			method   : 'GET',

			url		 : 'http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=10000&maxCorpusCount=400000&minDictionaryCount=20&maxDictionaryCount=-1&minLength=5&maxLength=10&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',

			success  : function(response){
					
					
					HANGMAN.answer = response.word.toUpperCase();
					
					HANGMAN.answerArr = HANGMAN.answer.split("");

					console.log(HANGMAN.answerArr);
					
					HANGMAN.displayArr = HANGMAN.answerArr.map(function() {
						return "_";
					});
					
					HANGMAN.displayBlanks(HANGMAN.displayArr);
			}
		})
	},
	
	//a function to display the spaces hiding the letters of the answer
	displayBlanks: function(wordArray){
		var wordBox = $('.word');
		wordBox.find('span').remove();
		wordArray.forEach(function(index){
			wordBox.append('<span class=letter>' + index +'</span>');
		});
	},
	//checkLetter tests if the answer for the given letter, updates and checks for winner or loser
	checkLetter: function(letter) {
		//array to index functions that reveal stick figure
		var attachFuncs = [this.attachHead, this.attachMidSection, this.attachLeftArm, this.attachRightArm, this.attachLeftLeg, this.attachRightLeg];

		//track the instances of the letter in answer
		var howMany = 0;
		//display instances in place of blanks and increment howMany
		for(i = 0; i < this.answerArr.length; i++){
			if(letter === this.answerArr[i]){
				$('.word').find('span').eq(i).text(letter);
				howMany += 1;
				this.displayArr[i] = letter;
			};
		};
		//this increments wrongGuesses and builds on hangman if there are none of the letter in the answer
		if(howMany === 0){
			this.wrongGuesses += 1;
			attachFuncs[(this.wrongGuesses - 1)]();
		};
		//tests if the player has won and calls onWin() if so
		if(this.displayArr.toString() === this.answerArr.toString()){
			return this.onWin();
		}
		//tests if the player has lost and calls onLose() if so
		else if(this.wrongGuesses === 6){
			return this.onLose();
		}
		//if there is not a win or lose, the display is altered and the game continues
		else {
			return this.alterDisplay(letter, howMany);
		};
	},

	//alterDisplay creates user feedback and tracks calledLetters
	alterDisplay: function(insert, num) {
		
		//feedback to user for right or wrong guesses
		if (num === 0){
			this.response.text('There are no ' + insert + 's.  Try again.');
			}

		else if(num === 1) {
			this.response.text('Well done!  There is one ' + insert + '.');
		}

		else {
			this.response.text('Way to go!  There are ' + num + ' ' + insert + 's!');
		}
		//add letter to list of guessed letters
		this.guessed.append(' ' + insert + ',');
		//add letter to array
		this.calledLetters.push(insert);	
	},

	//hides the hanging stick figure
	takeDownDeadMan: function(){
		$('.hanging-man #head').hide();
		$('.upper-body').children().hide();
		$('.lower-body').children().hide();
	},

	//all attach functions are for building the stick man after wrong guesses
	attachHead: function(){
		$('#head').slideDown(1000);
	},

	attachMidSection: function(){
		$('#mid-section').slideDown(1000);
	},

	attachLeftArm:  function(){
		$('#left-arm').fadeIn(1000);
	},

	attachRightArm: function(){
		$('#right-arm').fadeIn(1000);
	},

	attachLeftLeg: function(){
		$('#waist').fadeIn(700);
		$('#left-leg').slideDown(1000);
	},

	attachRightLeg: function(){
		$('#right-leg').slideDown(1000);
	},

	//build modal overlay with jQuery
	buildModal: function(){
		var $overlay = $('<div id="overaly"></div>');
		var $modal = $('<div id="modal"></div>');
		var $banner = $('<h1></h1>');
		var $response = $('<h2></h2>');
		var $playAgain = $('<p>Click to Play Again.</p>');
		//add banner to modal 
		$modal.append($banner);
		//add response text to modal 
		$modal.append($response);
		//add playAgain to modal
		$modal.append($playAgain);
		//add modal to overlay
		$overlay.append($modal);
		//add overlay
		$("body").append($overlay);
		//show overlay
		$overlay.show();
		//When overlay is clicked
		$overlay.on("keypress", "click", function(e){
			e.preventDefault();
		  //Hide the overlay
		  $overlay.remove();
		  //restart game
		  HANGMAN.reset();
		});
	},

	//behavior for a win
	onWin: function(){
		//show a modal with class winner
		this.buildModal();
		$('#modal').addClass('winner');
		$('#modal h1').text('YOU WIN!!!');
		$('#modal h2').text('Great Job!');
	},

	//behavior for a loss
	onLose: function(){
		//show a modal with class loser
		setTimeout(function(){
			HANGMAN.buildModal();
			$('#modal').addClass('loser');
			$('#modal h1').text('You Lost :(');
			$('#modal h2').text('The Answer is ' + HANGMAN.answer);
		}, 1500);
	},

	//to reset/start the game
	reset: function(){
		this.takeDownDeadMan();
		this.calledLetters = [];
		this.wrongGuesses = 0;
		this.response.text('You have no guesses yet.');
		this.guessed.text('Letters guessed so far:');
		this.displayArr = [];
		this.searchWord();
	}

};

$(document).ready(function(){
	HANGMAN.takeDownDeadMan();
	HANGMAN.reset();

	var letterInput = $('#letterInput');
	
	//focus on input field
	letterInput.find('input').focus();

	//create eventlistener for letter submit
	letterInput.on('submit', function(e){
		e.preventDefault();

		//get input and capitalize
		//do I need toUpperCase() here since I styled the input to capitalize?
		var letter = $('input:text').val().toUpperCase();

		//verify that its a letter and not another char
		if(!/^[a-zA-Z]+$/.test(letter)){
			alert('You must enter a letter.');

		//verify that it has not been called and alert if it has
		} else if(HANGMAN.calledLetters.indexOf(letter) >= 0){
			alert('Try again.  That letter has already been guessed.');

		} else {
		// call checkLetter if it hasn't been called yet
		HANGMAN.checkLetter(letter);
		}
		//clear input and focus on
		$('input:text').val('');
		this.focus();
	});
});

