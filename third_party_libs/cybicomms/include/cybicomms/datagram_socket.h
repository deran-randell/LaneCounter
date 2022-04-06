#ifndef CYBICOMMS_DATAGRAM_SOCKET_H
#define CYBICOMMS_DATAGRAM_SOCKET_H

#include <boost/asio.hpp>

#include "context_manager.h"
#include "read_handler.h"

namespace cybicomms {

class DatagramSocket {
private:
  boost::asio::ip::udp::endpoint remote_endpoint;
  boost::shared_ptr<boost::asio::ip::udp::socket> socket;
  UdpReadHandler& read_handler;

public:
  DatagramSocket(boost::asio::io_context& io_context, uint16_t port, UdpReadHandler& read_handler);

private:
  void startReceiving();

  void handleReceive(const boost::shared_ptr<std::vector<uint8_t>>& read_buffer,
                     const boost::system::error_code& error);
};

} // namespace cybicomms

#endif
