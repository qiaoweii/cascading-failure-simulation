import * as d3 from "d3";
import * as axios from "axios";
import "../css/style.css";
import * as network from "../data/network.json";

var startRound = 0;
var endRound = 9;
var dataset = load_data();
var margin = { top: 50, right: 50, bottom: 0, left: 50 };
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var moving = false;
var currentValue = 0;
var targetValue = width;
var timer = 0;
var playButton = d3.select("#play-button");

// Init dataset.
function load_data() {
  // Import data by Flask.
  // let flaskPort = 5000;
  // axios
  //   .get(`http://localhost:${flaskPort}/get_data`)
  //   .then((response) => show_image(response.data))
  //   .catch((error) => console.log(error.response));

  //Import data by JSON
  console.log(network.default);
  var networkData = network.default;
  return networkData;
}

var svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Build Scale
var x = d3
  .scaleLinear()
  .domain([startRound, endRound])
  .range([0, targetValue])
  .clamp(true);

// Build Slider
var slider = svg
  .append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + margin.left + "," + height / 5 + ")");

slider
  .append("line")
  .attr("class", "track")
  .attr("x1", x.range()[0])
  .attr("x2", x.range()[1])
  .select(function () {
    return this.parentNode.appendChild(this.cloneNode(true));
  })
  .attr("class", "track-inset")
  .select(function () {
    return this.parentNode.appendChild(this.cloneNode(true));
  })
  .attr("class", "track-overlay")
  .call(
    d3
      .drag()
      .on("start.interrupt", function () {
        slider.interrupt();
      })
      .on("start drag", function () {
        currentValue = d3.event.x;
        update(x.invert(currentValue));
      })
  );

slider
  .insert("g", ".track-overlay")
  .attr("class", "ticks")
  .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(x.ticks(10))
  .enter()
  .append("text")
  .attr("x", x)
  .attr("y", 10)
  .attr("text-anchor", "middle")
  .text(function (d) {
    return parseInt(d);
  });

// Build handle with label upon it.
var handle = slider
  .insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);

var label = slider
  .append("text")
  .attr("class", "label")
  .attr("text-anchor", "mid")
  .text(startRound)
  .attr("transform", "translate(0," + -25 + ")");

// Build space to draw plot.
var plot = svg
  .append("g")
  .attr("class", "plot")
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  .attr("transform", "translate( 250, 100 )");

// Function about play-button.
playButton.on("click", function () {
  var button = d3.select(this);
  if (button.text() == "Pause") {
    moving = false;
    clearInterval(timer);
    button.text("Play");
  } else {
    moving = true;
    timer = setInterval(step, 100);
    button.text("Pause");
  }
  console.log("Slider moving: " + moving);
});

function step() {
  update(x.invert(currentValue));
  currentValue = currentValue + targetValue / 151;

  //Case: the handle is at the end of the slider.
  if (currentValue > targetValue) {
    moving = false;
    currentValue = 0;
    clearInterval(timer);
    playButton.text("Play");
    console.log("Slider moving: " + moving);
  }
}

function drawPlot(network) {
  const containerId = "#container";
  const widthOfSVG = 400;
  const heightOfSVG = 400;
  const widthOfNodeIcon = 25;
  const heightOfNodeIcon = 25;
  const nodeIconURL =
    "https://cdn3.iconfinder.com/data/icons/circuit-and-pipe/128/CircuitPipe-01-512.png";
  const generatorIconURL =
    "https://f0.pngfuel.com/png/950/932/electric-generator-diesel-generator-engine-generator-electricity-alternator-business-png-clip-art.png";
  const loadIconURL =
    "https://icon2.cleanpng.com/20180420/rqw/kisspng-electricity-distribution-board-electrical-wires-electrician-tools-5ad9a315a376a5.9023939015242125016696.jpg";
  const iconsArr = {
    "0": nodeIconURL,
    "1": loadIconURL,
    "2": generatorIconURL,
  };

  console.log(network.lines);
  console.log(network.nodes);

  // Remove old plot.
  d3.select(".plot").selectAll(".nodes").remove();
  d3.select(".plot").selectAll(".lines").remove();

  // Format network data.
  let myNodes = $.map(network.nodes, function (d) {
    return {
      name: d.index,
      type: d.type,
    };
  });

  let myLines = $.map(network.lines, function (d) {
    return {
      source: d.source,
      target: d.target,
      value: d.value,
      origin: d,
    };
  });

  var simulation = d3
    .forceSimulation(myNodes)
    .force("link", d3.forceLink().links(myLines))
    // .force("charge", d3.forceManyBody()) set the length of lines
    .force("charge", d3.forceCollide().radius(50))
    .force("center", d3.forceCenter(widthOfSVG / 2, heightOfSVG / 2));

  const link = plot
    .append("g")
    .attr("class", "lines")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(myLines)
    .join("line")
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  console.log(link);

  const node = plot
    .append("g")
    .attr("class", "nodes")
    .selectAll("images")
    .data(myNodes)
    .enter()
    .append("image")
    .attr("href", function (d) {
      return iconsArr[d.type];
    })
    .attr("width", widthOfNodeIcon)
    .attr("height", heightOfNodeIcon);

  console.log(node);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", function (d) {
      return "translate(" + (d.x - 8) + "," + (d.y - 8) + ")";
    });
  });

  // Add hover action to show node info.
  node
    .on("mouseenter", function (d) {
      d3.select(this).style("cursor", "pointer");

      d3.select(containerId)
        .append("div")
        .attr("class", "node-info")
        .html(getNodeInfoHtml(d));
      showNodeInfo();
      console.log("mouseenter");
    })
    .on("mouseleave", function () {
      hideNodeInfo();
      console.log("mouseleave");
    });

  // Add drag action.
  node.call(
    d3
      .drag()
      .on("start", function (d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      })
      .on("end", function (d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
  );
}

function update(h) {
  console.log("update");
  console.log(h);
  console.log(Math.round(x(h)));

  // Update position and text of label according to slider scale.
  var startPoint = 0;
  for (let i = 0; i < endRound; i++) {
    if (h >= i && h <= i + 1) {
      startPoint = i;
      break;
    }
  }

  var endPoint = startPoint + 1;
  var midPoint = (startPoint + endPoint) / 2;
  var curIndex = 0;
  if (h < midPoint) {
    curIndex = startPoint;
  } else {
    curIndex = endPoint;
  }
  var cx = x(curIndex);

  handle.attr("cx", cx);
  label.attr("x", cx).text(curIndex);

  // Update data of network.
  var newData = dataset.filter(function (d) {
    return d.id === curIndex;
  });
  drawPlot(newData[0]);
}

function showNodeInfo() {
  $(".node-info")
    .css({
      left: d3.event.x + 10,
      top: d3.event.y + 10,
    })
    .show();
  console.log("showNodeInfo");
}

function hideNodeInfo() {
  $(".node-info").remove();
  console.log("hideNodeInfo");
}

function getNodeInfoHtml(node) {
  let nodeType = "bus";

  if (node.type == 1) {
    nodeType = "generator";
  }
  if (node.type == 2) {
    nodeType = "load";
  }

  let nodeInfoHtml = "<ul><span class='info-title'>Info:</span>";
  nodeInfoHtml +=
    "<li><span class='info-content'>index=" + node.index + "</span>";
  nodeInfoHtml +=
    "<li><span class='info-content'>type=" + nodeType + "</span></li></ul>";

  return nodeInfoHtml;
}
