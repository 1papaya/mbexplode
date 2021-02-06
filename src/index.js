const Buffer = require("buffer").Buffer;
const Database = require("sqlite-async");
const zlib = require("zlib");
const fs = require("fs").promises;

const promiseGunzip = require("util").promisify(zlib.gunzip);

export default mbtilesExploder = async function (mbtilesPath, outDir, opts) {
  // apply default opts
  opts = Object.assign(
    {
      unzipPbf: false,
      namedSubfolder: false,
      verbose: false,
    },
    opts
  );

  return Database.open(mbtilesPath).then(async (db) => {
    const metadata = Object.assign(
      {},
      ...(await db.all("SELECT name, value FROM metadata")).map((m) => {
        return { [t.name]: t.value };
      })
    );

    const zoomLevels = await db.all(
      "SELECT DISTINCT zoom_level AS z FROM tiles ORDER BY z ASC"
    );

    const numTiles = await db.get(`SELECT COUNT(*) from tiles`);

    // check mbtiles validity
    if (!("format" in metadata))
      throw new ReferenceError(`tile format not specified in metadata`);

    if (!("name" in metadata))
      throw new ReferenceError(`name not specified in metadata`);

    // add subfolder from metadata name if specified
    if (opts.namedSubfolder) outDir = `${outDir}/${metadata.name}`;

    console.log(
      `${metadata.name}: ${metadata.format} | ${numTiles} tiles | z${
        zoomLevels[0]
      }-${zoomLevels[zoomLevels.length - 1]}`
    );
    
    console.log(`${metadata.name}: outDir: ${outDir}`);

    return db.each("SELECT * FROM tiles").then((row) => {
      const outFolder = `${outDir}/${row.zoom_level}/${row.tile_column}`;
      const outFile = `${outFolder}/${
        (1 << row.zoom_level) - row.tile_row - 1
      }.${metadata.format}`;

      return fs.mkdir(outFolder, { recursive: true }).then(() => {
        if (opts.unzipPbf && metadata.format === "pbf") {
          return promiseGunzip(new Buffer(row.tile_data)).then((buffer) => {
            return fs.writeFile(outFile, buffer).then(() => {
              if (opts.verbose) console.log(`wrote ${outFile}`);
            });
          });
        } else {
          return fs.writeFile(outFile, row.tile_data).then(() => {
            if (opts.verbose) console.log(`wrote ${outFile}`);
          });
        }
      });
    });
  });
};
