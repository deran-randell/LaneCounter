import React, { useEffect, useState }  from "react";
import { useParams } from "react-router-dom"
import { useQuery } from "react-query";
import axios from "axios";
import {
  LineChart,
  Line,  
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from 'recharts';
import styles from "./LaneDetail.module.css"
import useInterval from "use-interval"

export default function LaneDetail(props) {

  let params = useParams();

  // Period, number of minutes to view, refresh rate in seconds
  let DetailTimePeriods = [
    { label: "Today", value: 0, minutes: 0, update_rate: 60 },
    { label: "Last 12 hours", value: 1, minutes: 12*60, update_rate: 60 },
    { label: "Last 6 hours", value: 2, minutes: 6*60, update_rate: 60 },
    { label: "Last 3 hours", value: 3, minutes: 3*60, update_rate: 60 },
    { label: "Last 1 hour", value: 4, minutes: 60, update_rate: 60 },
    { label: "Last 30 minutes", value: 5, minutes: 30, update_rate: 10 },
    { label: "Last 10 minutes", value: 6, minutes: 10, update_rate: 10 },
    { label: "Last 1 minute", value: 7, minutes: 1, update_rate: 1 }
  ]

  const [ data, setData ] = useState(null);
  const [ timePeriodValue, setTimePeriodValue ] = useState(6);
  const [ doDbLoad, setDoDbLoad ] = useState(true);
  const [ updateCount, setUpdateCount ] = useState(0);

  function handleTimePeriodChange(event) {
    setTimePeriodValue(event.target.value);
  }

  const formatResponse = (res) => {
    return JSON.stringify(res, null, 2);
  };  

  let fetch_query_name = `lane_detail_${params.id}_${DetailTimePeriods[timePeriodValue].minutes}` 
  useQuery (
      fetch_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDetail/${params.id}/${DetailTimePeriods[timePeriodValue].minutes}`;
        axios.get(url
        ).then((res) => {
          setData(JSON.parse(formatResponse(res.data.data)));
          setDoDbLoad(false);
        })
      }
  );

  useInterval(() => {
      const url = `http://` + window.location.hostname + `:3001/laneDetailUpdate/${params.id}/${DetailTimePeriods[timePeriodValue].update_rate}`;
      axios.get(url
      ).then((res) => {
        let temp = JSON.parse(formatResponse(res.data.data));
        data.push(...temp);
        let seconds = DetailTimePeriods[timePeriodValue].update_rate;
        for (let j=0; j<seconds; j++) {
          data.shift();
        }
        setData(data);
        setUpdateCount(updateCount + 1);
      });
    },
    doDbLoad ? null : (DetailTimePeriods[timePeriodValue].update_rate*1000)
  );
  
  const formatTimeTick = (value) => {
    let date = new Date(value*1000);
    let hours = date.getHours();
    if (hours < 10) {
      hours = "0" + hours;
    }
    let mins = date.getMinutes();
    if (mins < 10) {
      mins = "0" + mins;
    }
    let secs = date.getSeconds();
    if (secs < 10) {
      secs = "0" + secs;
    }
    return (hours + ":" + mins + ":" + secs);
  }

  // TODO: Make it all look nice!

  return (
    <>
      <div className="lane-detail-content">
        <div>
          <h1 className={styles.laneDetailHeader1}>
            Lane {params.id}
          </h1>          
          <h2 className={styles.laneDetailHeader2}>
              Moth count per second
              <span id={styles.laneDetailHeaderSpace}></span>
              <select value={timePeriodValue} onChange={handleTimePeriodChange}>
                {DetailTimePeriods.map((t) => <option key={t.label} value={t.value}>{t.label}</option>)}
              </select>
          </h2>
          <p>Update count = {updateCount}</p>
        </div>        

        {!data && <div>Loading</div>}
        {data && 
          <div>
          {
            <LineChart
                width={1000}
                height={400}
                data={data}
                margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
              <XAxis 
                style={{fontSize: '14px',}}
                xAxisId={0} 
                type="number" 
                scale="time" 
                dataKey="unix_timestamp"
                domain={["auto", "auto"]}
                tick={{angle: -35, textAnchor: "end"}}
                tickFormatter={formatTimeTick}>
                <Label value="Time" offset={40} position="bottom"/>
              </XAxis>            
              <YAxis 
                style={{fontSize: '14px',}}
                dataKey="moth_delta"
                label={{ value: 'Moth Count', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}>
              </YAxis>
              <Line dataKey="moth_delta"/>
            </LineChart>
          }
          </div>
        }
      </div>
    </>
  );
}
