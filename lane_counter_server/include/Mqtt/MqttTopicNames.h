#pragma once
#include <iostream>

// for now the same as json field names
namespace mqtt_topic_names
{
	const std::string DEVICE_ID = "device_id";
	const std::string MOTH_COUNT = "moth_count";
	const std::string TIMESTAMP = "timestamp";
	const std::string LANE = "lane"; // add lane number at runtime if this is used as a json field e.g. "lane" + std::to_string(info.lane_number);
}