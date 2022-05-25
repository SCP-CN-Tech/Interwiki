/* eslint-env node */

var esbuild = require("esbuild");
var fs = require("fs");

var dev = process.env.NODE_ENV === "development";

fs.rmSync("dist", { recursive: true, force: true });

esbuild.buildSync({
  entryPoints: ["js/interwiki.js"],
  outdir: "dist",
  bundle: true,
  minify: !dev,
  sourcemap: dev ? "inline" : true,
  target: dev ? "esnext" : "es5",
});

["interwikiFrame", "styleFrame", "index"].forEach(function (frame) {
  fs.copyFileSync("html/" + frame + ".html", "dist/" + frame + ".html");
});

fs.mkdirSync("dist/css");

["style", "style-wl", "style-404", "style-bhl", "style-bhl-dark"].forEach(function (frame) {
  fs.copyFileSync("css/" + frame + ".css", "dist/css/" + frame + ".css");
});
