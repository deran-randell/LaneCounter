#pragma once
#include <string>

class MqttPublisherInterface
{
public:
	virtual ~MqttPublisherInterface() = default;
	virtual void publish_topic(const std::string topic, int payload_len, const void* payload) = 0;
};