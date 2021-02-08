#!/bin/bash

mkdir -p data/correct

mb-util --image_format=pbf data/lph-pbf-compression.mbtiles data/correct/lph-pbf-compression/
mb-util --image_format=pbf data/lph-pbf-no-compression.mbtiles data/correct/lph-pbf-no-compression/
mb-util --image_format=jpg data/210_OEM25_LP-jpg.mbtiles data/correct/210_OEM25_LP-jpg/

find data/correct/ -iname "metadata.json" -exec rm {} \;