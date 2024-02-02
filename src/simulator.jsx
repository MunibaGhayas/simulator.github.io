import React, { useState } from "react";
import { generateRandomPriority, mapTo123 } from "./priority";
import { calculateStartEndTime } from "./calculateStartEndTime";
import { calculateGanttChart } from "./calculateGantChart";
import {
  TableBody,
  TableHead,
  TableCell,
  Table,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";

const GanttChart = ({ ganttChartData }) => {
  return (
    <div>
      <h2>Gantt chart</h2>
      <div
        style={{
          display: "flex",
          margin: "2rem",
          justifyContent: "center",
          backgroundColor: "",
          color: "brown",
          fontSize: "16px",
        }}
      >
        {ganttChartData.map((entry, index) => {
          return (
            <div
              key={entry.id}
              style={{
                display: "flex",
                margin: "5px",
                alignItems: "center",
              }}
            >
              {entry.start}
              <div
                style={{
                  width: "4rem",
                  height: "2rem",
                  background: "rgb(231, 213, 213)",
                  color: "black",
                  fontSize: "20px",
                  textAlign: "center",
                }}
              >
                {entry.label}
              </div>
              {entry.end}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QueueSimulation = () => {
  const [arrivalRate, setArrivalRate] = useState("");
  const [serviceRate, setServiceRate] = useState("");
  const [randomNum, setRandomNum] = useState("");
  const [results, setResults] = useState([]);
  const [ganttChartData, setGanttChartData] = useState([]);
  const [serverUtilization, setServerUtilization] = useState("");
  const [avgTurnAroundTime, setAvgTurnAroundTime] = useState("");
  const [avgWaitTime, setAvgWaitTime] = useState("");
  const [avgResponseTime, setAvgResponseTime] = useState("");

  const a = 1; // Lower bound
  const b = 3; // Upper bound
  const A = 55; // constant A
  const C = 9; // constant C
  const m = 1994;
  const seed = 10112166;

  const exponentialDistribution = (serviceRate) => {
    let num;
    do {
      num = -(1 / serviceRate) * Math.log(1 - Math.random());
    } while (num < 1);
    return num;
  };

  const poissonDistribution = (arrivalRate) => {
    const L = Math.exp(-arrivalRate);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  };

  const handleGenerateClick = () => {
    console.log("Generate button clicked");
    let arrivalTime = 0;
    let serviceTime = 0;
    let responseTime = 0;
    let waitTime;
    let turnAroundTime;
    let ganttChartData = [];

    const prioritiesLCG = generateRandomPriority(seed, randomNum, A, C, m);
    const priorities123 = mapTo123(prioritiesLCG, a, b);

    const newResults = [];
    for (let i = 0; i < randomNum; i++) {
      const interArrivalTime = poissonDistribution(arrivalRate);
      const arrival = Math.round(arrivalTime + interArrivalTime);
      arrivalTime = arrival;

      const service = exponentialDistribution(serviceRate);
      serviceTime = Math.round(service);

      newResults.push({
        customer: i + 1,
        arrivalTime,
        serviceTime,
        priority: priorities123[i],
        remainingService: serviceTime,
        isStarted: false,
      });
    }

    const { customersArray, ganttChartArray } =
      calculateStartEndTime(newResults);

    ganttChartData = calculateGanttChart(ganttChartArray);
    for (let i = 0; i < randomNum; i++) {
      // Find the corresponding customer entry in customersArray
      const customerEntry = customersArray.find(
        (customer) => customer.customer === i + 1
      );
    }
    setGanttChartData(ganttChartData);

    const finalResult = customersArray.map((item, index) => {
      turnAroundTime = item.endTime - item.arrivalTime;
      waitTime = turnAroundTime - item.serviceTime;
      responseTime = item.startTime - item.arrivalTime;

      return {
        ...item,
        turnAroundTime,
        waitTime,
        responseTime,
      };
    });

    const totalTurnAroundTime = finalResult.reduce(
      (total, item) => total + item.turnAroundTime,
      0
    );
    const totalWaitTime = finalResult.reduce(
      (total, item) => total + item.waitTime,
      0
    );
    const totalResponseTime = finalResult.reduce(
      (total, item) => total + item.responseTime,
      0
    );

    const avgTurnAroundTime = (
      totalTurnAroundTime / finalResult.length
    ).toFixed(2);
    const avgWaitTime = (totalWaitTime / finalResult.length).toFixed(2);
    const avgResponseTime = (totalResponseTime / finalResult.length).toFixed(2);
    const utilization = arrivalRate / serviceRate;
    const serverUtilization = Math.min(utilization * 100, 100).toFixed(2);

    setServerUtilization(serverUtilization);
    setAvgTurnAroundTime(avgTurnAroundTime);
    setAvgWaitTime(avgWaitTime);
    setAvgResponseTime(avgResponseTime);
    setResults(finalResult);
  };

  return (
    <div>
      <h1 style={{ display: "flex", marginTop: "2rem", marginLeft: "1rem" }}>
        RANDOM NUMBER SIMULATOR
      </h1>
      <div style={{ flex: 1, marginBottom: "20px" }}>
        <h2 style={{ fontSize: "30px", fontWeight: "bold" }}>
          Simulation Parameters
        </h2>
        <div style={{ marginTop: "14px", fontSize: "20px" }}>
          <label>Arrival Rate:</label>
          <input
            style={{ marginLeft: "5px", padding: "8px" }}
            type="number"
            step="0.01"
            value={arrivalRate}
            onChange={(e) => setArrivalRate(parseFloat(e.target.value))}
          />
        </div>

        <div style={{ marginTop: "14px", fontSize: "20px" }}>
          <label>Service Rate:</label>
          <input
            style={{ marginLeft: "5px", padding: "8px" }}
            type="number"
            step="0.01"
            value={serviceRate}
            onChange={(e) => setServiceRate(parseFloat(e.target.value))}
          />
        </div>
        <div
          style={{
            marginTop: "14px",
            marginBottom: "10px",
            fontSize: "20px",
          }}
        >
          <label>Random Numbers: </label>
          <input
            style={{ marginLeft: "5px", padding: "8px" }}
            type="number"
            value={randomNum}
            onChange={(e) => setRandomNum(parseInt(e.target.value, 10))}
          />
        </div>
        <button
          style={{ marginTop: "20px", marginBottom: "16px" }}
          onClick={handleGenerateClick}
        >
          Generate
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <TableContainer
          component={Paper}
          style={{
            backgroundColor: "rgb(231, 213, 213)",
            color: "black",
          }}
        >
          <Table sx={{ minWidth: 500 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Customer#
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Arrival Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Service Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Priority
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Start Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  End Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Turnaround Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Wait Time
                </TableCell>
                <TableCell
                  align="center"
                  style={{ fontWeight: "bold", fontSize: "18px" }}
                >
                  Response Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{result.customer}</TableCell>
                  <TableCell align="center">{result.arrivalTime}</TableCell>
                  <TableCell align="center">{result.serviceTime}</TableCell>
                  <TableCell align="center">{result.priority}</TableCell>
                  <TableCell align="center">{result.startTime}</TableCell>
                  <TableCell align="center">{result.endTime}</TableCell>
                  <TableCell align="center">{result.turnAroundTime}</TableCell>
                  <TableCell align="center">{result.waitTime}</TableCell>
                  <TableCell align="center">{result.responseTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div>
        <GanttChart ganttChartData={ganttChartData} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{ fontSize: "30px", marginTop: "2rem", marginBottom: "1rem" }}
        >
          CALCULATIONS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 1, margin: "1rem", width: "calc(50% - 2rem)" }}>
            <div style={{ fontSize: "20px", marginBottom: "2rem" }}>
              Server Utilization: {serverUtilization}%
            </div>
            <div style={{ fontSize: "20px", marginBottom: "1rem" }}>
              Average Turnaround Time: {avgTurnAroundTime}
            </div>
          </div>
          <div style={{ flex: 1, margin: "1rem", width: "calc(50% - 2rem)" }}>
            <div style={{ fontSize: "20px", marginBottom: "1rem" }}>
              Average Waiting Time: {avgWaitTime}
            </div>
            <div style={{ fontSize: "20px", marginBottom: "1rem" }}>
              Average Response Time: {avgResponseTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueSimulation;
