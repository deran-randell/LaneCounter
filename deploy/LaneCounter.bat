@echo off

rem Start lane_counter_server
cd /D D:\LaneCounter\lane_counter_server
start lane_counter_server.exe config.ini

rem Start node.js server
cd /D D:\LaneCounter\web_app\server
start npm start

rem Start serving react app
cd /D D:\LaneCounter\web_app\client
start serve -s -C build