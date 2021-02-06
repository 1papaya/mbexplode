const Database = require("better-sqlite3");
const Buffer = require("buffer").Buffer;
const zlib = require("zlib");
const fs = require("fs");

export default mbexplode = function (mbtilesPath, outDir, opts) {
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

  const metadata = db
    .prepare("SELECT name, value FROM metadata")
    .all()
    .map((m) => {
      return { [t.name]: t.value };
    });

  const minMaxZoom = db
    .prepare("SELECT MIN(zoom_level), MAX(zoom_level) FROM tiles")
    .all();

  const numTiles = db.prepare(`SELECT COUNT(*) from tiles`).get();

  // check mbtiles validity
  if (!("format" in metadata))
    throw new ReferenceError(`tile format not specified in metadata`);

  if (!("name" in metadata))
    throw new ReferenceError(`name not specified in metadata`);

  // add subfolder from metadata name if specified
  if (opts.namedSubfolder) outDir = `${outDir}/${metadata.name}`;

  console.log(
    `${metadata.name}: ${metadata.format} | ${numTiles} tiles | z${minMaxZoom[0]}-${minMaxZoom[1]}`
  );

  console.log(`${metadata.name}: outDir: ${outDir}`);

  const tiles = db.prepare("SELECT * FROM tiles");

  for (const tile of tiles.iterate()) {
    const path = {
      dir: outDir,
      zoom: tile.zoom_level,
      x: tile.tile_column,
      y: (1 << tile.zoom_level) - tile.tile_row - 1,
      ext: metadata.format,
    };

    const outFolder = `${path.dir}/${path.zoom}/${path.x}`;
    const outFile = `${path.y}.${path.ext}`;
    const outPath = `${outFolder}/${outFile}`;

    // make sure output folder exists
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const buffer =
      metadata.format === "pbf" && opts.unzipPbf
        ? zlib.gunzip(new Buffer(row.tile_data))
        : row.tile_data;

    fs.writeFileSync(outFile, buffer);
    if (opts.verbose) console.log(`wrote ${path.zoom}/${path.x}/${path.y}`);
  }
};
