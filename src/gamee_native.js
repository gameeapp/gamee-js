//
// Wrappers for `$gameeNative` object on diferent platforms which
// directly communicates with the GameeApp.
//
// Games should not used this object, it exists only for internal use
// for the public `gamee` object.
(function(global) {
	'use strict';
	
	//
	// ## $gameeNative
	//
	// Basic `$gameeNative` interface
	var gameeNative = {
			/** ### updateScore
			 * Update score.
			 *
			 * @param {String} score
			 */ 
			updateScore: function(score) {},

			/** ### requestController
			 * Request controller.
			 *
			 * *see also 
			 * [gamee.controller.requestController](controller.js.html#requestcontroller)*
			 * @param {String} type
			 */
			requestController: function(type) {},

			/** ### additionalController
			 * Request additional controller (for desktop).
			 *
			 * *see also 
			 * [gamee.controller.additionalController](controller.js.html#additionalcontroller)*
			 *
			 * @param {String} type type of controller 			 
			 */
			additionalController: function(type) {},

			/** ### gameOver
			 * Game over.
			 *
			 * *see also
			 * [gamee.gameOver](gamee.js.html#gamee.gameover)
			 */
			gameOver: function() {},

			/** ### gameStart
			 * Game start.
			 *
			 * *see also
			 * [gamee.gameStart](gamee.js.html#gamee.gamestart)
			 */ 
			gameStart: function() {},

			gameLoaded: function() {},

			type: 'no-gamee'
		},

		/* current user agent */
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

			gameeNative.gameLoaded = function() {
				window.location.href = "gamee://game-loaded";
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

			gameeNative.gameLoaded = function() {
				simulator.gameLoaded();
			};

			gameeNative.type = 'gamee-simulator';
		}

		/**
		 * Gamee Web App
		 */
		function gameeWeb(gameeNative) {
			var gamee = window.parent;

			gameeNative.updateScore = function(score) {
				gamee.postMessage(["score", score], '*');
			};

			gameeNative.requestController = function(type) {
				gamee.postMessage(['request-controller', type], '*');
			};

			gameeNative.additionalController = function(type) {
				gamee.postMessage(['additional-controller', type], '*');
			};

			gameeNative.gameOver = function() {
				gamee.postMessage(['game-over'], '*');
			};

			gameeNative.gameStart = function() {
				gamee.postMessage(['game-start'], '*');
			};

			gameeNative.gamePaused = function() {
				gamee.postMessage(['game-paused'], '*');
			};

			gameeNative.gameLoaded = function() {
				gamee.postMessage(['game-loaded'], '*')
			};

			gameeNative.type = 'gamee-web';
		}

	// user agent is use to determine current enviroment
	if (
		/gamee\/[0-9\.]+$/.test(userAgent) || // test for android webview
		/iphone|ipod|ipad/.test(userAgent)    // test for iOS webview
	) {
		gameeMobile(gameeNative);

	} else if (window.parent) {
		gameeWeb(gameeNative);

	} else if (window.parent && window.parent.gameeSimulator) {
		gameeSimulator(gameeNative);

	} else {
		console.error('No gamee enviroment matched');
	}

	// export to global scope
	global.$gameeNative = gameeNative;
}(this));
