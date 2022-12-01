/*TODO List

Automate the calibration - detect dirtiness
Exit cleanly from calibration mode
Confirm calibration with offset, something is not right. Currently calibrating at 0 offset and adding offset after

*/ 

// Designed for LaneCounter Rev A PCB
//
// Moth Count Demo using digital sampling
// Input from each phototransistor (x32) is compared against a reference generated by the LTC1660 DACs [8 channel 10 bit DAC, daisy chained]
// Quad comparators LM239D (x8)
// IR emitters driven via TLC5917 8-channel drivers (x2)
//
// SPI Master
// - SPI to control IR Emitters (TLC5917)
// - SPI to control Ref Voltages (LTC1660 DACs) - Tested and working 2022/06/21




#include <stdio.h>
#include <stdint.h>
#include <SPI.h>
#include "TLC591x.h"
#include <EEPROM.h>

//Dac Parameters
#define numDACs 4
#define numChans 8
#define CALVERSION 4 //change this number if struct changes, breaking compatability with previous calibrations
#define MAX_SENSORS 32


//DENVER'S SERIAL-ETHERNET PACKING SETUP
#pragma once
#pragma pack(push,1)
#include <inttypes.h>


namespace lane_counter_messages {

	enum message_type : uint8_t
	{
		counter_info,
	};

	enum sensor_state : uint8_t
	{
		none,
		calibration_started,
		calibration_completed,
		cleaning_started,
		cleaning_completed
	};

	struct Header
	{
		message_type type;
		uint16_t message_size;
	};

	struct CounterInfo
	{
		uint16_t lane_number; // lane 0, 1 etc
		uint16_t device_id; // 0x56282
		uint32_t moth_count;
		uint32_t timestamp;
		sensor_state sensor_states[MAX_SENSORS];
	};
}

#pragma pack(pop)
/*
enum class SPIState : uint16_t
{
  COUNT_INVALID = 0x0000,
  COUNT_VALID   = 0x5555,
  WAITING       = 0x1111,
  COUNTING      = 0x2222,
  PAUSE_COUNT   = 0x3333,
  EMITTERS_OFF  = 0x6666,
  EMITTERS_ON   = 0x7777
};

SPIState the_spi_state;
*/


// The Arduino pin used for the various SPI slave select / chip select pins
static const uint8_t DAC_SS_PIN = 49;
//static const uint8_t HPPR_SS_PIN          = 10;       //Interboard1

static const uint8_t TLC5917_LE_PIN = 6;
static const uint8_t TLC5917_OE_PIN = 7;
static const uint8_t TLC5917_SDI = 51;
static const uint8_t CLK_PIN = 52;
static const unsigned int ALL_IR_ON = 65535;
static const unsigned int ALL_IR_OFF = 0;
unsigned int ledState = ALL_IR_ON;
TLC591x myLED(2, TLC5917_SDI, CLK_PIN, TLC5917_LE_PIN, TLC5917_OE_PIN); 

uint8_t refLevelOffsetDefault = 45; //should be a #define?
uint8_t SuspicionThreshDefault = 10; //should be a #define?
uint8_t IRLevelDefault = 110; //one value to represent all brightness
uint8_t IRLevelStep = 5; //steps to increment or decrement in
//uint8_t IRnumLeds = 16;
const int IRnumLEDs = 16;

//Defines which Vref is generated by which DAC
const uint8_t DACtoVref[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 20, 21, 24, 25, 26, 27, 28, 29, 30, 31};

// Digital input pins that the phototransistors are attached to
const uint8_t sensorPinsDig[] = { 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15 };  // Digital input pins that the phototransistors are attached to
//const int sensorPinsDig[] = { 22,     24,     26,     28,     30,     32,     34,     36,     A0,     A2,     A4,     A6,     A8,     A10,      A12,      A14      };  // Digital input pin, testing alternate.

static const uint8_t sensorsPerAxis = sizeof(sensorPinsDig) / sizeof(sensorPinsDig[0]);

// Previous digital state of the comparators
boolean prevSensorState[sensorsPerAxis];
// Current digital state of the comparators
boolean currSensorState[sensorsPerAxis];
// Previously stored trigger time
uint32_t prevTriggerTime[sensorsPerAxis];
uint32_t minTriggerTime = 2; //don't count successive triggers that happen within this perdiod (effectively debouncing)
uint8_t suspiciousTriggers[sensorsPerAxis]; //add
boolean adjacencyFilter = HIGH; //filter out concurrent triggers of adjacent sensors?



