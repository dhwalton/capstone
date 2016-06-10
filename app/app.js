var maxProducts = 10; // total number of products in the game
var maxTries = 3; // total number of guesses per product
var tryCount = 0; // current number of tries
var fadeSpeed = 250; // fade in/out speed
var msgDisplayTime = 2000; // length of time that messages are displayed in ms
var score = 0; // user score
var maxDescriptionLength = 600; // max character limit for description (for proper formatting)

// holds product data, runs ajax query
var product = {
	productKeywords: [], // holds the search terms for each product in the game
	currentName: "",
	currentMSRP: "",
	currentImg: "",
	currentDescription: "",
	currentImage: "", // need to make a placeholder image (maybe)

	// load the product taken from the first element in the keyword array
	loadProduct: function(){
		if (product.productKeywords != undefined) {
			this.getProduct(this.productKeywords[0]);
		} else {
			console.log('No game keywords are loaded!')
		}
	},

	// remove the first array item, run the search again
	nextProduct: function(){
		// fade out the board

		// remove first array element
		this.productKeywords.shift();
		console.log(this.productKeywords);

		if (this.productKeywords.length > 0) {
			// load the new product
			this.getProduct(this.productKeywords[0]);
		} else {
			this.currentName = "GAME OVER";
			this.currentMSRP = -1;
		}
	},

	// send a query to Walmart API based on a search term, and set the currentName and currentMSRP to the first result
	getProduct: function(searchTerm) {
		var request = { 
		apiKey: '3k9p7dptzb9mjvmanbdd8yft',
		format: 'json',
		numItems: '1',
		query: searchTerm,
		sort: 'relevance',
		//async: false
		};
		$.ajax({
			url: "http://api.walmartlabs.com/v1/search",
			data: request,
			dataType: "jsonp",//use jsonp to avoid cross origin issues
			type: "GET"
		})
		.success(function(result){ 
			//console.clear();

			console.log(result);
			
			// set properties
			//product.currentName = '<a href="' + result.items[0].productUrl + '" target="top">' + result.items[0].name + '</a>';
			product.currentName = result.items[0].name;
			product.currentMSRP = result.items[0].msrp; // whenever possible, use MSRP.  
			product.currentImage = result.items[0].imageEntities[0].mediumImage; // set initial product image

			// look for the primary image, which apparently can be any of the array elements...
			for (var i=0; i<result.items[0].imageEntities.length; i++) {
				if (result.items[0].imageEntities[i].entityType == "PRIMARY") {
					product.currentImage = result.items[0].imageEntities[i].mediumImage;
					console.log('image entry ' + i + ' is the primary');
				}
			}

			product.currentDescription = result.items[0].shortDescription;
			
			// if short description doesn't exist, use long description
			if (product.currentDescription == undefined || product.currentDescription.length < 10) {
				console.log('short description not available, using long description');
				product.currentDescription = result.items[0].longDescription; 
			}
			

			// if description is still undefined, default it
			if (product.currentDescription == undefined) {
				product.currentDescription = "Description unavailable";
			}

			// Walmart appears to escape out HTML brackets when returning the description, so they need to be replaced
			product.currentDescription = product.currentDescription.replace(/&lt;/g,"<").replace(/&gt;/g,">");

			// truncate the description if it's too long
			if (product.currentDescription.length > maxDescriptionLength) {
				 product.currentDescription = product.currentDescription.substr(0,maxDescriptionLength) + "...";
			}

			//If MSRP is undefined, use the sale price.  Trying to avoid those rolled-back prices!
			if (product.currentMSRP == undefined) product.currentMSRP = result.items[0].salePrice;
			
			// round MSRP to nearest dollar
			product.currentMSRP = Math.round(product.currentMSRP);

			// display results
			//$('#result').html(product.currentName + " @ $" + product.currentMSRP + "<br />");	// testing
			changePrompt(product.currentImage,product.currentName,product.currentDescription);
		})
	},

};

/* plays sound based on audio ID */
function playSound(audioID) {
	$(audioID)[0].volume = 0.5;
  	$(audioID)[0].load();
  	$(audioID)[0].play();
}

// start a new game
function newGame() {
	console.log("Starting a new game...");

	//load the keywords for this game
	product.productKeywords = keywords.randomList(maxProducts);

	// reset score
	tryCount = 0;
	score = 0;
	
	// initialize scoreboard
	$('#tries').html(maxTries - tryCount + " Tries left");
	$('#score-display').html("Score: " + scoreStr());

	// load the first product
	product.loadProduct();

	//fade out #newgame div, fade in #guess div
	$('#new-game').fadeOut(fadeSpeed);
	$('#result').fadeOut(fadeSpeed);
	$('#guess').fadeIn(fadeSpeed*2);
	$('#score').fadeIn(fadeSpeed*2);
}

