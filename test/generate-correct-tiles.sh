#!/bin/bash

mkdir -p data/correct

mb-util data/lph-pbf-compression.mbtiles data/correct/lph-pbf-compression/
mb-util data/lph-pbf-no-compression.mbtiles data/correct/lph-pbf-no-compression/
mb-util data/210_OEM25_LP-jpg.mbtiles data/correct/210_OEM25_LP-jpg/

find data/correct/ -iname "metadata.json" -exec rm {} \;