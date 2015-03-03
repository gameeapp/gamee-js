/**
 * Wrappers for $gameeNative object in diferent envitorments
 */
(function(global) {
	'use strict';
	
	var gameeNative = {
			/**
			 * Update score 
			 *
			 * {String} score
			 */ 
			updateScore: function(score) {},

			/**
			 * Request controller
			 *
			 * {String} score
			 */
			requestController: function(type) {},

			/**
			 * Game over
			 */
			gameOver: function() {},

			/**
			 * Game start
			 */ 
			gameStart: function() {},

			type: 'no-gamee'
		},
		userAgent = navigator.userAgent.toLowerCase();
		
		/**
		 * Gamee Mobile App 
		 */
		function gameeMobile(gameeNative) {
			gameeNative.updateScore = function(score) {
				window.location.href = "gamee://score/" + score;
			};

			gameeNative.requestController = function(type) {
				window.location.href = "gamee://request-controller/" + type;
			};

			gameeNative.gameOver = function() {
				window.location.href = "gamee://game-over";
			};

			gameeNative.gameStart = function() {
				window.location.href = "gamee://game-start";
			};

			gameeNative.type = 'gamee-mobile';
		}

		/**
		 * Gamee simulator and validator
		 */
		function gameeSimulator(gameeNative) {
			var simulator = window.parent.gameeSimulator;

			gameeNative.updateScore = function(score) {
				simulator.updateScore(score);
			};

			gameeNative.requestController = function(type) {
				simulator.requestController(type);
			};

			gameeNative.gameOver = function() {
				simulator.gameOver();
			};

			gameeNative.gameStart = function() {
				simulator.gameStart();
			};

			gameeNative.type = 'gamee-simulator';
		}

		/**
		 * Gamee desktop web view
		 */
		function gameeWeb(gameeNative) {
			var gamee = window.parent.GameeWeb;

			gameeNative.updateScore = function(score) {
				gamee.updateScore(score);
			};

			gameeNative.requestController = function(type) {
				gamee.requestController(type);
			};

			gameeNative.gameOver = function() {
				gamee.gameOver();
			};

			gameeNative.gameStart = function() {
				gamee.gameStart();
			};

			gameeNative.gamePaused = function() {
				gamee.gamePaused();
			};

			gameeNative.type = 'gamee-web';
		}


	if (
		/gamee\/[0-9\.]+$/.test(userAgent) || // test for android webview
		/iphone|ipod|ipad/.test(userAgent)    // test for iOS webview
	) {
		gameeMobile(gameeNative);

	} else if (window.parent && window.parent.GameeWeb) {
		gameeWeb(gameeNative);

	} else if (window.parent && window.parent.gameeSimulator) {
		gameeSimulator(gameeNative);

	} else {
		console.error('No gamee enviroment matched');
	}

	global.$gameeNative = gameeNative;
}(this));
