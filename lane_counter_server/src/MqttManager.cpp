#include "MqttManager.h"
#include "Json/JsonHandler.h"
#include "Mqtt/MqttTopicNames.h"

MqttManager::MqttManager(MqttPublisherInterface& publisher)
	: mqtt_publisher_{ &publisher }
{}

void MqttManager::handleTcpMessage(const lane_counter_messages::CounterInfo& counter_info) 
{
	std::string counter_topic = mqtt_topic_names::LANE + std::to_string(counter_info.lane_number);

	auto json_string = JsonHandler::writeJson(counter_info);

	if (mqtt_publisher_)
		mqtt_publisher_->publish_topic(counter_topic, (int)json_string.length(), (const void*)json_string.c_str());
}