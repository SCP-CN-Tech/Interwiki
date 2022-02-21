/* eslint-env node */

var esbuild = require("esbuild");
var fs = require("fs");

fs.rmdirSync("dist", { recursive: true });

esbuild.buildSync({
  entryPoints: ["js/interwiki.js"],
  outdir: "dist",
  bundle: true,
  minify: true,
  sourcemap: true,
  target: "es5",
});

["interwikiFrame", "styleFrame"].forEach(function (frame) {
  fs.copyFileSync("html/" + frame + ".html", "dist/" + frame + ".html");
});
