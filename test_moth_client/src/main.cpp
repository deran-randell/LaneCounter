#include "cybicomms/tcp_client.h"
#include "cybicomms/context_manager.h"
#include <iostream>
#include "LaneCounterMsgTypes.h"


class TestClient : public cybicomms::ServerHandler
{
	cybicomms::TcpClient client;
public:
	TestClient(boost::asio::io_context& io_context,const std::string& ip, uint16_t port)
		: client{io_context,ip, port , *this}
	{
	}


	// Inherited via ServerHandler
	virtual void handleConnected() override
	{
		std::cout << "Connected to server \n";
	}

	virtual void handleDisconnected() override
	{
		
	}

	virtual size_t getReadSize() override
	{
		return sizeof(lane_counter_messages::Header);
	}

	virtual void handleRead(const std::vector<uint8_t>& message, boost::shared_ptr<Socket> socket, Endpoint remote_endpoint) override
	{
		boost::system::error_code error;

		lane_counter_messages::Header header;

		memcpy(&header, message.data(), message.size());

		if (header.message_size != 0) {
			if (error) {
				printf("Error \n");
				return;
			}
		}
	}

	void send(const lane_counter_messages::Header& header, const lane_counter_messages::CounterInfo& info)
	{
		client.write_struct(header);
		client.write_struct(info);
	}
};




int main(int argc, char** argv)
{
	boost::asio::io_context context;
	cybicomms::ContextManager manager{ context };
	TestClient client(context, "127.0.0.1", 5000);
	manager.start();

	lane_counter_messages::Header header;
	lane_counter_messages::CounterInfo info = {};

	header.message_size = sizeof(lane_counter_messages::CounterInfo);
	header.type = lane_counter_messages::counter_info;

	uint32_t timestamp = 0;
	
	
	if (argc < 2)
	{
		info.lane_number = 1;
		info.device_id = 5678;
	}
	else
	{
		info.lane_number = (uint16_t)atoi(argv[1]);
		info.device_id = (uint16_t)atoi(argv[2]);
	}
	info.moth_count = 0;
	info.timestamp = 0;

	for (int i = 0; i < MAX_SENSORS; i++)
	{
		info.sensor_states[i] = lane_counter_messages::none;
	}

	while (1)
	{
		client.send(header, info);
		info.moth_count += std::rand() % 100;
		info.timestamp = (timestamp++) * 1000;
		std::this_thread::sleep_for(std::chrono::seconds(1));
	}

	return 0;
}