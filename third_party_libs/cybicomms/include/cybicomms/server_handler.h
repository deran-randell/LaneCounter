#ifndef CYBICOMMS_SERVER_HANDLER_H
#define CYBICOMMS_SERVER_HANDLER_H

#include "read_handler.h"
#include "server_connection_handler.h"

namespace cybicomms {

class ServerHandler : public TcpReadHandler, public ServerConnectionHandler {
public:
  ~ServerHandler() override = default;

  void handleConnected() override = 0;

  void handleDisconnected() override = 0;

  size_t getReadSize() override = 0;

  void handleRead(const std::vector<uint8_t>& message,
                  boost::shared_ptr<Socket> socket,
                  Endpoint remote_endpoint) override = 0;
};

} // namespace cybicomms

#endif // CYBICOMMS_SERVER_HANDLER_H
