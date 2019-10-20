import { gamee } from "gamee-js"

gamee.gameInit("test",{},[],()=>{},false);
gamee.gameLoadingProgress(50,()=>{});
gamee.gameReady(()=>{});
gamee.gameSave("",false,()=>{});
gamee.getPlatform();
gamee.loadRewardedVideo(()=>{});
gamee.logEvent("","");
gamee.purchaseItem({},()=>{});
gamee.purchaseItemWithCoins({},()=>{});
gamee.purchaseItemWithGems({},()=>{});
gamee.requestBattleData(()=>{});
gamee.requestPlayerData(()=>{},0);
gamee.requestPlayerReplay(0,()=>{});
gamee.requestPlayerSaveState(1,()=>{});
gamee.requestSocial(()=>{},1);
gamee.share({},()=>{});
gamee.showRewardedVideo(()=>{});
gamee.updateScore(1,true,()=>{});
gamee.gameOver({},()=>{},()=>{},false);