uint16_t trigCount = 0;  // Trigger count

//static const uint16_t TIME_BETWEEN_SPI_TXRX = 100;    // ms
static const uint16_t TIME_BETWEEN_PRINT = 1000;  // ms

uint32_t currMothCount = 0;
//uint32_t prevMothCount                    = 0;
//int32_t  mothDelta                        = 0;

uint32_t printTimer = millis();
//uint32_t spiTimer                         = millis();

bool serialPrint = false;
bool debugPrint = false; //print which sensor triggered

uint16_t globalTrigRefDefault = 400;
uint16_t triggerRef[sensorsPerAxis];



long randNumber;



const int TCP232_RST_PIN = 8;
bool TCP232_RST_STATE = HIGH;

lane_counter_messages::Header header = {};
lane_counter_messages::CounterInfo counter = {};



//Calibration Data Struct. Intending to save calibration data to eeprom
struct CalibrationTable
{
  uint8_t ver; // calibration table version, 
  uint16_t ser; //serial number of the hardware
  uint16_t lane; //lane number of the hardware
  uint8_t IRLevel; // IR emitter level 0 - 256
  uint16_t refLevels[numDACs * numChans]; //trigger reference levels 0-1023 //THIS IS NO LONGER NEEDED WITH AUTO CAL...
  uint16_t refLevelOffset; //This number will be subtracted from the trigger point found in the calibration routine and determines how low the voltage needs to dip when light is occluded to cause a trigger.
  uint8_t suspicionThresh; //rapid successive triggers allowed before recalibration is required.
};


CalibrationTable RAMtable;

int calibTableStartAddress = 0; //EEPROM address of calibration table first byte
const int calibTableOffsetVersion = 0;
const int calibTableOffsetSerial = sizeof(RAMtable.ver);
const int calibTableOffsetLane = calibTableOffsetSerial + sizeof(RAMtable.ser);
const int calibTableOffsetIRLevel = calibTableOffsetLane + sizeof(RAMtable.lane);
const int calibTableOffsetReflevels = calibTableOffsetIRLevel + sizeof(RAMtable.IRLevel);
const int calibTableOffsetRefLevelOffset = calibTableOffsetReflevels +  sizeof(RAMtable.refLevels);
const int calibTableOffsetsuspicionThresh = calibTableOffsetRefLevelOffset +  sizeof(RAMtable.refLevelOffset);


void initialiseSensorStateArrays() {
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    prevSensorState[pin] = 0;
    currSensorState[pin] = 0;
    prevTriggerTime[pin] = 0;
    suspiciousTriggers[pin] = 0;
  }
}



boolean cleaningHatchClosed() {
  //DERAN - this is a placeholder, in future we will return false if the GPIO of the cleaning hatch microswitch is tripped
  return true;
  
}

/*
 Functions for reading and writing persisten calibration data in EEPROM
 */

/*
 * DERAN: this function could return the index of the sensor that triggered a recalibration. 
 * You will have to return something else, such as "-1" and handle that when checkSuspiciousTriggers() is called
 */
boolean checkSuspiciousTriggers() {
  
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    if(suspiciousTriggers[pin] >= RAMtable.suspicionThresh) {
      Serial.print("sensor ");
      Serial.print(pin);
      Serial.println(" triggered recalibration");
      return true;
      
    }
  }
  return false;
}

boolean calibrationValid() {
  int v = EEPROM[calibTableStartAddress + calibTableOffsetVersion];
  //in future this should be a CRC check or similar, but for now we will just assume that there will not be a 1 in the first address unless we have loaded a calib table
  if(v == CALVERSION) {
    Serial.println(F("Cal Data Valid"));
    return HIGH;
  }
  else {
    Serial.println(F("Cal Data Invalid"));
    return LOW;
  }
}

void writeCalibration() {
  RAMtable.ver = CALVERSION;
  EEPROM.put(calibTableStartAddress, RAMtable);
  Serial.println(F("Cal Data Saved"));

  //Serial.println(" done");
}


void writeDefaultCalibration() {
  RAMtable.ver = CALVERSION;
  RAMtable.ser = 0;
  RAMtable.lane = 0;
  RAMtable.IRLevel = IRLevelDefault;
  RAMtable.refLevelOffset = refLevelOffsetDefault;
  for (int i = 0; i < numDACs * numChans; i++) {
    RAMtable.refLevels[i] = globalTrigRefDefault;
  }
  RAMtable.suspicionThresh = SuspicionThreshDefault;
  EEPROM.put(calibTableStartAddress, RAMtable);
  
}

