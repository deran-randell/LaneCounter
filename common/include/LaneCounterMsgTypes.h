#pragma once
#pragma pack(push,1)
#include <inttypes.h>

#define MAX_SENSORS 32

namespace lane_counter_messages {

	enum message_type : uint8_t
	{
		counter_info,
	};

	enum sensor_state : uint8_t
	{
		none,
		calibration_started,
		calibration_completed,
		cleaning_started,
		cleaning_completed
	};

	struct Header
	{
		message_type type;
		uint16_t message_size;
	};

	struct CounterInfo
	{
		uint16_t lane_number; // lane 0, 1 etc
		uint16_t device_id; // 0x56282
		uint32_t moth_count;
		uint32_t timestamp;
		sensor_state sensor_states[MAX_SENSORS];
	};
}

#pragma pack(pop)