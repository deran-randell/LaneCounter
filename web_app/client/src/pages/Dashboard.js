import React, { useState } from 'react'
import LaneOverview from '../components/LaneOverview';
import style from './Dashboard.module.css';

export default function Dashboard()
{

  // The number of lanes - change as required
  const n = 3;

  const [ laneConnected, setLaneConnected ] = useState(Array.from({ length: n }, (v, i) => false));

  // The LaneOverview component will use this callback to change the background colour depending on connection status
  const updateLaneConnected = (index, connected) =>
  {
    setLaneConnected(connections =>
    {
      return connections.map((item, j) =>
      {
        return j === index ? connected : item
      })
    })
  }

  let laneList = [ ...Array(n) ].map((elementInArray, index) => (
    <div className={laneConnected[ index ] ? style.laneDetailConnected : style.laneDetailNotConnected} key={index}><LaneOverview id={index + 1} updateConnection={updateLaneConnected} /></div>
  ))

  return (
    <div className={style.laneList}>{laneList}</div>
  );
}
