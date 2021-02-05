const Buffer = require("buffer").Buffer;
const sqlite3 = require("sqlite3");
const zlib = require("zlib");
const fs = require("fs");

export default mbtilesExploder = function (mbtilesPath, outDir, opts) {
  // default opts
  opts = Object.assign(
    {
      unzipPbf: false,
      namedSubfolder: false,
      verbose: false,
    },
    opts
  );

  // open SQL
  const db = new sqlite3.Database(mbtilesPath, function (err) {
    throw new Error(err);
  });

  // get metadata
  db.all("SELECT name, value FROM metadata", (err, meta) => {
    if (err) throw new Error(err);

    // get metadata as JSON name:value object
    const metadata = Object.assign(
      {},
      ...meta.map((m) => {
        return { [t.name]: t.value };
      })
    );

    // if format not specified don't know what to do
    if (!("format" in metadata))
      throw new ReferenceError(`tile format not specified in metadata`);

    // figure out outDir from options
    if (opts.namedSubfolder)
      if (!("name" in metadata))
        throw new ReferenceError(`name not specified in metadata`);
      else outDir = `${outDir}/${metadata.name}`;

    if (opts.verbose) console.log(`outDir: ${outDir}`);

    db.each("SELECT * FROM tiles", (err, row) => {
      if (err) throw new Error(err);

      const outFolder = `${outDir}/${row.zoom_level}/${row.tile_column}`;
      const outFile = `${outFolder}/${
        (1 << row.zoom_level) - row.tile_row - 1
      }.${metadata.format}`;

      fs.mkdir(outFolder, { recursive: true }, () => {
        if (opts.unzipPbf && metadata.format === "pbf") {
          zlib.gunzip(new Buffer(row.tile_data), (err, buffer) => {
            if (err) throw new Error(err);

            fs.writeFile(outFile, buffer, (err) => {
              if (err) throw new Error(err);
              if (opts.verbose) console.log(`wrote ${outFile}`);
            });
          });
        } else {
          fs.writeFile(outFile, row.tile_data, (err) => {
            if (err) throw new Error(err);
            if (opts.verbose) console.log(`wrote ${outFile}`);
          });
        }
      });
    });
  });
};
