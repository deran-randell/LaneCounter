import React from "react";

function GraphLegend() {
  const myComponentStyle = {
    display: "flex",
    position: "absolute",
    backgroundColor: "white",
    border: "2px solid ",
    borderRadius: "20px",
    top: "2vh",
    right: "8vh",
    paddingLeft: "4px",
    paddingRight: "4px",
  };
  return (
    <div>
      <div style={myComponentStyle}>
        <ul style={{ listStyleType: "none", padding: "1px" }}>
          <li>
            <span style={{ color: "white", backgroundColor: "red" }}> reset_occured</span>
          </li>
          <li>
            <span style={{ color: "white", backgroundColor: "orange" }}> calibration_triggered</span>
          </li>
          <li>
            <span style={{ color: "white", backgroundColor: "purple" }}> manual_calibration</span>
          </li>
          <li>
            <span style={{ color: "white", backgroundColor: "green" }}> cleaning_started</span>
          </li>
          <li>
            <span style={{ color: "white", backgroundColor: "blue" }}> cleaning_complete</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default GraphLegend;