void loadCalibration() {
  if (calibrationValid()) {
  EEPROM.get(calibTableStartAddress, RAMtable);
  
  Serial.println(F("Cal Data loaded"));
  }
  else {
    Serial.println(F("No Cal Data Detected"));
    //Serial.println("Storing default");
    writeDefaultCalibration();
    //Serial.println("Loading default");
    EEPROM.get(calibTableStartAddress, RAMtable);
    Serial.println(F("Cal Default Loaded"));
     
  }
  updateDACs(true);
  printCalibration();
}

void printCalibration() {
  Serial.print(F("EEPROM Data Table Version: "));
  Serial.println(RAMtable.ver);
  Serial.print(F("SN: "));
  Serial.println(RAMtable.ser);
  Serial.print(F("Lane: "));
  Serial.println(RAMtable.lane);
  Serial.print(F("IR Level (0-127 / 128-255): "));
  Serial.println(RAMtable.IRLevel);
  Serial.print(F("Sensor, Offset (0-1023): "));
  Serial.println(RAMtable.refLevelOffset);
  Serial.print(F("Suspcion Threshold (0-1023): "));
  Serial.println(RAMtable.suspicionThresh);
  Serial.println(F("Sensor, Reference Level (0-1023): "));
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
      Serial.print(pin);
      Serial.print(", ");
      Serial.println(RAMtable.refLevels[pin]);
  }
}

/*
  FUNCTIONS TO CONTROL LTC1660 DACS (REFERENCE VOLTAGES)
  Mode0: Clock is normally low (CPOL = 0), and the data is sampled on the transition from low to high (leading edge) (CPHA = 0).
 */


//set reference voltages as per RAMtable.refLevels array 
//Option to avoid applying the offset, as used in calibration process
void updateDACs(bool useOffset)  
{
  
  pinMode(DAC_SS_PIN, OUTPUT);
  digitalWrite(DAC_SS_PIN, HIGH);
  SPI.begin();
  //SPI.setClockDivider(SPI_CLOCK_DIV2);
  SPI.beginTransaction(SPISettings(8000000, MSBFIRST, SPI_MODE0));


  //DUE TO PIN MAPPING ERROR
  //Need a DAConPin[x] = Y mapping
    
  for (uint16_t DACchan = 0; DACchan < numChans; DACchan++) {
    digitalWrite(DAC_SS_PIN, LOW); 
    for (int DAC = (numDACs - 1); DAC >= 0; DAC--) {
      
      uint16_t value = RAMtable.refLevels[DACtoVref[DAC * numChans + DACchan]];
      if (useOffset) {
        if (value > RAMtable.refLevelOffset) {
          value -= RAMtable.refLevelOffset;
        }
        else {
          value = 0;
        }
      }
      uint16_t inputWord = (DACchan + 1) << 12 | value << 2; //note index is from 1
      /*
      Serial.print("Sensor: ");
      Serial.print(DAC * numChans + DACchan);
      Serial.print(" DAC: ");
      Serial.print(DAC);
      Serial.print(" chan: ");
      Serial.print(DACchan);
      Serial.print(" value: ");
      Serial.print(value);
      Serial.print(" inputword ");
      Serial.print(inputWord); 
      Serial.print(" / b ");
      
      for (int i = 15; i >= 0; i--)
      { 
        //print out the bits for debugging, in the format the control word is expected [4 bit address][10 bit value][2 bit dont care]
        if(i == 11 or i == 1) {
          Serial.print(" ");
        }
        bool b = bitRead(inputWord, i);
        Serial.print(b);
      }
      Serial.println();
      */
      
      SPI.transfer16(inputWord);
          
    
    }
    digitalWrite(DAC_SS_PIN, HIGH);  
  }
  
  SPI.endTransaction();
  SPI.end(); //Siphelo's fix for the LED issue allegedly. Weird but if it works, Woot!
}

void setAllRefs(uint16_t dacVal)  //set all reference voltages the same: 10 bit number
{
  for (int i = 0; i < numDACs * numChans; i++) {
    RAMtable.refLevels[i] = dacVal;
  }
  updateDACs(false);
}


/*
    FUNCTIONS TO CONTRL TLC5917 - SHOULD PROBABLY PUT IN ANOTHER FILE OR MAKE INTO A CLASS
*/

//IR LED Parameters
bool IRLEDValues[IRnumLEDs];


