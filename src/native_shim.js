/**
 * Shim for $gameeNative object
 */
(function(global) {
	'use strict';

	if (!global.$gameeNative) {
		global.$gameeNative = {
			/**
			 * Update score 
			 *
			 * {String} score
			 */ 
			updateScore: function(score) {
			},

			/**
			 * Request controller
			 *
			 * {String} score
			 */
			requestController: function(type) {},

			/**
			 * Game over
			 */
			gameOver: function() {}
		};
	}
}(this));
