/* Library to interface with the Texas Instruments TLC5916 and TLC5917
   8-Channel Constant-Current LED Sink Drivers.
   https://github.com/Andy4495/TLC591x

*/
/* Version History
   1.0.0    08/03/2018  A.T.   Original
   1.1.0    09/25/2020  A.T.   Support more daisy-chained digits.
   1.2.0    01/17/2021  A.T.   Add support for special mode.

*/
#ifndef TLC591x_LIBRARY
#define TLC591x_LIBRARY

#include <Arduino.h>

class TLC591x {
public:
  enum {NO_PIN=255};

  TLC591x(byte n, byte SDI, byte CLK, byte LE, byte OE);
  TLC591x(byte n, byte SDI, byte CLK, byte LE);

  void print(const char* s);
  void print(unsigned int n);
  void printDirect(const uint8_t* s);
  void reinit();
  void displayEnable();
  void displayDisable();
  void normalMode();
  void specialMode();
  void displayBrightness(byte b); 

private:
  enum POWER_MODE {WAKEUP = 1, SHUTDOWN = 0};
  enum {NO_DATA_COMING = 0, DATA_COMING = 1};
  enum {MINCHIPS = 1, MAXCHIPS = 254};
  byte SDI_pin, CLK_pin, LE_pin, OE_pin, numchips;
  enum {ENABLED = 1, DISABLED = 0};
  byte enableState;

  void write(byte n);
  void toggleLE();
  void toggleCLK();
  void init();
};


#endif
