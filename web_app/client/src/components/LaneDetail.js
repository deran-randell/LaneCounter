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
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  ReferenceArea,
} from 'recharts';
import styles from "./LaneDetail.module.css"
import useInterval from "use-interval"

export default function LaneDetail(props) {

  let params = useParams();

  // Period, number of minutes to view, refresh rate in seconds
  const DetailTimePeriods = [
    { label: "Today", value: 0, minutes: 0, update_rate: 60 },
    { label: "Last 12 hours", value: 1, minutes: 12*60, update_rate: 60 },
    { label: "Last 6 hours", value: 2, minutes: 6*60, update_rate: 60 },
    { label: "Last 3 hours", value: 3, minutes: 3*60, update_rate: 60 },
    { label: "Last 1 hour", value: 4, minutes: 60, update_rate: 60 },
    { label: "Last 30 minutes", value: 5, minutes: 30, update_rate: 10 },
    { label: "Last 10 minutes", value: 6, minutes: 10, update_rate: 10 },
    { label: "Last 1 minute", value: 7, minutes: 1, update_rate: 1 }
  ]

  const HistoryTimePeriods = [
    { label: "Last 1 month", value: 0, months: 1 },
    { label: "Last 2 months", value: 1, months: 2 },
    { label: "Last 3 months", value: 2, months: 3 },
  ]

  const [ data, setData ] = useState(null);
  const [ timePeriodValue, setTimePeriodValue ] = useState(6);
  const [ doDbLoad, setDoDbLoad ] = useState(true);
  const [ updateCount, setUpdateCount ] = useState(0);

  const [ historyData, setHistoryData ] = useState(null);
  const [ historyPeriodValue, setHistoryPeriodValue ] = useState(0);

  const [ deviceTodayData, setDeviceTodayData ] = useState(null);
  const [ deviceHistoryData, setDeviceHistoryData ] = useState(null);

  const [ activeDotPayload, setActiveDotPayload ] = useState(null);
  
  const [leftArea, setLeftArea] = useState(null);
  const [rightArea, setRightArea] = useState(null);
  const [bottom, setBottom] = useState(null);
  const [top, setTop] = useState(null);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);


  const [leftHistoryArea, setLeftHistoryArea] = useState(null);
  const [rightHistoryArea, setRightHistoryArea] = useState(null);

  const [leftHistory, setLeftHistory] = useState(null);
  const [rightHistory, setRightHistory] = useState(null);




  function handleTimePeriodChange(event) {
    setTimePeriodValue(event.target.value);
  }

  function handleHistoryPeriodChange(event) {
    setHistoryPeriodValue(event.target.value);
  }

  const formatResponse = (res) => {
    return JSON.stringify(res, null, 2);
  };  

  let fetch_detail_query_name = `lane_detail_${params.id}_${DetailTimePeriods[timePeriodValue].minutes}` 
  useQuery (
    fetch_detail_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDetail/${params.id}/${DetailTimePeriods[timePeriodValue].minutes}`;
        axios.get(url
        ).then((res) => {
          setData(JSON.parse(formatResponse(res.data.data)));
          setDoDbLoad(false);
        })
      }
  );

  let fetch_history_query_name = `lane_history_${params.id}` 
  useQuery (
    fetch_history_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDetailHistory/${params.id}`;
        axios.get(url
        ).then((res) => {
          setHistoryData(JSON.parse(formatResponse(res.data.data)));
        })
      }
  );

  let fetch_device_today_query_name = `lane_device_today_${params.id}` 
  useQuery (
    fetch_device_today_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDevice/${params.id}/0`;
        axios.get(url
        ).then((res) => {
          setDeviceTodayData(JSON.parse(formatResponse(res.data.data)));
        })
      }
  );

  let fetch_device_history_query_name = `lane_device_history_${params.id}` 
  useQuery (
    fetch_device_history_query_name, 
      () => {
        const url = `http://` + window.location.hostname + `:3001/laneDevice/${params.id}/1`;
        axios.get(url
        ).then((res) => {
          setDeviceHistoryData(JSON.parse(formatResponse(res.data.data)));
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
        setUpdateCount(updateCount+1); // without this the graph doesn't update!
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

  const formatDayTick = (value) => {
    let date = new Date(value*1000);
    
    let day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    let month = date.getMonth()+1;
    if (month < 10) {
      month = "0" + month;
    }

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
    return (day + "/" + month + " " + hours + ":" + mins + ":" + secs);
  }
  //  console.log("Data --- > ", data);
  // Zoom
  const getAxisYDomain = (from, to, ref, offset) => {
    // console.log("data --->", data);
    const from_ = data.map(object => object.unix_timestamp).indexOf(from);
    const to_ = data.map(object => object.unix_timestamp).indexOf(to);
    console.log(from_, "  ", to_);

    const refData = data.slice(from_, to_);
    console.log("ref data ---> ",refData)
    let [bottom_, top_] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top_) top_ = d[ref];
      if (d[ref] < bottom_) bottom_ = d[ref];
    });
  
    return [(bottom_ | 0) - offset, (top_ | 0) + offset];
  };
  
  const set_left_area = (left_area) =>
  {
    setLeftArea(left_area);
    console.log(left_area);
  }

  const set_right_area = (right_area) =>
  {
    setRightArea(right_area);
    console.log(right_area);
  }

  const set_left_history_area = (left_area) =>
  {
    setLeftHistoryArea(left_area);
    console.log(left_area);
  }

  const set_right_history_area = (right_area) =>
  {
    setRightHistoryArea(right_area);
    console.log(right_area);
  }

  const zoom = ()=>
  {
    const {data_} = data;
    console.log("zoom ------- ")
    if (leftArea === rightArea || rightArea === '') {
      setLeftArea('');
      setRightArea('');
      return;
    }

        // xAxis domain
        if (leftArea > rightArea)
        {
          setRightArea(leftArea);
          setLeftArea(rightArea);
        } 

        // yAxis domain
        const [bottom_, top_] = getAxisYDomain(leftArea, rightArea, 'unix_timestamp', 1);
        
        setRightArea('');
        setLeftArea('');
        setLeft(leftArea);
        setRight(rightArea);
        setBottom(bottom_);
        setTop(top_);
        setData(data_.slice());


        console.log("bottom", bottom_);
        console.log("top ",top_);

  }

  const zoomOut = () =>
  {
    setRightArea('');
    setLeftArea('');
    setLeft('dataMin');
    setRight('dataMax');
    setBottom('dataMin');
    setTop('dataMax+30');
    setData(data);
  }



  const zoomHistory = ()=>
  {
    const {data_} = historyData;

    console.log("zoom history ------- ")
    if (leftHistoryArea === rightHistoryArea || rightHistoryArea === '') {
      setLeftHistoryArea('');
      setRightHistoryArea('');
      return;
    }

        // xAxis domain
        if (leftHistoryArea > rightHistoryArea)
        {
          setRightArea(leftHistoryArea);
          setLeftArea(rightHistoryArea);
        } 

        // yAxis domain
        // const [bottom_, top_] = getAxisYDomain(leftHistoryArea, rightHistoryArea, 'unix_timestamp', 1);
        
        setRightHistoryArea('');
        setLeftHistoryArea('');
        setLeftHistory(leftHistoryArea);
        setRightArea(rightHistoryArea);
        // setBottom(bottom_);
        // setTop(top_);
        setHistoryData(historyData.slice());


        // console.log("bottom", bottom_);
        // console.log("top ",top_);

  }

  const zoomOutHistory = () =>
  {
    setRightHistoryArea('');
    setLeftHistoryArea('');
    setLeftHistory('dataMin');
    setRightHistory('dataMax+10');
    // setBottom('dataMin');
    // setTop('dataMax+30');
    setHistoryData(historyData);
  }

  // TODO: Make it all look nice!
  

  /*
  const detailTooltipFormatter = (value, name) => {
    return [value, "Count"];
  }
  */
 
  // The default tooltip doesn't update with the live update of the graph, so this is a workaround
  const CustomDetailTooltip = ({ active, payload, label }) => {
    if (active && activeDotPayload) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{formatTimeTick(activeDotPayload.unix_timestamp)}</p>
          <p className={styles.tooltipLabel}>{`Count: ${activeDotPayload.moth_delta}`}</p>
        </div>
      ); 
    }
    return null;
  };

  // The default tooltip doesn't update with the live update of the graph, so this is a workaround
  const activeDotHandler = (dotData) => {
    setActiveDotPayload(dotData.payload);
    // Have to draw the active dot ourselves now
    return (
        <circle cx={dotData.cx} cy={dotData.cy} r={dotData.r} stroke={dotData.stroke} strokeWidth={dotData.strokeWidth} fill={dotData.fill} />
    );
  }

  const CustomHistoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{formatDayTick(label)}</p>
          <p className={styles.tooltipLabel}>{`Count: ${payload[0].value}`}</p>
        </div>
      ); 
    }
    return null;
  };

  return (
    <>
      <div>
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
        </div>        
        <button type="button" className="btn update" onClick={zoomOut}>
          Zoom Out
        </button>
        {!data && <div>Loading</div>}
        {data && 
          <div>
          {
            <ResponsiveContainer width="100%" aspect={3.0}>
              <LineChart
                  width={1000}
                  height={400}
                  data={data}
                  margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
                  onMouseDown={(e) => set_left_area(e.activeLabel)}
                  onMouseMove={(e) => set_right_area(e.activeLabel)} 
                  onMouseUp={zoom}
                   >
                  
                 <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                   padding={{ left: 10 }}
                  allowDataOverflow = {true}
                  style={{fontSize: '14px',}}
                  xAxisId={0} 
                  type="number" 
                  scale="time" 
                  dataKey="unix_timestamp"
                  domain={[left, right]}
                  tick={{angle: -35, textAnchor: "end"}}
                  tickFormatter={formatTimeTick}>
                  <Label value="Time" offset={40} position="bottom"/>
                </XAxis>            
                <YAxis
                  style={{fontSize: '14px',}}
                  dataKey="moth_delta"
                  label={{ value: 'Moth Count', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}
                  domain={["dataMin", "dataMax+20"]}>
                </YAxis>
          
                <Tooltip 
                  isAnimationActive={false}
                  content={<CustomDetailTooltip />}/>
                {
                  deviceTodayData && deviceTodayData.length > 0 && 
                      deviceTodayData.map((item) => {
                      return (<ReferenceLine key={item.unix_timestamp} x={item.unix_timestamp} stroke="red" />)
                    })                
                }                            
                <Line  dataKey="moth_delta"  animationDuration={300} activeDot={activeDotHandler} dot={DetailTimePeriods[timePeriodValue].value === 7 ? true : false}/>
                {leftArea && rightArea ? (
               <ReferenceArea  x1={leftArea} x2={rightArea} strokeOpacity={0.3} />
                    ) : null}
              </LineChart>
            </ResponsiveContainer>             
          }
          </div>
        }

        <h2 className={styles.laneDetailHeader2}>
            Moth count history
            <span id={styles.laneDetailHeaderSpace}></span>
            <select value={historyPeriodValue} onChange={handleHistoryPeriodChange}>
              {HistoryTimePeriods.map((t) => <option key={t.label} value={t.value}>{t.label}</option>)}
            </select>
        </h2>
        <button type="button" className="btn update history" onClick={zoomOutHistory}>
          Zoom Out
        </button>
        {!historyData && <div>Loading</div>}
        {historyData && 
          <div>
          {
            <ResponsiveContainer width="100%" aspect={3.0}>
              <LineChart
                  width={1000}
                  height={400}
                  data={historyData}
                  margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
                  onMouseDown={(e) => set_left_history_area(e.activeLabel)}
                  onMouseMove={(e) => set_right_history_area(e.activeLabel)} 
                  onMouseUp={zoomHistory}
                  >
                <XAxis
                  allowDataOverflow = {true} 
                  style={{fontSize: '12px',}}
                  xAxisId={0} 
                  type="number" 
                  scale="time" 
                  dataKey="unix_timestamp"
                  domain={[leftHistory, rightHistory]}
                  tick={{angle: -35, textAnchor: "end"}}
                  tickFormatter={formatDayTick}>
                  <Label value="Time" offset={40} position="bottom"/>
                </XAxis>            
                <YAxis 
                  style={{fontSize: '14px',}}
                  dataKey="moth_delta"
                  label={{ value: 'Moth Count', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}
                  domain={["dataMin", "dataMax+20"]}
                  >
                    
                </YAxis>
                <Tooltip 
                  isAnimationActive={false}
                  content={<CustomHistoryTooltip />}/>
                {
                  deviceHistoryData && deviceHistoryData.length > 0 && 
                  deviceHistoryData.map((item) => {
                      return (<ReferenceLine key={item.unix_timestamp} x={item.unix_timestamp} stroke="red" />)
                    })                
                }                            
                <Line  animationDuration={300} dataKey="moth_delta" dot={false} />
                {leftHistoryArea && rightHistoryArea ? (
               <ReferenceArea  x1={leftHistoryArea} x2={rightHistoryArea} strokeOpacity={0.3} />
                    ) : null}
              </LineChart>
          </ResponsiveContainer>
          }
          </div>
        }

      </div>
    </>
  );
}
