#!/usr/bin/node

const BOARD_DIR = __dirname+"/boards/";
const TEST_DIR = __dirname+"/tests/";

var promise = Promise.resolve();
require("fs").readdirSync(BOARD_DIR).
  filter(f=>f.endsWith(".json")).
  forEach(fn=>{
    promise = promise.then(() => testBoard(fn));
  });
promise.then(_=>{
  console.log("Finished!");
  process.exit(0);
});

function testBoard(boardJSONfile) {
  console.log("=====================================================");
  console.log(" Testing "+boardJSONfile);
  console.log("=====================================================")
  boardJSONfile = BOARD_DIR+boardJSONfile;
  var boardJSON = JSON.parse(require("fs").readFileSync(boardJSONfile));
  console.log(boardJSON);
  // load tests
  var tests = [];
  boardJSON.tests.forEach(testDir => {
    testDir = TEST_DIR+testDir;
    require("fs").readdirSync(testDir).filter(f=>f.endsWith(".js")).forEach(testFile => {
      var path = testDir + "/" + testFile;
      tests.push({ name : testFile, path : path,
                   content : require("fs").readFileSync(path).toString() });
    });
  });
  //console.log(tests);
  // find firmware
  // programming
  return Promise.resolve().
    then(() => new Promise(resolve => {
      var testList = tests.slice(0);
      runTest();
      function runTest() {
        var test = testList.shift();
        if (test===undefined) return resolve();
        console.log("TESTING "+test.path);
        var l = console.log;
      //  console.log = function() {}
        console.log(require("espruino"));
        require("espruino").sendCode("c6:f1:eb:32:25:8a", test.content, function(data) {
          console.log = l;
          console.log("Got: " + data);
          if (data && data.includes("PASS")) {
            test.pass = true;
            console.log("Passed!");
          } else {
            test.pass = false;
          }
          runTest();
        });
      }
    }));
}