void emittersAllOn() {
  SPI.end();
  delay(1);
  //TLC591x myLED(2, TLC5917_SDI, CLK_PIN, TLC5917_LE_PIN, TLC5917_OE_PIN);
  myLED.displayDisable();
  myLED.print(ALL_IR_ON);
  myLED.displayEnable();
}


void emittersAllOff() {
  SPI.end();
  delay(1);
  //TLC591x myLED(2, TLC5917_SDI, CLK_PIN, TLC5917_LE_PIN, TLC5917_OE_PIN);
  myLED.print(ALL_IR_OFF);
  myLED.displayDisable();
}

void emitterSet(unsigned int emitters) {
  //turn emitters on/off defined by bits of an int 
  SPI.end();
  delay(1);
  myLED.displayDisable();
  myLED.print(emitters);
  myLED.displayEnable();
}

void emitterSetBrightness(uint8_t brightness) {
  SPI.end();
  delay(1);
 
  myLED.displayDisable();
  
  myLED.specialMode();
  
  uint8_t n[2];
  n[0] = brightness;
  n[1] = brightness;
  myLED.printDirect(n);
  
  myLED.normalMode();
  
  if (brightness > 0) {
    myLED.displayEnable();
  }
}

void TLC591xTestIterate(){ 
  Serial.println(F("Emitter Iterate function begins"));
  unsigned int onled = 1;
  //myLED.print(onled);
  
  for (unsigned int i = 0; i < IRnumLEDs; i++) {
   //emitterSet(onled << i);
   emitterSet(onled << i);
   //emitterSet(ALL);
   Serial.print(i);
   Serial.print(" : ");
   Serial.println(onled << i);
   delay(500);
  }
  emittersAllOn();
  Serial.println(F("Iterate function ends"));
}

void TLC591xTestIterateBrightness(){ 
  Serial.println(F("Brightness Iterate function begins"));
  //myLED.print(onled);

  //two brightness ranges, 0-127 / 128-254
  for (uint8_t i = 0; i < 255; i++) {
   emitterSetBrightness(i);
   Serial.print(i);
   Serial.print(",");
   delay(75);
   for (int pin = 0; pin < sensorsPerAxis; pin++) {
    Serial.print(digitalRead(sensorPinsDig[pin]));
    Serial.print(",");
  }
  Serial.println();
  }
  emitterSetBrightness(RAMtable.IRLevel);
  Serial.println(F("Iterate function ends, resetting to RAMtable.IRLevel"));
}

void autoCalibrate() {
  //automatically run calibration, and get back to business
  //not currently storing in eeprom since it could result in a ton of writes
  Serial.println("Automatic calibration begins...");
  findTriggerRef();
  Serial.println("Automatic calibration complete...");
  
  //reset the suspicion counters
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
      suspiciousTriggers[pin] = 0;
    }
  //possibly send/set a bit to be sent via ethernet
  
  
}

//facility to return an error code, 0 means good calibration
int findTriggerRef(){
   int returnCode= 0;
   unsigned long calStartTime = millis();
   
   int calibIterations = 5;
   Serial.println(F("Determine the reference point at which each sensor triggers"));
   Serial.print(F("Brightness: "));
   Serial.println(RAMtable.IRLevel);
   
   for(int i = 0; i < sensorsPerAxis; i++) {
    
    triggerRef[i] = 0;
   }
  
   
   for (int pin = 0; pin < sensorsPerAxis; pin++) {
     boolean pinState = LOW;
     
     Serial.print(pin);
     
     uint16_t testRefInc = 2;
     Serial.print(" / ");
     for  (uint16_t calibIteration = 0; calibIteration < calibIterations; calibIteration++)
     {
      uint16_t testRef = 0;
      
     while ( testRef < 1024 - testRefInc) {
        setAllRefs(testRef);
        delayMicroseconds(1); //let things stabilise (probably not needed at all since we've shown reaction time is < 0.5uS)
        
        pinState = digitalRead(sensorPinsDig[pin]);
          
        if (pinState == HIGH) {
          Serial.print(" ");
          Serial.print(testRef);
          Serial.print(" ");
          triggerRef[pin] = triggerRef[pin] + testRef;
          testRef = 2000; //break out of while loop
        }
        
        testRef += testRefInc;
         }
     }
     triggerRef[pin] = triggerRef[pin]/calibIterations;
     Serial.print(" / avg ");
     Serial.println(triggerRef[pin]);
     
    }
    Serial.println();

    for (int pin = 0; pin < sensorsPerAxis; pin++) {
      Serial.print(RAMtable.IRLevel);
      Serial.print(",");
      Serial.print(pin);
      Serial.print(",");
      
      
      Serial.println(triggerRef[pin]);
      RAMtable.refLevels[pin] = (triggerRef[pin]);
      
    }
    Serial.println(F("Updating Trigger References"));
    updateDACs(true);

    Serial.print("Calibration time: ");
    Serial.println(millis() - calStartTime);

    return returnCode;
}

