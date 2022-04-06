#pragma once
#include "LaneCounterMsgTypes.h"

class TcpMsgHandlerInterface
{
public:
	virtual ~TcpMsgHandlerInterface() = default;
	virtual void handleTcpMessage(const lane_counter_messages::CounterInfo& counter_info) = 0;
};