# Three JS - Tower Builder

This repo contains the first project from Ironhack's Bootcamp in Lisbon where the assignment was to build a game.


## Getting started
### Important
> This repository has code for Firebase deployment, which will not work on any machine whose not authenticated so, cloning this repo is very much useless unless you've been invited into the firebase project.

Clone this repository and install its dependencies:

```bash
clone
cd threejs-tower-builder
npm install
```

`npm run build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging.

`npm start` launches a server, using [serve](https://github.com/zeit/serve) and [livereload](https://www.npmjs.com/package/rollup-plugin-livereload) plugin. Navigate to [localhost:5000](http://localhost:5000).

`npm run watch` will continually rebuild the application as your source files change.

`npm run dev` will run `npm start` and `npm run watch` in parallel.

## Resources

1. [Rollup Package Bundler Docs](https://rollupjs.org/guide/en/) 
2. [Three js Docs](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
3. [Tween Max Docs](https://greensock.com/docs/TweenMax)
4. [lit-html](https://lit-html.polymer-project.org/)
