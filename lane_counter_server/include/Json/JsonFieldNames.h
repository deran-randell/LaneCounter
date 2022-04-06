#pragma once
#include <string>

// for now the same as mqtt topic names
namespace json_field_names
{
	const std::string DEVICE_ID = "device_id";
	const std::string MOTH_COUNT = "moth_count";
	const std::string TIMESTAMP = "timestamp";
	const std::string LANE = "lane"; // add lane number at runtime if this is used as a json field e.g. "lane" + std::to_string(info.lane_number);
}