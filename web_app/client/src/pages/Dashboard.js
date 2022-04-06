import React from 'react'
import LaneOverview from '../components/LaneOverview';

export default function Dashboard() {

  // For some reason, can't get modular CSS to work here

  const styles = {
    laneDetail: {
      borderStyle: 'solid',
      minWidth: '200px',
      maxWidth: '200px',
      minHeight: '260px',
      maxHeight: '260px',
      margin: '10px',
      padding: '0px 10px 0px 10px'
    },
    laneList: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
    }
  };

  const n = 3;

  let laneList = [...Array(n)].map((elementInArray, index) => ( 
    <div className="laneDetail" style={styles.laneDetail} key={index}><LaneOverview id={index+1} /></div> 
    ))

  return ( 
    <div className="laneList" style={styles.laneList}>{laneList}</div>        
  );
}