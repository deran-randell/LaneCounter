#include "Comms/LaneCounterServer.h"
#include <intrin.h>

LaneCounterServer::LaneCounterServer(boost::asio::io_context& context, uint16_t port)
	:server_{ context,port,*this }
	, tcp_handler_{nullptr}
{}

void LaneCounterServer::setTcpHandler(TcpMsgHandlerInterface& tcp_handler)
{
	tcp_handler_ = &tcp_handler;
}

LaneCounterServer::~LaneCounterServer()
{
	server_.close();
}

void LaneCounterServer::handleConnected(boost::shared_ptr<tcp::socket> socket)
{
	std::cout << "Lane Counter Client Connected \n";
}

void LaneCounterServer::handleDisconnected(boost::shared_ptr<tcp::socket> socket)
{}

size_t LaneCounterServer::getReadSize()
{
	return sizeof(lane_counter_messages::Header);
}

void LaneCounterServer::handleRead(const std::vector<uint8_t>& message, boost::shared_ptr<Socket> socket, Endpoint remote_endpoint)
{
	try
	{
		boost::system::error_code error;

		lane_counter_messages::Header header = {};

		memcpy(&header, message.data(), message.size());

		if (header.message_size != 0) {
			if (error) {
				printf("Error \n");
				return;
			}
		}

		switch (header.type)
		{
		case lane_counter_messages::message_type::counter_info:
		{
			lane_counter_messages::CounterInfo counter;
			boost::asio::read(*socket, boost::asio::buffer(&counter, header.message_size), error);

			if (tcp_handler_)
				tcp_handler_->handleTcpMessage(counter);

			break;
		}
		default:
			break;
		}

	}
	catch (const std::exception& e)
	{
		std::cout << e.what() << std::endl;
	}
}