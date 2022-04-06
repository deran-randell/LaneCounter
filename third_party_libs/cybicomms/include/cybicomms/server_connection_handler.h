#ifndef CYBICOMMS_SERVER_CONNECTION_HANDLER_H
#define CYBICOMMS_SERVER_CONNECTION_HANDLER_H

namespace cybicomms {

class ServerConnectionHandler {
public:
  virtual ~ServerConnectionHandler() = default;
  virtual void handleConnected() = 0;
  virtual void handleDisconnected() = 0;
};

} // namespace cybicomms

#endif // CYBICOMMS_SERVER_CONNECTION_HANDLER_H
