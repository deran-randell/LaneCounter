# **Lane Counter Server**
This application is responsible for converting custom tcp messages from each moth counter device into a mqtt topic with a json payload


## **Deploy**
The application is run as:

> `lane_counter_server.exe config.ini`


## **Config File** - config.ini

MQTT Broker Address - IP address of mosquitto or other MQTT message brokers

>`MQTT_BROKER_ADDRESS = 127.0.0.1`

MQTT Broker Address - IP address of mosquitto or other MQTT message brokers usually 1883

>`MQTT_BROKER_PORT = 1883`

TCP server port that the moth counter devices should connect to

>`SERVER_PORT = 5000`


## **Dependencies**
>The lane\_counter\_server application requires the following DLL's to run:

- jsoncpp.dll
- mosquittopp.dll
- libcrypto-1_1-x64.dll
- libssl-1_1-x64.dll
- mosquittopp.dll
- mosquitto_dynamic_security.dll