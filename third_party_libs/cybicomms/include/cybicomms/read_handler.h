#ifndef CYBICOMMS_READ_HANDLER_H
#define CYBICOMMS_READ_HANDLER_H

#include <vector>

#include <boost/asio.hpp>
#include <boost/shared_ptr.hpp>

namespace cybicomms {

template <typename InternetProtocol>
class ReadHandler {
public:
  using Socket = typename InternetProtocol::socket;
  using Endpoint = typename InternetProtocol::endpoint;

  virtual ~ReadHandler() = default;

  virtual size_t getReadSize() = 0;

  virtual void handleRead(const std::vector<uint8_t>& message,
                          boost::shared_ptr<Socket> socket,
                          Endpoint remote_endpoint) = 0;
};

using TcpReadHandler = ReadHandler<boost::asio::ip::tcp>;
using UdpReadHandler = ReadHandler<boost::asio::ip::udp>;

} // namespace cybicomms

#endif // CYBICOMMS_READ_HANDLER_H
