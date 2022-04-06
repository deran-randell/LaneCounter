class MothLane {
    constructor(lane_id, timestamp) {
        this._id = lane_id;
        this._total = 0;
        this._count = 0;
        this._delta = 0;
        this._device = "";
        this._millis = 0;
        this._timestamp = timestamp; // a number in milliseconds
        this._active = false;
    }

    // Did the device reset?
    did_reset(new_millis, previous_timestamp) {
        let result = {"reset": false, "rollover": false};

        let diff_millis = new_millis - this._millis;
        //console.log("diff_millis = " + diff_millis);

        // Did the millis value do a rollover?
        if (diff_millis < 0)
        {
            // Use 49 days as the rollover check.
            // If the system has been down without logging for this long we have bigger data issues anyway!
            if (Math.abs(diff_millis) >= 4233600000) {
                console.log("Lane " + this._id + " millis rollover detected");
                result.rollover = true;
            }
            else {
                console.log("Lane " + this._id + " reset detected - millis decreased");
                result.reset = true;
            }
        }
        // No rollover. Was there a reset?
        else {
            let diff_time_ms = this._timestamp - previous_timestamp;
            //console.log("diff_time_ms = " + diff_time_ms);
            let diff_data = Math.abs(diff_time_ms - diff_millis);
            //console.log("diff_data = " + diff_data);

            // TODO: Need to decide on a tolerance value. 2 seconds?
            if (diff_data > 2000) {
                console.log("Lane " + this._id + " reset detected - time and millis difference more than 2 seconds");
                result.reset = true;
            }
        }

        return result;
    } 

    // Getters and Setters

    get id() {
        return this._id;
    }

    set id(lane_id) {
        this._id = lane_id;
    }

    get total() {
        return this._total;
    }

    set total(lane_total) {
        this._total = lane_total;
    }
    
    get count() {
        return this._count;
    }

    set count(lane_count) {
        this._count = lane_count;
    }

    get delta() {
        return this._delta;
    }

    set delta(lane_delta) {
        this._delta = lane_delta;
    }

    get device() {
        return this._device;
    }

    set device(lane_device) {
        this._device = lane_device;
    }
    
    get millis() {
        return this._millis;
    }

    set millis(lane_millis) {
        this._millis = lane_millis;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(lane_timestamp) {
        this._timestamp = lane_timestamp;
    }

    get active() {
        return this._active;
    }

    set active(lane_active) {
        this._active = lane_active;
    }
}

module.exports = { MothLane }