void setupEthernet() {
  Serial2.begin(115200); //Serial via Ethernet Module
  header.type = lane_counter_messages::counter_info;
  header.message_size = sizeof(lane_counter_messages::CounterInfo);


  //counter.lane_number = 1U;
  counter.lane_number = RAMtable.lane;
  counter.device_id = RAMtable.ser;
  counter.moth_count = 0;
  counter.timestamp = millis();
  

  pinMode(TCP232_RST_PIN, OUTPUT);
  digitalWrite(TCP232_RST_PIN,TCP232_RST_STATE);

}

void sendEthernet() {
  //counter.moth_count += random(101);
  //counter.timestamp = millis();
  counter.timestamp = millis();
  
  Serial2.write((uint8_t*)&header, sizeof(lane_counter_messages::Header));
  Serial2.write((uint8_t*)&counter, sizeof(lane_counter_messages::CounterInfo));
}

void printOperationCommands() {
  Serial.println("Counter Active");
  Serial.println();
  //ClearAndHome();
  Serial.println("Press 't' to toggle serial print on / off.");  // Toggle the serial output off to keep more cycles for the counting
  Serial.println("Press 'T' to toggle debug trigger print on / off.");  
  
}

void printCalibrationCommands() {
        Serial.println();
        Serial.println(F("Calibration Commands")); 
        Serial.println(F("x : exit")); 
        Serial.println(F("- : decrease IR level"));  
        Serial.println(F("+ : increase IR level"));  
        Serial.println(F("n : IR leds all on")); 
        Serial.println(F("f : IR leds all off"));  
        Serial.println(F("a : IR leds alternate on")); 
        Serial.println(F("d : decrease reference level")); 
        Serial.println(F("i : increase reference level")); 
        Serial.println(F("l : iterate through emitters")); 
        Serial.println(F("b : brightness step test")); 
        Serial.println(F("r : print trigger reference levels")); 
        Serial.println(F("w : store calibration to eeprom"));  
        Serial.println(F("p : calibrate trigger point"));  
        Serial.println(F("o : set trigger offset in form oXX"));  
        Serial.println(F("j : adjacency filter toggle"));  
        Serial.println(F("Sxxx : set serial number to xxx")); 
        Serial.println(F("Lxxx : set lane number to xxx")); 
        Serial.println(F("txxx yyy : set ref X to level Y"));
        Serial.println();      
}

void setup() {
  Serial.begin(115200); //Serial via USB interface
  Serial.println();
  Serial.print(F("Compile Date: "));
  Serial.println(__DATE__ " " __TIME__);
  Serial.println();
  Serial.println(F("Counter Initialization"));
  
  Serial.println(F("Read calibration from EEPROM"));
  loadCalibration();

  

  setupEthernet(); //after "loadCalibration" since lane number is in eeprom
  
  emittersAllOn();
  emitterSetBrightness(RAMtable.IRLevel);
  Serial.print(F("...Emitters enabled at level: "));
  Serial.println(RAMtable.IRLevel);
  

  //create arrays - used in digital ref
  initialiseSensorStateArrays();
  
  //setupAllDACs();
  //Serial.print("...Trigger references at level: ");
  //Serial.println(globalTrigRefDefault);
  

  
  //Serial.println("...enabling sensors...");
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    pinMode(sensorPinsDig[pin], INPUT);
  }


  Serial.println(F("Override static cal with dynamic"));
  Serial.println(F("NB TODO: REMOVE SETPOINT DATA FROM EEPROM TABLE"));
  autoCalibrate();
  
  delay(250);
  
  
  
  printOperationCommands();
}

