#include "ConfigReader/IniConfigReader.h"
#include <iostream>

const std::string DEFAULT_MQTT_BROKER_ADDRESS = "127.0.0.1";
const uint16_t DEFAULT_MQTT_BROKER_PORT = 1883U;
const uint16_t DEFAULT_SERVER_PORT = 5000U;

IniConfigReader::IniConfigReader(const std::string& config_file)
	: pt_()
{
	try {
		boost::property_tree::ini_parser::read_ini(config_file, pt_);
	}
	catch (const std::exception& e) {
		std::cout << e.what() << std::endl;
	}
}

std::string IniConfigReader::getMqttAddress() const
{
	auto address = getValue<std::string>(ini_field_names::MQTT_BROKER_ADDRESS, DEFAULT_MQTT_BROKER_ADDRESS);
	return address;
}

uint16_t IniConfigReader::getMqttPort() const
{
	auto port = getValue<uint16_t>(ini_field_names::MQTT_BROKER_PORT, DEFAULT_MQTT_BROKER_PORT);
	return port;
}

uint16_t IniConfigReader::getTcpServerPort() const
{
	auto port = getValue<uint16_t>(ini_field_names::SERVER_PORT, DEFAULT_SERVER_PORT);
	return port;
}