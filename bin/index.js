#!/usr/bin/env node
"use strict";

const mbexplode = require("../src");

const argv = require("yargs")
  .usage("$0 <mbtilesPath> <outDir>", "explode mbtiles to outDir")
  .options({
    verbose: {
      default: false,
      describe: "output verbose tile progress",
      type: "boolean",
    },
    "named-subfolder": {
      default: false,
      describe:
        "output tiles in subfolder according to name in mbtiles metadata",
      type: "boolean",
    },
    "unzip-pbf": {
      default: false,
      describe: "un-gzip output pbf files",
      type: "boolean",
    },
  }).argv;

mbexplode(argv.mbtilesPath, argv.outDir, {
  namedSubfolder: argv.namedSubfolder,
  unzipPbf: argv.unzipPbf,
  verbose: argv.verbose,
});
