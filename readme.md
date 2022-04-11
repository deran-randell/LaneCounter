# **Lane Counter**
Project for retrieving moth data from the moth counter device and displaying the results using a web ui.


## **Deployment**
The following applications are required for deployment:

1. lane\_counter\_server
2. web\_app/server
3. web\_app/client
4. mosquitto mqtt broker running



### **Mosquitto Broker setup to allow external connections to the broker**

1. Navigate to installation path of the mosquitto broker application and open the ***mosquitto.conf*** file.

> The installation path is usually(unless specified differently during installation): ***C:\Program Files\mosquitto***

2. In the mosquitto.conf file, find the ***allow_anonymous*** section and set it to the following:

> allow_anonymous true


3. In the mosquitto.conf file, find the ***listener*** section and set it to the following:
> listener 1883 0.0.0.0