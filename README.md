Gamee.JS dokumentácia
=====================

Inštalácia
----------

Dočasný repozitár je na [https://bitbucket.org/morihladko/gamee-js.git](https://bitbucket.org/morihladko/gamee-js.git) a buď stiahneme *./dist/gamee.all.min.js* alebo nainštalujeme cez bower

`bower install https://bitbucket.org/morihladko/gamee-js.git`

gamee.controller
----------------

Gamee obsahuje 6 druhov ovládačov (s tlačítkami)

 * OneButton (button)
 * TwoButtons (left, right)
 * FourButtons (up, left, right, A)
 * FiveButtons (up, down, left, right, A)
 * SiButtons (up, down, left, right, A, B)

Na získanie inštancie sa zavolá metóda *gamee.controller.requestController(typ)* a cez odchytávame *keydown/keyup* eventy buď na samotných tlačítkach alebo priamo na ovládači reagujeme na zmenu.

viď. príklad na [https://gist.github.com/morihladko/791498c90e012a4379fa](https://gist.github.com/morihladko/791498c90e012a4379fa)

gamee
-----
Mimo ovládača má gamee objekt ešte metódy

 * **score** property, ktorá inforumje Gamee, aké je aktualne skóre, tj. pri zavolani gamee.score = gameScore sa updatne aktuálne skóre v Gamee
 * **gameOver()** metóda, ktorá oznámi Gamee, že game over
 * **pause()** indikácia, že hra sa chce pausnuť
 * **onResume** callback, ktorý sa zavolá, keď sa Gamee dostane z pozadia do popredia (napr. sa hra preruší keď užívatel prijal hovor)
 * **onPause** callback, ktorý sa zavolá, keď užívateľ klikne na pause, alebo sa hra dostane do pozadia
 * **onStop** callback, ktorý sa zavolá, keď užívateľ zavrie aplikáciu

