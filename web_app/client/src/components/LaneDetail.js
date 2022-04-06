import React, { useState }  from "react";
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

export default function LaneDetail(props) {

  let params = useParams();

  const [ data, setData ] = useState(null);
  const [ timePeriod, setTimePeriod ] = useState("Last 24 hours");

  function handleTimePeriodChange(event){
    setTimePeriod(event.target.value);
  }

  const formatResponse = (res) => {
    return JSON.stringify(res, null, 2);
  };  

  let fetch_query_name = `lane_detail_${params.id}` 
  const { isLoading, error } =  useQuery (
    fetch_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDetail/${params.id}`;
        axios.get(url
        ).then((res) => {
          setData(JSON.parse(formatResponse(res.data.data)));
        })
      }
  );

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>An error has occurred: {error.message}</div>
  }  

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

  return (
    <>
      <div className="lane-detail-content">
        <h2>Lane {params.id}</h2>
        <div>
          <select value={timePeriod} onChange={handleTimePeriodChange}>
            <option>Last 24 hours</option>
            <option>Last 12 hours</option>
            <option>Last hour</option>
          </select>

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
                label={{ value: 'Moth Delta', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}>
              </YAxis>
              <Line dataKey="moth_delta"/>
            </LineChart>
          }
        </div>
      </div>
    </>
  );
}
