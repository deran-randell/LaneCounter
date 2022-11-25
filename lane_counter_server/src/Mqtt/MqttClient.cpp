#include "Mqtt/MqttClient.h"
#include "Json/JsonHandler.h"

MqttClient::MqttClient(const std::string& broker_ip_address, uint16_t port)
	: mosqpp::mosquittopp("LaneClient")
{
	int major, minor, rev;
	mosqpp::lib_version(&major, &minor, &rev);
	std::cout <<"Mosquitto Lib Version: " << major << "." << minor << "." << rev << std::endl;
	
	mosqpp::lib_init();
	this->threaded_set(true);
	this->connect(broker_ip_address.c_str(), port, 1000);
}

MqttClient::~MqttClient()
{
	mosqpp::lib_cleanup();
}

void MqttClient::on_connect(int rc)
{
	std::cout << "Connected to MQTT Broker" << std::endl;
}

void MqttClient::on_message(const struct mosquitto_message* message)
{
	std::cout << "Topic: " << message->topic << std::endl;
	JsonHandler::readJson((const char*)message->payload, message->payloadlen);
}

void MqttClient::on_subscribe(int mid, int qos_count, const int* granted_qos)
{
	//std::cout << "Subscription succeeded." << std::endl;
}

// Inherited via IMqttPublisher
void MqttClient::publish_topic(const std::string topic, int payload_len, const void* payload)
{
	this->publish(nullptr, topic.c_str(), payload_len, payload,2);
}

void MqttClient::on_disconnect(int rc)
{
	std::cout << "Disconnected from MQTT Broker" << rc << "\n";
}

void MqttClient::run()
{
	rc = loop();
	if (rc)
	{
		//reconnect_async();
		reconnect();
	}
	//this->loop_forever();
}