void loop() {
  if (Serial.available()) {
    // read the incoming byte:
    char c = Serial.read();

    switch (c) {
      case 't':  // Toggle serial printing on and off
        {
          serialPrint = !serialPrint;
          break;
        }
      case 'T':  // Toggle serial debug printing on and off
        {
          debugPrint = !debugPrint;
          if(debugPrint) {
            Serial.println(F("Debug Print Enabled"));
          }
          else
          {
            Serial.println(F("Debug Print Disabled"));
          }  
          break;
        }
      case 'r':  // Reset counts
        {
          currMothCount = 0;  // Reset the moth counts
          //TransferValue32(currMothCount);
          break;
        }
      case '-':  // Decrease IR level
        {

          if(RAMtable.IRLevel < IRLevelStep) {
            RAMtable.IRLevel = 0;
          }
          else
          {
            RAMtable.IRLevel -= IRLevelStep;
          }
          Serial.print("IR Level: ");
          Serial.println(RAMtable.IRLevel);
          emitterSetBrightness(RAMtable.IRLevel);
          //TLC5917setGlobalBrightness(RAMtable.IRLevel);
          
          break;
        }
      case '+':  // Increase IR level
        {
          
          if(255 - RAMtable.IRLevel <  IRLevelStep) {
            RAMtable.IRLevel = 255;
          }
          else
          {
            RAMtable.IRLevel += IRLevelStep;
          }
          Serial.print("IR Level: ");
          Serial.println(RAMtable.IRLevel);
          emitterSetBrightness(RAMtable.IRLevel);
          //TLC5917setGlobalBrightness(RAMtable.IRLevel);
          
          break;
        }
      case 'd':  // Decrease reference level
        {
          globalTrigRefDefault -= 10;
          if(globalTrigRefDefault > 1023){
            globalTrigRefDefault = 0;
          }
          Serial.print("Trigger Ref Level: ");
          Serial.println(globalTrigRefDefault);
          setAllRefs(globalTrigRefDefault);
          break;
        }
      case 'i':  // Increase reference level
        {
          globalTrigRefDefault = min(globalTrigRefDefault + 10, 1023);
          Serial.print("Trigger Ref: ");
          Serial.println(globalTrigRefDefault);
          setAllRefs(globalTrigRefDefault);
          break;
        }
      case 'j': //toggle adjaceny filter
          {
            adjacencyFilter = !adjacencyFilter;
            if(adjacencyFilter) {
              Serial.println("Adjacency filter enabled");
            }
            else {
              Serial.println("Adjacency filter disabled");
            }
            break;
          }
      case 'O': //set offset to X
          {
            boolean inputGood = HIGH;
            int offset = Serial.parseInt();
            if((offset < 0) || (offset > 1023)) {
              inputGood = LOW;
            }
            

            if (inputGood) {
              RAMtable.refLevelOffset = offset;
              Serial.print("Setting offset to ");
              Serial.println(offset);
              updateDACs(true);
            }
            else {
              Serial.println("Invalid arguments. Expected in form OXXX where xxx is a positive offset that will be subtracted from DAC setpoints");
            }
            break;
          }
      case 'c':  // Calibration mode
        {
          printCalibrationCommands();
          
          Serial.print("Entering Calibration Mode");
          for (int i = 0; i <= 10; i++) {
            delay(50);
            Serial.print('.');
          }
          Serial.println();

          CalibrationLoop();
          
          Serial.print("Entered Operational Mode");
          
          break;
        }
    default : //if commands doesnt match anything, print out the help
        {
          printOperationCommands();
          break; 
        }
       
        
    }

    ClearAndHome();  // Clear and home the serial print cursor
  }

  SetValue();

  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    currSensorState[pin] = digitalRead(sensorPinsDig[pin]);
  }


  /*DERAN: The whole counting loop below should only be run if the cleaning hatch is closed
  
   * if(cleaningHatchClosed()) {
   *   if the in the previous loop the hatch was open {
   *      report that cleaning has completed
   *      clear the cleaning bits of the message struct
   *      }
   *   run the counting loop as usual
   *   
   *  }
   *  else
   *  {
   *    skip the counting loop
   *    if in the previous loop the hatch was closed, report that cleaning has started
   *    
   *  }
    
  
  */

  //COUNTING LOOP - TEST PIN STATE CHANGES (should probably be wrapped in a function at this point)
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    //increment on a rising edge
    if ((currSensorState[pin] != prevSensorState[pin]) && (prevSensorState[pin] == LOW)) {

      uint32_t currentMillis = millis();

      if ((currentMillis - prevTriggerTime[pin]) >= minTriggerTime) {
        //strore when this pin last triggered, for debouncing purposes
        prevTriggerTime[pin] = currentMillis;
        
        
        if (adjacencyFilter == HIGH) {
          //only increment the count if the adjacent sensor hasn't already triggerd
          boolean adjacentTrigger = LOW;

        
        if (pin > 0) {
          if (currSensorState[pin-1]) adjacentTrigger = HIGH;
        }
        if (pin < sensorsPerAxis - 1) {
          if (currSensorState[pin + 1]) adjacentTrigger = HIGH;
        }
          if (adjacentTrigger == LOW)
          {
            trigCount++;
          }
        }
        else
        {
          trigCount++;
        }
      }
      else {
        //if this trigger happened within the miniumum trigger time it could just be debouncing, or it could be a sensor getting occluded. Once we hit the threshhold we need to recalibrate.
        suspiciousTriggers[pin] += 1;
      }
    }


    
    prevSensorState[pin] = currSensorState[pin];
  }
   
    if (debugPrint) {
      if (trigCount != 0)
      {
        
        Serial.print("Trig: ");
        for (int pin = 0; pin < sensorsPerAxis; pin++) {
          if(prevSensorState[pin] = currSensorState[pin]) {
            Serial.print("1");  
          }
          else
          {
            Serial.print("_");
          }
          Serial.print(" ");
          }
          Serial.print(" prevMothCnt: ");
          Serial.print(currMothCount); 
          Serial.print(" : ");
          Serial.print(millis());
          Serial.println();
        }
    }
  SendData();

   //DERAN if you change checkSuspiciousTriggers() to return an int representing the sensor that trigger a calibration then this conditional check will have to change
   // for example it could be if(checkSuspiciousTriggers != -1)
  if(checkSuspiciousTriggers()) {
    Serial.println("Recalibration required");
    autoCalibrate();
    
  }
    
}
  


