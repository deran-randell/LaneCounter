#ifndef CYBICOMMS_TCP_SOCKET_READER_H
#define CYBICOMMS_TCP_SOCKET_READER_H

#include <boost/asio.hpp>
#include <boost/shared_ptr.hpp>

#include "read_handler.h"
#include "tcp_socket_connection_handler.h"

using namespace boost::asio::ip;

namespace cybicomms {

class TcpSocketReader {
private:
  boost::shared_ptr<tcp::socket> socket_;
  TcpReadHandler& read_handler_;
  TcpSocketConnectionHandler& connection_handler_;

public:
  TcpSocketReader(boost::shared_ptr<tcp::socket> socket,
                  TcpReadHandler& read_handler,
                  TcpSocketConnectionHandler& connection_handler);

  tcp::socket& socket();

  void close();

private:
  void configureSocket();
  void startReading();

  void checkRead(const boost::shared_ptr<std::vector<uint8_t>>& read_buffer,
                 boost::system::error_code error);
};

} // namespace cybicomms

#endif // CYBICOMMS_TCP_SOCKET_READER_H