// adds a bit of theatrics to changing a question prompt
function changePrompt(img,name,description) {
	$('div#prompt').fadeOut(fadeSpeed);
	setTimeout(function(){
		$('div#prompt').children('h3').html(name);
		$('div#prompt').children('p').text("");
		$('div#prompt').children('p').append(description);
		$('div#prompt').children('img').attr('src',img);
    	//$('div#prompt').children('p').html(name + "<br />" + description);
    	$('div#prompt').fadeIn(fadeSpeed);
	}, fadeSpeed);	
}

// return a message based on the user's guess
function guessResult(guess) {
	var difference = parseInt(product.currentMSRP) - parseInt(guess);

	var guessMessage = "";
	if (difference == 0) {
		guessMessage = "You are correct!";
	} 
	else if (difference <= -1000) {
		guessMessage = "WAAAAAY too high!";
	}
	else if (difference > -999 && difference <= -100) {
		guessMessage = "That's too high by quite a bit!";
	}
	else if (difference > -99 && difference <= -3) {
		guessMessage = "Too high!";
	}	
	else if (difference >= -2 && difference <= -1) {
		guessMessage = "Too high, but so close!";
	}
	else if (difference >= 1 && difference <= 3) {
		guessMessage = "Too low, but so close!";
	}
	else if (difference >= 3 && difference < 99) {
		guessMessage = "Too low!";
	}
	else if (difference >= 100 && difference < 999) {
		guessMessage = "That's too low by quite a bit!";
	}
	else if (difference >= 1000) {
		guessMessage = "WAAAAAY too low!";
	}
	
	console.log(guessMessage + " - user guess: " + guess + ", price: " + product.currentMSRP + ", difference: " + difference);

	return guessMessage;
}

function scoreStr() {
	return Math.round(score / maxProducts * 100) + "%";
}


function runGuess() {
	// get user input
	var userGuess = $('#guess').find("input").val();

	// exit the function if there's nothing in the input box
	if (userGuess == "" || userGuess == undefined) return;

	// check the answer, give hints
	$('#last-guess').html("Last Guess: $" + userGuess + " - " + guessResult(userGuess));	

	// update the tries left
	tryCount++;
	$('#tries').html(maxTries - tryCount + " Tries left");

	// user failed
	if (tryCount >= maxTries && userGuess != product.currentMSRP) {
		// display failure message
		$('#incorrect-answer').find('p').html("The correct price was $" + product.currentMSRP);
		playSound("#incorrect-sound");
		$('#incorrect-answer').fadeIn(fadeSpeed);
		setTimeout(function(){
			$('#incorrect-answer').fadeOut(fadeSpeed);
		}, msgDisplayTime);

	}

	// user succeeded
	if (userGuess == product.currentMSRP) {
		// update score 
		score++;
		console.log("Score: " + score);
		$('#score-display').html("Score: " + scoreStr());
		playSound("#correct-sound");

		// display success message
		$('#correct-answer').fadeIn(fadeSpeed);

		setTimeout(function(){
			$('#correct-answer').fadeOut(fadeSpeed);
		}, msgDisplayTime/2);

	}

	// move to the next product
	if (tryCount >= maxTries || userGuess == product.currentMSRP) {
		// check to see if the game is over
		if (product.productKeywords.length == 1) {
			// end the game, turn off the active board
			$('#result').find('p').html("You got " + scoreStr() + "!");
			$('#prompt').fadeOut(fadeSpeed);
			$('#last-guess').html("");

			// display results and new game div
			$('#result').fadeIn(fadeSpeed*3);
			$('#new-game').fadeIn(fadeSpeed);

		} else {
			//load a new product
			product.nextProduct();

			// reset tryCount
			tryCount = 0;
			$('#tries').html(maxTries - tryCount + " Tries left");
			$('#last-guess').html("");
		}
	}

	// clear the input box
	$('#guess').find("input").val("");	
}

$(document).ready( function() {
	// make the input box only accept numeric characters
	$('#guess').find("input").numeric();

	// "new game" button event handler
	$('#new-game button').click(function(){
		newGame();	
	});

	// "guess" button event handler	
	$('#guess').find('button').click(function(e){
		e.preventDefault();
		runGuess();		
	});


});