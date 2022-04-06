#ifndef CYBICOMMS_TCP_SERVER_H
#define CYBICOMMS_TCP_SERVER_H

#include <list>

#include "context_manager.h"
#include "tcp_client_handler.h"
#include "tcp_socket_reader.h"

using namespace boost::asio::ip;

namespace cybicomms {

class TcpServer : public TcpSocketConnectionHandler {
private:
  boost::asio::io_context& io_context_;
  tcp::acceptor acceptor_;
  std::list<std::shared_ptr<TcpSocketReader>> clients_;
  TcpSocketConnectionHandler& connection_handler_;
  TcpReadHandler& read_handler_;

public:
  TcpServer(boost::asio::io_context& io_context,
            uint16_t port,
            TcpReadHandler& read_handler,
            TcpSocketConnectionHandler& connection_handler);

  TcpServer(boost::asio::io_context& io_context, uint16_t port, TcpClientHandler& client_handler);

  ~TcpServer() override;

  // This is suitable for sending of constant size data types such as structs or
  // primitives. See write_container for transmission of string and other data
  // storage types.
  template <class DataStructure>
  void write_struct(const DataStructure& data_structure);

  void write_bytes(const void* data, size_t size);

  void write_bytes(std::vector<uint8_t> data);

  void close();

private:
  void startAccept();

  void handleConnected(boost::shared_ptr<tcp::socket> socket) override;

  void handleDisconnected(boost::shared_ptr<tcp::socket> socket) override;
};

template <class DataStructure>
inline void TcpServer::write_struct(const DataStructure& data_structure)
{
  write_bytes(&data_structure, sizeof(DataStructure));
}

} // namespace cybicomms

#endif // CYBICOMMS_TCP_SERVER_H
