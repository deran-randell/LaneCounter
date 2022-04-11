# Lane Counter Server
This application is responsible for converting custom tcp messages from each moth counter device into a mqtt topic with a json payload


## Deploy
The application is run as:

>lane\_counter\_server config.ini


## Config File - config.ini

MQTT Broker Address - IP address of mosquitto or other MQTT message brokers

>MQTT\_BROKER\_ADDRESS = 127.0.0.1

MQTT Broker Address - IP address of mosquitto or other MQTT message brokers usually 1883

>MQTT\_BROKER\_PORT = 1883

TCP server port that the moth counter devices should connect to

>SERVER\_PORT = 5000


## Dependencies
>The lane\_counter\_server application requires the following DLL's to run:

- jsoncpp.dll
- mosquittopp.dll