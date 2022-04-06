#pragma pack(push,1)

namespace lane_counter_messages {

  enum message_type : uint8_t
  {
    counter_info,
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
  };
}

#pragma pack(pop)

int TCP232_RST_PIN = 8;
bool TCP232_RST_STATE = HIGH;

lane_counter_messages::Header header = {};
lane_counter_messages::CounterInfo counter = {};


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial2.begin(115200);
  randomSeed(analogRead(0));

  header.type = lane_counter_messages::counter_info;
  header.message_size = sizeof(lane_counter_messages::CounterInfo);

  counter.lane_number = 1U;
  counter.device_id = 1234U;
  counter.moth_count = 0;
  counter.timestamp = millis();
  

  pinMode(TCP232_RST_PIN, OUTPUT);
  digitalWrite(TCP232_RST_PIN,TCP232_RST_STATE);

 
}





void loop() {
  // put your main code here, to run repeatedly:


  //randNumber = random(101);
  //Serial.println(randNumber);
  
  
  Serial2.write((uint8_t*)&header, sizeof(lane_counter_messages::Header));
  Serial2.write((uint8_t*)&counter, sizeof(lane_counter_messages::CounterInfo));

  counter.moth_count += random(101);
  counter.timestamp = millis();

 
  delay(1000);
}
