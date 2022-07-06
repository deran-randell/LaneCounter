# **Lane Counter Web Applications**
The project receives moth data from from an MQTT broker and stores it in a MySQL database. 
The data is served to a web UI.

## **Run**
Deployment folder structure:
> LaneCounter/lane_counter_server - for interfacing with the counter hardware, and sending the count to the MQTT broker
> LaneCounter/web_app/server - for receiving the data from the MQTT broker and storing it in a MySQL database; serving the data for the web ui (node.js, express, MySQL)
> LaneCounter/web_app/client/build - web client to display the data (react)


web_app/server>npm start
web_app/client>serve -s -C build
lane_counter_server>lane_counter_server.exe config.ini