// Type definitions for gamee-js 2.4.1
// Project: https://github.com/gameeapp/gamee-js
// Definitions by: Vincenzo Tilotta <https://github.com/gameeapp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * @class gamee
 */
export namespace gamee {
  /**
   * gameInit
   * @memberof gamee
   * @param {String} controllType
   * @param {Object} controllOpts
   * @param {String[]} capabilities
   * @param {Function} cb
   * @param {Boolean} silentMode
   */
  function gameInit(
    controllType: String,
    controllOpts: Object,
    capabilities: String[],
    cb: Function,
    silentMode: Boolean
  ): void;

  /**
   * gameLoadingProgress
   * @memberof gamee
   * @param {Number} percentage current loading progress
   * @param {Function} [opt_cb]
   */
  function gameLoadingProgress(percentage: Number, opt_cb: Function): void;

  /**
   * gameReady
   * @memberof gamee
   * @param {Function} [opt_cb]
   */
  function gameReady(opt_cb: Function): void;

  /**
   * gameSave
   *
   * @memberof gamee
   * @param {String} data current ingame progress
   * @param {Boolean} [opt_share=false]
   * @param {Function} [opt_cb]
   *
   */
  function gameSave(data: String, opt_share: Boolean, opt_cb: Function): void;

  /**
   * gameSave
   *
   * @memberof gamee
   * @param {String} data current ingame progress
   * @param {Function} [opt_cb]
   *
   */
  function gameSave(data: String, opt_cb: Function): void;

  /**
   * getPlatform
   *
   * @memberof gamee
   * @returns {String} platform type can be android | ios | web | fb
   */
  function getPlatform(): String;

  /**
   * updateScore
   *
   * @memberof gamee
   * @param {Number} score
   * @param {Boolean} [opt_ghostSign=false] If true, score will be updated for ghost instead.
   * @param {Function} [opt_cb]
   */
  function updateScore(
    score: Number,
    opt_ghostSign: Boolean,
    opt_cb: Function
  ): void;

  /**
   * gameOver
   *
   * @memberof gamee
   * @param {Function|Object} [opt_replayData]
   * @param {Function} [opt_cb]
   * @param {Object} [opt_saveState]
   * @param {Boolean} [opt_hideOverlay]
   */
  function gameOver(
    opt_replayData: Function | Object,
    opt_cb: Function,
    opt_saveState: Object,
    opt_hideOverlay: Boolean
  ): void;

  /**
   * requestSocialData
   *
   * @memberof gamee
   * @param {Function} cb
   * @param {Number} NumberOfPlayers
   */
  function requestSocial(cb: Function, NumberOfPlayers: Number): void;

  /**
   * logEvent
   *
   * @memberof gamee
   * @param {String} eventName
   * @param {String} eventValue
   */
  function logEvent(eventName: String, eventValue: String): void;

  /**
   * requestBattleData

   * @memberof gamee
   * @param {Function} cb
   */
  function requestBattleData(cb: Function): void;

  /**
   * requestPlayerReplay
   *
   * @memberof gamee
   * @param {Number} userID
   * @param {Function} cb
   */
  function requestPlayerReplay(userID: Number, cb: Function): void;

  /**
   * requestPlayerSaveState
   *
   * @memberof gamee
   * @param {Number} userID
   * @param {Function} cb
   */
  function requestPlayerSaveState(userID: Number, cb: Function): void;

  /**
   * purchaseItem
   *
   * @memberof of gamee
   * @param {Object} purchaseDetails
   * @param {Function} cb
   */
  function purchaseItem(purchaseDetails: Object, cb: Function): void;

  /**
   * purchaseItemWithCoins
   * @member of gamee
   * @param {Object} purchaseDetails
   * @param {Function} cb
   */
  function purchaseItemWithCoins(purchaseDetails: Object, cb: Function): void;

  /**
   * purchaseItemWithGems
   * @member of gamee
   * @param {Object} purchaseDetails
   * @param {Function} cb
   */
  function purchaseItemWithGems(purchaseDetails: Object, cb: Function): void;

  /**
   * share
   * @member of gamee
   * @param {Object} shareDetails
   * @param {Function} cb
   */
  function share(shareDetails: Object, cb: Function): void;

  /**
   * loadRewardedVideo
   * @member of gamee
   * @param {Function} cb
   */
  function loadRewardedVideo(cb: Function): void;

  /**
   * showRewardedVideo
   * @member of gamee
   * @param{Function} cb
   */
  function showRewardedVideo(cb: Function): void;

  /**
   * requestPlayerData
   * @member of gamee
   * @param{Function} cb
   * @param {number} userID
   */
  function requestPlayerData(cb: Function, userID: number): void;
}