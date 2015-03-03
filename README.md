Gamee.JS dokumentácia
=====================

Inštalácia
----------

Repozitár je na [https://bitbucket.org/morihladko/gamee-js.git](https://bitbucket.org/morihladko/gamee-js.git) a buď stiahneme *./dist/gamee.all.min.js* alebo nainštalujeme cez bower

`bower install https://bitbucket.org/morihladko/gamee-js.git`

gamee.controller
----------------

Gamee obsahuje 6 druhov ovládačov (s tlačítkami) a 1 touchpad

 * OneButton (button)
 * TwoButtons (left, right)
 * FourButtons (up, left, right, A)
 * FiveButtons (up, down, left, right, A)
 * SiButtons (up, down, left, right, A, B)
 * Touchpad (x, y [0..1, 0..1])

Na získanie inštancie sa zavolá metóda *gamee.controller.requestController(typ)* a cez odchytávame *keydown/keyup* eventy buď na samotných tlačítkach alebo priamo na ovládači reagujeme na zmenu.

viď. príklad na [https://gist.github.com/morihladko/791498c90e012a4379fa](https://gist.github.com/morihladko/791498c90e012a4379fa)

gamee
-----
Mimo ovládača má gamee objekt ešte metódy

 * **score** property, ktorá inforumje Gamee, aké je aktualne skóre, tj. pri zavolani gamee.score = gameScore sa updatne aktuálne skóre v Gamee
 * **gameStart()** metóda, ktorá oznámi Gamee, že hráč začal hrať
 * **gameOver()** metóda, ktorá oznámi Gamee, že v hre nastal game over
 * **pause()** indikácia, že hra sa chce pausnuť
	
 * **onRestart** callback, ktorý sa zavolá, keď užívateľ chce reštartnuť hru
 * **onResume** callback, ktorý sa zavolá, keď sa Gamee dostane z pozadia do popredia (napr. sa hra preruší keď užívatel prijal hovor)
 * **onPause** callback, ktorý sa zavolá, keď užívateľ klikne na pause, alebo sa hra dostane do pozadia
 * **onStop** callback, ktorý sa zavolá, keď užívateľ zavrie aplikáciu
 * **onMute** callback, ktorý sa zavolá, ked užívateľ chce zrušiť zvuk
