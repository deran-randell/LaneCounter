#pragma once
#include "cybicomms/tcp_server.h"
#include "cybicomms/tcp_client_handler.h"

#include "LaneCounterMsgTypes.h"
#include "TcpMsgHandlerInterface.h"

#include <iostream>


class LaneCounterServer : public cybicomms::TcpClientHandler
{
	cybicomms::TcpServer server_;
	TcpMsgHandlerInterface* tcp_handler_ = nullptr;

public:
	LaneCounterServer(boost::asio::io_context& context, uint16_t port);

	void setTcpHandler(TcpMsgHandlerInterface& tcp_handler);

	~LaneCounterServer();

	// Inherited via TcpClientHandler
	virtual void handleConnected(boost::shared_ptr<tcp::socket> socket) override;

	virtual void handleDisconnected(boost::shared_ptr<tcp::socket> socket) override;

	virtual size_t getReadSize() override;

	virtual void handleRead(const std::vector<uint8_t>& message, boost::shared_ptr<Socket> socket, Endpoint remote_endpoint) override;
};