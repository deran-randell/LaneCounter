#ifndef CYBICOMMS_TCP_CLIENT_H
#define CYBICOMMS_TCP_CLIENT_H

#include "server_handler.h"
#include "tcp_socket_reader.h"

using namespace boost::asio::ip;

namespace cybicomms {

class TcpClient : private TcpSocketConnectionHandler {
private:
  boost::asio::io_context& io_context_;
  tcp::endpoint server_endpoint_;
  boost::shared_ptr<tcp::socket> socket_;
  TcpReadHandler& read_handler_;
  ServerConnectionHandler& connection_handler_;
  std::shared_ptr<TcpSocketReader> socket_reader_;
  bool disconnection_notified_{false};

public:
  TcpClient(boost::asio::io_context& io_context,
            const std::string& address,
            uint16_t port,
            TcpReadHandler& read_handler,
            ServerConnectionHandler& connection_handler);

  TcpClient(boost::asio::io_context& io_context,
            const std::string& address,
            uint16_t port,
            ServerHandler& server_handler);

  ~TcpClient() override;

  // This is suitable for sending of constant size data types such as structs or
  // primitives. Will throw exception if not connected to a server.
  template <class DataStructure>
  void write_struct(const DataStructure& data_structure);

  void write_bytes(const void* data, size_t size);

  void write_bytes(std::vector<uint8_t> data);

  void close();

private:
  void connect();

  void handleConnect(const boost::shared_ptr<tcp::socket>& socket, boost::system::error_code error);

  void handleConnected(boost::shared_ptr<tcp::socket> socket) override;

  void handleDisconnected(boost::shared_ptr<tcp::socket> socket) override;
};

template <class DataStructure>
inline void TcpClient::write_struct(const DataStructure& data_structure)
{
  write_bytes(&data_structure, sizeof(DataStructure));
}

} // namespace cybicomms

#endif // CYBICOMMS_TCP_CLIENT_H
