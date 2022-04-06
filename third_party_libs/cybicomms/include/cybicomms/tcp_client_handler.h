#ifndef CYBICOMMS_CLIENT_HANDLER_H
#define CYBICOMMS_CLIENT_HANDLER_H

#include "read_handler.h"
#include "tcp_socket_connection_handler.h"

namespace cybicomms {

class TcpClientHandler : public TcpSocketConnectionHandler, public TcpReadHandler {
  void handleConnected(boost::shared_ptr<tcp::socket> socket) override = 0;

  void handleDisconnected(boost::shared_ptr<tcp::socket> socket) override = 0;

  size_t getReadSize() override = 0;

  void handleRead(const std::vector<uint8_t>& message,
                  boost::shared_ptr<Socket> socket,
                  Endpoint remote_endpoint) override = 0;
};

} // namespace cybicomms

#endif // CYBICOMMS_CLIENT_HANDLER_H