void SetValue() {
  uint16_t mothCount = ((uint16_t)((trigCount * 1.0) ));
  currMothCount += mothCount;
  trigCount = 0;
}

void ClearAndHome() {   // Clear and return cursor home - doesn't work in Serial Monitor
  Serial.write(27);     // ESC
  Serial.print("[2J");  // Clear screen
  Serial.write(27);     // ESC
  Serial.print("[H");   // Cursor to home
}

void SendData() {
  if (printTimer > millis())  // if millis() or timer wraps around, we'll just reset it
  {
    printTimer = millis();  // Reset the timer
  }

  if (millis() - printTimer >= TIME_BETWEEN_PRINT) {
    uint32_t timeToSend = millis() - printTimer;
    printTimer = millis();  // Reset the timer

    //this is a dirty test, much cleaning required. Sis.
    counter.moth_count = currMothCount;
    sendEthernet();

    if (serialPrint) {
      Serial.print("Moth count = ");
      Serial.println(currMothCount, DEC);

      Serial.print("Time delta = ");
      Serial.print(timeToSend, DEC);
      Serial.println(" ms.");

      Serial.println("-------------------------------");
    }
  }
}


void printCalibState() {
  
  Serial.print("IR Level: ");
  Serial.println(RAMtable.IRLevel);
  Serial.print("Offset: ");
  Serial.println(RAMtable.refLevelOffset);
  
  // Calibration array
  delay(2); //since this is usually called after a change, lets give things time to settle
  boolean digiSensorState[sensorsPerAxis]; 
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    digiSensorState[pin] = digitalRead(sensorPinsDig[pin]);
  }

  Serial.println("Sensor, Reference, State");
  char buff[8];
  for (int pin = 0; pin < sensorsPerAxis; pin++) {
    
    sprintf(buff,"%2i %4i %1i",pin,RAMtable.refLevels[pin],digiSensorState[pin]);
    Serial.println(buff);
    
  }

}

