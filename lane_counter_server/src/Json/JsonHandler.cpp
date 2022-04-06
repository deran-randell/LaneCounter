#include "Json/JsonHandler.h"
#include "Json/JsonFieldNames.h"

std::string JsonHandler::writeJson(const lane_counter_messages::CounterInfo& info)
{
	Json::Value root;

	root[json_field_names::DEVICE_ID] = info.device_id;
	root[json_field_names::MOTH_COUNT] = info.moth_count;
	root[json_field_names::TIMESTAMP] = info.timestamp;

	Json::StreamWriterBuilder builder;
	const std::string json_file = Json::writeString(builder, root);
	return json_file;
}


void JsonHandler::readJson(const char* json, int payload_len)
{
	Json::Value root;
	Json::CharReaderBuilder builder;
	JSONCPP_STRING err;

	const std::unique_ptr<Json::CharReader> reader(builder.newCharReader());

	if (!reader->parse(json, json + payload_len, &root, &err))
	{
		std::cout << "error" << std::endl;
	}

	Json::StreamWriterBuilder builder1;
	const std::string json_file = Json::writeString(builder1, root);
	std::cout << json_file << std::endl;
}