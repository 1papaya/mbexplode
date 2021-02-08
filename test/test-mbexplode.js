const dircompare = require("dir-compare");
const mbexplode = require("../src/index");
const assert = require("assert");

mbexplode(
  "./test/data/210_OEM25_LP-jpg.mbtiles",
  "./test/data/testing/210_OEM25_LP-jpg"
);
mbexplode(
  "./test/data/lph-pbf-compression.mbtiles",
  "./test/data/testing/lph-pbf-compression"
);
mbexplode(
  "./test/data/lph-pbf-compression.mbtiles",
  "./test/data/testing/lph-pbf-no-compression",
  { unzipPbf: true }
);

describe("mbexplode", function () {
  it("should output correct jpg tiles", function () {
    assert.equal(
      dircompare.compareSync(
        "./test/data/correct/210_OEM25_LP-jpg/",
        "./test/data/testing/210_OEM25_LP-jpg",
        { compareContent: true }
      ).same,
      true
    );
  });

  it("should output correct gzipped pbf tiles", function () {
    assert.equal(
        dircompare.compareSync(
          "./test/data/correct/lph-pbf-compression/",
          "./test/data/testing/lph-pbf-compression",
          { compareContent: true }
        ).same,
        true
      );
  });

  it("should output correct ungzipped pbf tiles", function () {
    assert.equal(
        dircompare.compareSync(
          "./test/data/correct/lph-pbf-no-compression/",
          "./test/data/testing/lph-pbf-no-compression",
          { compareContent: true }
        ).same,
        true
      );

  });
});
