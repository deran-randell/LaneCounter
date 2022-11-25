#pragma once

#include <iostream>
#include "mosquittopp.h"
#include "Mqtt/MqttPublisherInterface.h"

/*
libmosquitto provides thread safe operation, with the exception of mosquitto_lib_init which is not thread safe.

If your application uses threads you must use mosquitto_threaded_set to tell the library this is the case,
otherwise it makes some optimisations for the single threaded case that may result in unexpected behaviour for the multi threaded case.

*/
class MqttClient : public mosqpp::mosquittopp, public MqttPublisherInterface
{
	int rc = 0;
public:
	MqttClient(const std::string& broker_ip_address, uint16_t port = 1883);

	~MqttClient();

	void on_connect(int rc)  override;

	void on_message(const struct mosquitto_message* message) override;

	void on_subscribe(int mid, int qos_count, const int* granted_qos) override;
	
	virtual void on_disconnect(int rc) override;
	
	// Inherited via IMqttPublisher
	virtual void publish_topic(const std::string topic, int payload_len, const void* payload) override;



	void run();
};
