#!/usr/bin/node
/*

sudo apt install libudev-dev dfu-util
npm install

*/

const BOARD_DIR = __dirname+"/boards/";
const TEST_DIR = __dirname+"/tests/";
const OPENOCD_DIR = __dirname+"/openocd";

const Gpio = require('onoff').Gpio;

var promise = Promise.resolve();
//require("fs").readdirSync(BOARD_DIR).
//["PIXLJS.json"].
["ESPRUINOWIFI.json"].
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
  /*boardJSON.tests.forEach(testDir => {
    testDir = TEST_DIR+testDir;
    require("fs").readdirSync(testDir).filter(f=>f.endsWith(".js")).forEach(testFile => {
      var path = testDir + "/" + testFile;
      tests.push({ name : testFile, path : path,
                   content : require("fs").readFileSync(path).toString() });
    });
  });*/
  //console.log(tests);
  // find firmware
  //return flashBoard(boardJSON, "/home/pi/espruino_2v08_pixljs.hex");
  return flashBoard(boardJSON, "/home/pi/espruino_2v08_wifi.bin");
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
        require("espruino").sendCode(boardJSON.port, test.content, function(data) {
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

function flashBoard(boardJSON, filename) {
 if (boardJSON.pins.pi_swdio)
   return flashNRF52(boardJSON, filename);
 if (boardJSON.pins.pi_boot0)
   return flashSTM32_DFU(boardJSON, filename);
 throw new Error("Unknown board flashing style");
}

function flashNRF52(boardJSON, filename) {
  require("fs").writeFileSync(OPENOCD_DIR+"/tester.cfg",`
 # pi interface
 interface bcm2835gpio

 # Transition delay calculation: SPEED_COEFF/khz - SPEED_OFFSET
 # These depend on system clock, calibrated for stock 700MHz
 # bcm2835gpio_speed SPEED_COEFF SPEED_OFFSET

 # Pi 3 - 1200MHz
 bcm2835gpio_peripheral_base 0x3F000000
 bcm2835gpio_speed_coeffs 194938 48
 # Raspi2 BCM2836 (900Mhz):
 #bcm2835gpio_peripheral_base 0x3F000000
 #bcm2835gpio_speed_coeffs 146203 36
 # Pi Zero W - 700Mhz
 #bcm2835gpio_peripheral_base 0x20000000
 #bcm2835gpio_speed_coeffs 113714 28
 #bcm2835gpio_speed_coeffs 80000 20 # overclock? seems to work - 29s vs 35s

 #bcm2835gpio_swd_nums swclk swdio
 bcm2835gpio_swd_nums ${boardJSON.pins.pi_swclk} ${boardJSON.pins.pi_swdio}
 #bcm2835gpio_srst_num 18
 #reset_config srst_only srst_push_pull
 #reset_config srst_only srst_nogate
 
 # transport
 transport select swd
 
 # target
 # setting workarea disables fast flash, which doesn't seem to work on nRF5x
 set WORKAREASIZE 0 
 set CHIPNAME nrf52832
 source [find target/nrf52.cfg]
 #adapter_nsrst_delay 100
 #adapter_nsrst_assert_width 100
 
 # execution
 init
 targets
 halt
 nrf51 mass_erase
 flash write_image ${filename} 0
# reset halt
# targets
# verify_image ${filename} 0
 reset run
 targets
 exit
`);
  console.log("Running OpenOCD");
  return new Promise((resolve,reject) => {
    require("child_process").exec("sudo ./openocd -f tester.cfg", {
      cwd : OPENOCD_DIR,
    }, function(error, stdout, stderr) {
      if (error) return reject(error);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);     
      resolve();      
    });
  });
}

function flashSTM32_DFU(boardJSON, filename) {
  console.log("Entering DFU mode");
  var pinBoot0 = new Gpio(boardJSON.pins.pi_boot0, 'out'); // active high
  var pinRst = new Gpio(boardJSON.pins.pi_rst, 'out'); // active low
  pinBoot0.writeSync(0);
  pinRst.writeSync(0);
  pinRst.writeSync(1);
  return new Promise((resolve,reject) => {
    setTimeout(function() {
      console.log("Flashing...");
      require("child_process").exec(`sudo dfu-util -a 0 -s 0x08000000 -D ${filename}`, {
        cwd : OPENOCD_DIR,
      }, function(error, stdout, stderr) {
        console.log("Exit DFU mode");
        pinBoot0.writeSync(1);
        pinRst.writeSync(0);
        pinRst.writeSync(1);
        pinBoot0.unexport();
        pinRst.unexport();

        if (error) return reject(error);
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);     
        setTimeout(resolve, 1000);      
      });
    }, 1000);
  });

  return new PrimiPromise.resolve();
}
