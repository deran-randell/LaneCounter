#pragma once
#include <string>
#include <iostream>

#include "json/json.h"
#include "LaneCounterMsgTypes.h"

class JsonHandler
{
public:
	static std::string writeJson(const lane_counter_messages::CounterInfo& info);
	static void readJson(const char* json, int payload_len);
};