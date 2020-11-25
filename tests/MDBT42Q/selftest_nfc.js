function go() {
  NRF.nfcURL("https://www.espruino.com");
  SPI1.setup({sck:D15, miso:D17, mosi:D16 });
  var nfc = require("MFRC522").connect(SPI1, D14/*CS*/);

  if (nfc.isNewCard()) {
    var card = nfc.getCardSerial();
    print("PASS "+card);
  } else
    print("FAIL");
}

setTimeout(go,100);