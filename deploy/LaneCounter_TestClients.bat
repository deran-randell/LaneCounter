@echo off

rem Start lane_counter_server
rem cd /D D:\LaneCounter\lane_counter_server
cd /D C:\Projects\LaneCounter\deploy\lane_counter_server
start lane_counter_server.exe config.ini

rem Start node.js server
rem cd /D D:\LaneCounter\web_app\server
cd /D C:\Projects\LaneCounter\web_app\server
start npm start

rem Start serving react app
rem cd /D D:\LaneCounter\web_app\client
cd /D C:\Projects\LaneCounter\web_app\client
start serve -s -C build

rem Start test clients
rem cd /D D:\LaneCounter\lane_counter_server\test_moth_client
cd /D C:\Projects\LaneCounter\deploy\lane_counter_server\test_moth_client
start test_moth_client.exe 1 1111
TIMEOUT 2
start test_moth_client.exe 2 2222
TIMEOUT 3
start test_moth_client.exe 3 3333
