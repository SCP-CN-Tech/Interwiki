/* eslint-env node */

var esbuild = require("esbuild");
var fs = require("fs");

fs.rmSync("dist", { recursive: true, force: true });

esbuild.buildSync({
  entryPoints: ["js/interwiki.js"],
  outdir: "dist",
  bundle: true,
  minify: true,
  sourcemap: true,
  target: "es5",
});

["interwikiFrame", "styleFrame", "index"].forEach(function (frame) {
  fs.copyFileSync("html/" + frame + ".html", "dist/" + frame + ".html");
});
