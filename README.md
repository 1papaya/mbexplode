# mbexplode
extract mbtiles to disk in nodejs

## installation
`npm install mbexplode`


## usage
node module

```js
const mbexplode = require('mbexplode');

mbexplode(
  "path/to/mbtiles.mbtiles",
  "outDir/",
  { unzipPbf: true, namedSubfolder: true, verbose: true }
);
```

command-line

```
mbexplode <mbtilesPath> <outDir>

explode mbtiles to outDir

Options:
  --verbose          output verbose tile progress               [default: false]
  --named-subfolder  output tiles in subfolder of outDir according to name in
                     mbtiles metadata                           [default: false]
  --unzip-pbf        un-gzip output pbf files                   [default: false]
```


## notes
* only TMS tile format supported
* synchronous extraction, not the fastest
* check out [mb-util](https://github.com/mapbox/mbutil) for faster python implementation

## license
MIT
