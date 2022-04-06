#ifndef CYBICOMMS_SOCKET_CONNECTION_HANDLER_H
#define CYBICOMMS_SOCKET_CONNECTION_HANDLER_H

#include <boost/asio.hpp>
#include <boost/shared_ptr.hpp>

using namespace boost::asio::ip;

namespace cybicomms {

class TcpSocketConnectionHandler {
public:
  virtual ~TcpSocketConnectionHandler() = default;
  virtual void handleConnected(boost::shared_ptr<tcp::socket> socket) = 0;
  virtual void handleDisconnected(boost::shared_ptr<tcp::socket> socket) = 0;
};

} // namespace cybicomms

#endif // CYBICOMMS_SOCKET_CONNECTION_HANDLER_H
