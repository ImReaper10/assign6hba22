import React, { Component } from "react";
import * as d3 from "d3";
import "./App.css"; 

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
  }

  componentDidUpdate() {
    this.streamgraph(); 
  }
//=================================================STREAM GRAPH =========================================================================================================
  streamgraph = () => {
    const data = this.props.csv_data;

    // Parsing the dates in the dataset
    const parseDate = d3.timeParse("%Y-%m-%d");
    const formattedData = data.map((d) => ({...d,Date: parseDate(d.Date),}));

    const keys = Object.keys(data[0]).slice(1); 

    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clearing SVG content so that it doesnt stay on mousehover
    d3.select(this.svgRef.current).selectAll("*").remove();

    // Prepare the SVG container
    const svg = d3
      .select(this.svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle);

    const series = stack(formattedData);

    // X scale
    const x = d3.scaleTime().domain(d3.extent(formattedData, (d) => d.Date)).range([0, width]);
    // Y scale
    const y = d3.scaleLinear().domain([
        d3.min(series, (s) => d3.min(s, (d) => d[0])),
        d3.max(series, (s) => d3.max(s, (d) => d[1])),
      ])
      .range([height, 0]);

     // Red for GPT-4, Blue for Gemini, Green for PaLM-2, Purple for Claude, Orange for LLaMA-3.1
    const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

    // Create Aread for each Ai model
    const area = d3.area().x((d) => x(d.data.Date))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveBasis);

    // Tooltip for the mini bar chart
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Draw the areas
    chart.selectAll("path").data(series).join("path").attr("d", area).attr("fill", (d) => colorScale(d.key))
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8);

        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY + 15}px`);

// Mini bar chart
    miniBarChart(d.key, formattedData, colors[keys.indexOf(d.key)]);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY + 15}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // X-axis
    chart.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")))
      .selectAll("text").style("text-anchor", "middle").style("font-size", "10px")
      .attr("transform", "translate(0,5)");

//=======================================================MINI BAR CHART=============================================================================================
    function miniBarChart(key, data, color) {
      const barWidth = 150;
      const barHeight = 100;
      const barMargin = { top: 10, right: 10, bottom: 20, left: 30 };

      // Clear existing content in the tooltip
      tooltip.selectAll("*").remove();

      //setting up SVG for the mini bar chart
      const barSvg = tooltip.selectAll("svg").data([null]).join("svg").attr("width", barWidth + barMargin.left + barMargin.right).attr("height", barHeight + barMargin.top + barMargin.bottom).append("g").attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

      // Making an array with abbreviated month names from the data
      const monthsInData = Array.from(new Set(data.map((d) => d3.timeFormat("%b")(d.Date))));

      // X scale
      const barX = d3.scaleBand().domain(monthsInData).range([0, barWidth]).padding(0.2);
      //Y scale
      const barY = d3.scaleLinear().domain([0, d3.max(data, (d) => d[key])]).range([barHeight, 0]);

    // bars
      barSvg.selectAll("rect").data(data).join("rect")
        .attr("x", (d) => barX(d3.timeFormat("%b")(d.Date)))
        .attr("y", (d) => barY(d[key]))
        .attr("width", barX.bandwidth())
        .attr("height", (d) => barHeight - barY(d[key]))
        .attr("fill", color);

      //X-axis
      barSvg.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${barHeight})`).call(d3.axisBottom(barX)).selectAll("text")
      .style("text-anchor", "middle").style("font-size", "8px")
      .attr("transform", "translate(0,5)");

      // Y-axis
      barSvg.append("g").attr("class", "y-axis").call(d3.axisLeft(barY).ticks(5));
    }

//================================================= LEGEND =================================================================================================================
    const legendWrapper = d3.select(this.svgRef.current.parentNode).select(".legend-wrapper");
    
    const legendItems = legendWrapper.selectAll(".legend-item").data(keys).join("div").attr("class", "legend-item");

    legendItems.selectAll(".legend-color-box").data((d) => [d]).join("div").attr("class", "legend-color-box").style("background-color", (d) => colors[keys.indexOf(d)]);

    legendItems.selectAll(".legend-text").data((d) => [d]).join("span").attr("class", "legend-text").text((d) => d);
//================================================= LEGEND =================================================================================================================    
  };

  render() {
    return (
      <div className="chart-legend-container">
        <svg ref={this.svgRef}></svg>
        <div className="legend-wrapper"></div>
      </div>
    );
  }
}

export default Child1;