void CalibrationLoop() {
  bool calibrating = true;
  
  while (calibrating) {
    //check for input
    if (Serial.available()) {
      // read the incoming byte:
      char c = Serial.read();

      switch (c) {
        case 'x':
          {
            Serial.println("Exiting calibration mode.");
            calibrating = false;
            break;
          }
        case '-':
          {

              if(RAMtable.IRLevel < IRLevelStep) {
              RAMtable.IRLevel = 0;
            }
            else
            {
              RAMtable.IRLevel -= IRLevelStep;
            }
            //RAMtable.IRLevel = max(RAMtable.IRLevel - 8, 0);
            emitterSetBrightness(RAMtable.IRLevel);
            printCalibState();
            
            break;
          }
        case '+':
          {
            if(255 - RAMtable.IRLevel <  IRLevelStep) {
              RAMtable.IRLevel = 255;
            }
            else
            {
              RAMtable.IRLevel += IRLevelStep;
            }
            //RAMtable.IRLevel = max(RAMtable.IRLevel + 8, 0);
            emitterSetBrightness(RAMtable.IRLevel);
            printCalibState();
            break;
          }
        case 'd':
          {
            globalTrigRefDefault -= 10;
            if(globalTrigRefDefault > 1023){
              globalTrigRefDefault = 0;
            }
            
            setAllRefs(globalTrigRefDefault);
            printCalibState();
            break;
          }
        case 'i':
          {
            ;

            globalTrigRefDefault = min(globalTrigRefDefault + 10, 1023);
            setAllRefs(globalTrigRefDefault);
            printCalibState();
            break;
          }
        case 'n':
          {
            emittersAllOn();
            Serial.print("Emitters All ON, brightness: ");
            Serial.println(RAMtable.IRLevel);
            //printCalibState();
            break;
          }
        case 'f':
          {
            emittersAllOff();
            Serial.println("Emitters All Off");
            //printCalibState();
            break;
          }
        case 'a':
          {
            emitterSet(43690); // 1010 1010 1010 1010
            Serial.println("Alternate Emitters On");
            //printCalibState();
            break;
          }
      case 'b': //step down in brightness for testing
          {
            
            Serial.println("Testing Brightness");
            TLC591xTestIterateBrightness();
            break;
          }

      case 'r': //print out trigger references
          {
            
            Serial.println(F("Print Trigger References"));
            Serial.println(F("Illumination below this level results in a moth count"));
            Serial.println(F("WARNING: bug currently requires reset before offset calibration"));
            printCalibState();
            break;
          }
      case 'w': //store calibration data to eeprom
          {
            Serial.println("Storing data to eeprom");
            writeCalibration();
            break;
          }
      case 'p': 
          {
            Serial.println("Finding Trigger Point");
            findTriggerRef();
            break;
          }
      case 'j': //toggle adjaceny filter
          {
            adjacencyFilter = !adjacencyFilter;
            if(adjacencyFilter) {
              Serial.println(F("Adjacency filter enabled"));
            }
            else {
              Serial.println(F("Adjacency filter disabled"));
            }
            break;
          }
      case 'S': //set serial number
          {
            int s = Serial.parseInt();
            if (s != 0) {
              RAMtable.ser = s;
              Serial.print("Setting serial number to: ");
              Serial.println(s);
              Serial.println("WARNING: SHOULD NOT BE SAVED OUTSIDE OF FACTORY");
            }
            else {
              Serial.println("Invalid number. Expected in form Sxxx where xxx is an integer. No Spaces.");
            }
            break;
          }          
      case 'L': //set serial number
          {
            int L = Serial.parseInt();
            if (L != 0) {
              RAMtable.lane = L;
              Serial.print("Setting lane number to: ");
              Serial.println(L);
            }
            else {
              Serial.println("Invalid number. Expected in form Lxxx where xxx is an integer. No Spaces.");
            }
            break;
          }
      case 't': //set ref X to level Y
          {
            boolean inputGood = HIGH;
            int pin = Serial.parseInt();
            if((pin < 0) || (pin >= numDACs*numChans)) {
              inputGood = LOW;
            }
            
            if (Serial.read() != ' ') {
              inputGood = LOW;
            }
            
            int level = Serial.parseInt();
            if((level < 0) || (level > 1023)) {
              inputGood = LOW;
            }
            
            if (inputGood) {
              RAMtable.refLevels[pin] = level;
              Serial.print("Setting sensor ");
              Serial.print(pin);
              Serial.print(" reference to: ");
              Serial.println(level);
              updateDACs(true);
            }
            else {
              Serial.println("Invalid arguments. Expected in form tXXX YYY where xxx is a pin and YYY is a level. Single Space between XXX and YYY");
            }
            break;
          }
       case 'o': //set offset to X
          {
            boolean inputGood = HIGH;
            int offset = Serial.parseInt();
            if((offset < 0) || (offset > 1023)) {
              inputGood = LOW;
            }
            

            if (inputGood) {
              RAMtable.refLevelOffset = offset;
              Serial.print("Setting offset to ");
              Serial.println(offset);
              updateDACs(true);
            }
            else {
              Serial.println("Invalid arguments. Expected in form OXXX where xxx is a positive offset that will be subtracted from DAC setpoints");
            }
            break;
          }
        case 'h':
       {
        printCalibrationCommands();
        break;
       }          
        case 'l':  // cycle INDIVIDUAL LED for testing
          {
            Serial.println("Iterate test begins");
            TLC591xTestIterate();
            Serial.println("Iterate test ends");
            break;
          }     
      }
    }
  }
}
