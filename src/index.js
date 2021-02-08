const Database = require("better-sqlite3");
const Buffer = require("buffer").Buffer;
const path = require("path");
const zlib = require("zlib");
const fs = require("fs");

module.exports = function (mbtilesPath, outDir, opts) {
  // apply default opts
  opts = Object.assign(
    {
      unzipPbf: false,
      namedSubfolder: false,
      verbose: false,
    },
    opts
  );

  const db = new Database(mbtilesPath, { fileMustExist: true });

  // get metadata as {name:value}
  const metadata = Object.assign(
    {},
    ...db
      .prepare("SELECT name, value FROM metadata")
      .all()
      .map((m) => {
        return { [m.name]: m.value };
      })
  );

  const zoom = db
    .prepare("SELECT MIN(zoom_level) as min, MAX(zoom_level) as max FROM tiles")
    .get();

  const numTiles = db.prepare(`SELECT COUNT(*) as count from tiles`).get()
    .count;

  // check mbtiles validity
  if (!("format" in metadata))
    throw new ReferenceError(`tile format not specified in metadata`);

  if (!("name" in metadata))
    throw new ReferenceError(`name not specified in metadata`);

  // add subfolder from metadata name if specified
  if (opts.namedSubfolder) outDir = path.join(outDir, metadata.name);

  console.log(
    `${metadata.name}: ${metadata.format} | ${numTiles} tiles | z${zoom.min}-${zoom.max}`
  );

  console.log(`${metadata.name}: outDir: ${outDir}`);

  const tiles = db.prepare("SELECT * FROM tiles");

  for (const tile of tiles.iterate()) {
    const tPath = {
      dir: outDir,
      zoom: tile.zoom_level,
      x: tile.tile_column,
      y: (1 << tile.zoom_level) - tile.tile_row - 1,
      ext: metadata.format,
    };

    const outFolder = path.join(tPath.dir, tPath.zoom, tPath.x);
    const outFile = `${tPath.y}.${tPath.ext}`;
    const outPath = path.join(outFolder, outFile);

    // make sure output folder exists
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const buffer =
      metadata.format === "pbf" && opts.unzipPbf
        ? zlib.gunzip(new Buffer(tile.tile_data))
        : tile.tile_data;

    fs.writeFileSync(outPath, buffer);
    if (opts.verbose)
      console.log(
        `${metadata.name}: wrote ${tPath.zoom}/${tPath.x}/${tPath.y}.${tPath.ext}`
      );
  }
};
