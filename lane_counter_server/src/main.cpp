#include <iostream>
#include <memory>
#include <thread>

#include "Comms/LaneCounterServer.h"
#include "Mqtt/MqttPublisherInterface.h"
#include "Mqtt/MqttClient.h"
#include "MqttManager.h"

#include "ConfigReader/IniConfigReader.h"

int main(int argc, char** argv)
{
	auto config_file = (argc > 1) ? argv[1] : "config.ini";
	IniConfigReader reader(config_file);

	boost::asio::io_context main_context;
	LaneCounterServer server(main_context, reader.getTcpServerPort());
	cybicomms::ContextManager context_manager(main_context);

	MqttClient mqtt_client(reader.getMqttAddress());
	MqttManager manager(mqtt_client);

	server.setTcpHandler(&manager);
	context_manager.start();

	mqtt_client.subscribe(nullptr, "#"); // remove in production

	std::thread mqtt_client_loop_thread([&] {
		while (1)
		{
			mqtt_client.run();
			std::this_thread::sleep_for(std::chrono::milliseconds(100));
		} 
	});

	mqtt_client_loop_thread.join();
	return 0;
}