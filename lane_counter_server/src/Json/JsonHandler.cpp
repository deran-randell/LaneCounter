#include "Json/JsonHandler.h"
#include "Json/JsonFieldNames.h"
#include <boost/json.hpp>
#include <chrono>

std::string JsonHandler::writeJson(const lane_counter_messages::CounterInfo& info)
{
	//Json::Value root;

	//root[json_field_names::DEVICE_ID] = info.device_id;
	//root[json_field_names::MOTH_COUNT] = info.moth_count;
	//root[json_field_names::TIMESTAMP] = info.timestamp;

	//Json::StreamWriterBuilder builder;
	//const std::string json_file = Json::writeString(builder, root);
	//return json_file;

	/*Using Boost lib for json */
	boost::json::object json_object;
	boost::json::array sensor_state(MAX_SENSORS);

	std::copy(info.sensor_states, info.sensor_states + MAX_SENSORS, sensor_state.begin());
	boost::json::value sensor_state_(std::move(sensor_state));

	json_object[json_field_names::DEVICE_ID] = info.device_id;
	json_object[json_field_names::MOTH_COUNT] = info.moth_count;
	json_object[json_field_names::TIMESTAMP] = info.timestamp;
	json_object[json_field_names::SENSOR_STATES] = sensor_state_;


	std::string json_string = boost::json::serialize(json_object);

	return json_string;
}


void JsonHandler::readJson(const char* json, int payload_len)
{
	//Json::Value root;
	//Json::CharReaderBuilder builder;
	//JSONCPP_STRING err;

	//const std::unique_ptr<Json::CharReader> reader(builder.newCharReader());

	//if (!reader->parse(json, json + payload_len, &root, &err))
	//{
	//	std::cout << "error" << std::endl;
	//}

	//Json::StreamWriterBuilder builder1;
	//const std::string json_file = Json::writeString(builder1, root);
	//std::cout << json_file << std::endl;

	try {
		std::string myString(json, payload_len);
		auto parsed_data = boost::json::parse(myString);
		//std::cout << boost::json::value_to<std::uint32_t>(parsed_data.at(json_field_names::DEVICE_ID)) << '\n';

		auto parsed_string = boost::json::serialize(parsed_data);
		std::cout << parsed_string << '\n';

	}
	catch (const std::exception& e)
	{
		std::cerr << e.what() << '\n';
	}
}