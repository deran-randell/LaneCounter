#ifndef CYBICOMMS_CONTEXT_MANAGER_H
#define CYBICOMMS_CONTEXT_MANAGER_H

#include <boost/asio.hpp>
#include <boost/thread.hpp>

namespace cybicomms {

class ContextManager {
private:
  boost::asio::io_context& io_context;
  boost::thread context_thread;

public:
  ContextManager(boost::asio::io_context& an_io_context);
  ~ContextManager();

  void start();
  boost::asio::io_context& getIoContext();
};

} // namespace cybicomms

#endif // CYBICOMMS_CONTEXT_MANAGER_H
