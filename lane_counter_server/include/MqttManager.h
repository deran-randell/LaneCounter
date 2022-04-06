#pragma once
#include "LaneCounterMsgTypes.h"
#include "Mqtt/MqttPublisherInterface.h"
#include "Comms/TcpMsgHandlerInterface.h"

#include <string>

class MqttManager : public TcpMsgHandlerInterface
{
	MqttPublisherInterface* mqtt_publisher_ = nullptr;

public:
	MqttManager(MqttPublisherInterface& publisher);

	// Inherited via TcpMsgHandler
	virtual void handleTcpMessage(const lane_counter_messages::CounterInfo& counter_info) override;
};
