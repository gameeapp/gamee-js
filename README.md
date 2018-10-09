# GAMEE JS

GAMEE is a social platform full of HTML5 games. Our goal is to make the games playable everywhere. You can play in the mobile apps (Android, iOS), bots (Telegram, Kik, Facebook Messenger) or directly on web.

GAMEE JS is our Javascript framework for connecting HTML5 game to [GAMEE](http://www.gameeapp.com/) platform.

Documentation is currently located on [Github wiki](https://github.com/gameeapp/gamee-js/wiki)

## Usage

Download the minified framework located in [gamee/dist/gamee-js.min.js](https://github.com/gameeapp/gamee-js/blob/master/gamee/dist/gamee-js.min.js) and include it in your ```index.html``` file. 

```html
<script src="gamee-js.min.js"></script>
```

### Usage with NPM and Webpack

Install the framework with command ```npm install gamee-js```. Then use:

```javascript
import { gamee } from "gamee-js"
```

in your files. 

## Previous versions (and changelogs)

[https://github.com/gameeapp/gamee-js/releases](https://github.com/gameeapp/gamee-js/releases)

## Contribute

If you want to contribute, please feel free to use [Github issue tracker](https://github.com/gameeapp/gamee-js/issues) of this repository. 

## Build framework on your own

```bash
git clone git@github.com:gameeapp/gamee-js.git
```

```bash
npm install

# run test with mocha in CLI
npm test

# HRM test with mocha in browser
npm test:mocha:watch

# realtime building
npm watch

# one time build
npm b:dist
```

## Contact

If you would like to publish your HTML5 game on the Gamee platform, please contact us on hello@gameeapp.com

