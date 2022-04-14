import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BiDetail } from 'react-icons/bi';
import axios from "axios"
import style from './LaneOverview.module.css';
import { ResponsiveContainer, LineChart, Line, XAxis } from 'recharts';
import useInterval from "use-interval";

export default function LaneOverview(props) {

  let lane_url = "/laneDetail/" + props.id;

  const [ data, setData ] = useState(null);  // device, last_update, total, last_delta, connected
  const [ graphData, setGraphData ] = useState([]);
  const [ barData, setBarData ] = useState([]);

  const newData = (new_data) => {

    if (graphData.length >= 20) {
      graphData.shift();
    }
    graphData.push(new_data.last_delta);

    setGraphData(graphData);
    setBarData(graphData.map(function(v,i) { return {index: i, delta: v}}));

    // Change the colour of the overview depending on connection status
    // Need to notify parent component to change styling
    if ( (!data) || (new_data.connected !== data.connected) ) {
      props.updateConnection(props.id-1, new_data.connected);
    }

    setData(new_data);  
  };

  const fetchData = async () => {
    try {
        const url = `http://` + window.location.hostname + `:3001/laneOverview/${props.id}`;
        axios.get(url).then((res) => {
          newData(res.data.data);
        })
    }            
    catch (e) {
      console.log(e);
      setData(null);
    }
  } 

  // This component is a custom hook that combines useEffect with setInterval
  useInterval(() => {fetchData()}, 1000); 


  const formatTime = (value) => {
    let date = new Date(value);
    return (date.toLocaleString());
  }

  return (
    <>   
      <p className={style.detailHeader}>
        <span>Lane {props.id}</span>
        <span className={style.detailLink}><Link to={lane_url}><BiDetail /></Link></span>
      </p>

      <hr />

      {!data && <div>Loading</div>}
      {data && 
        <div>
            <table>
            <tbody>
              <tr >
                <td>Device</td>
                <td>{data.device}</td>
              </tr>
              <tr >
                <td>Last update</td>
                <td>{formatTime(data.last_update)}</td>
              </tr>
              <tr >
                <td>Total</td>
                <td>{data.total}</td>
              </tr>
              <tr >
                <td>Last delta</td>
                <td>{data.last_delta}</td>
              </tr>
            </tbody>
          </table>
        </div>
      }

      <ResponsiveContainer width="100%" height="30%">
        <LineChart data={barData} margin={{ top: 5, right: 1, bottom: 2, left: 1 }}>
          <XAxis dataKey="index" hide="true" />
          <Line type="monotone"  isAnimationActive={false} dataKey="delta" fill="#092788"/>
        </LineChart>
      </ResponsiveContainer>

    </>
  );
}
