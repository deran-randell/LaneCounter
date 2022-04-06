#pragma once
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/ini_parser.hpp>
#include "ConfigReader/IniFieldNames.h"
#include <iostream>

class IniConfigReader
{
	boost::property_tree::ptree pt_;
public:
	IniConfigReader(const std::string& config_file);

	std::string getMqttAddress() const;
	uint16_t getMqttPort() const;
	uint16_t getTcpServerPort() const;

private:
	template <class T>
	T getValue(const std::string& field, const T& default_value) const;
};

template<class T>
inline T IniConfigReader::getValue(const std::string& field, const T& default_value) const {
	T value;

	try {
		value = pt_.get<T>(field);
	}
	catch (const std::exception& e) {
		std::cout << e.what() << " - Using Default Settings" << std::endl;
		value = default_value;
	}
	return value;
}