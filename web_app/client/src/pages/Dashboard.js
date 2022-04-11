import React from 'react'
import LaneOverview from '../components/LaneOverview';
import style from './Dashboard.module.css';

export default function Dashboard() {

  const n = 3;

  let laneList = [...Array(n)].map((elementInArray, index) => ( 
    <div className={style.laneDetail} key={index}><LaneOverview id={index+1} /></div> 
    ))

  return ( 
    <div className={style.laneList}>{laneList}</div>        
  );
}