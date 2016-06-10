/* Keyword object - holds all search keywords, generates lists of random keywords */
var keywords = {
	keywordList: [ // array of all the search keywords
		'small game taxidermy',
		'fridge locker',
		'dog food',
		'cat food',
		'peanut butter',
		'tent',
		'mug',
		'iphone',
		'phone',
		'headphones',
		'chicken',
		'weasel',
		'tea',
		'pure leaf',
		'motor oil',
		'knives',
		'hatchet',
		'herbal',
		'paper',
		'coffin',
		'aquarium',
		'american standard',
		'onesie',
		'litter',
		'hat',
		'blender',
		'mixer',
		'pool',
		'play-doh',
		'lego city',
		'bose headphones',
		'hot to trot',
		'horse costume',
		'Red-Eyed Tree Frog mask',
		'underoos',
		//'lemon costume',
		'nose trimmer',
		'melon baller',
		'cigarette receptacle',
		'mc hammer pants',
		'As Seen On TV Big Vision',
		'As Seen On TV GoGo Pillow',
		'As Seen On TV Chia Pet Gnome',
		'colon cleanse',
		'preparation h',
		'fat tire bikes',
		'sauna suit',
		'fanny pack',
		'hairy chest shirt',
		'Discolicious',
		'earpick',
		'head scratcher',
		'passport potty',
		'stansport privacy shelter',
		'tote-able toilet',
		'floater',
		'bunion',
		'toe seperator',
		'pedi couture',
		'decorative ash bed',
		'corn shaver',
		'caffeinated aftershave',
		'denture reliner kit',
		'jaw strap',
		'dump meals',
		'pogo wisk',
		'snoozzoo',
		'sippy blisters',
		'bumi',
		'pc tar coal',
		'west virginia curtains',
		'urine gone',
		'boogie wipes',
		'wheelchair'],

		gameList: [], // array that the game will actually use
		
		// keyword array shuffle function
		shuffleKeywords:function() {
			var i = 0, 
				j = 0, 
				temp = null;

			for (i = this.keywordList.length - 1; i > 0; i--) {
	        	j = Math.floor(Math.random() * (i + 1));
	        	temp = this.keywordList[i];
	        	this.keywordList[i] = this.keywordList[j];
	       	 	this.keywordList[j] = temp;
			}
		},

		// randomize the main array, populate the game array to a specified length
		randomList: function(count) {
			if (count == 0 || count > this.keywordList.length) {
				count = this.keywordList.length; // change output length if it might cause an error
			}
			console.log("Creating list - " + count + " items out of " + this.keywordList.length);
			this.shuffleKeywords();
			this.gameList = [];
			for (var i = 0; i < count; i++) {
				this.gameList.push(this.keywordList[i]);
			}
			console.log(this.gameList);
			return this.gameList;
		}
};