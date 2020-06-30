import * as d3 from "d3";
import * as axios from "axios";
import "../../static/css/style.css";
import * as network from "../../static/data/network.json";
import $ from "jquery";

let dataset = loadDataByJSON();
let oldData = [];
const startRoundIndex = 0;
const endRoundIndex = dataset.length - 1;
let curRoundIndex = 0;
let currentPositionValue = 0;
const margin = { top: 50, right: 50, bottom: 0, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
let moving = false;
let timer = 0;
let networkName = "ieee-5";
const flaskPort = 5000;
const containerId = "#container";
const defaultLabelNumber = startRoundIndex;
const boundaryPositionValue = width;

// Init network dataset.
// Method1 : Import network data by flask.
// case 1 : Set default data, once open or refresh the page.
// renderNetworkDataByFlask(networkName);

// case 2 : When change the kind of network, reload the network data.
// d3.select("#network-data-select").on("change", function (d) {
//   var selectedNetworkName = d3.select("#network-data-select").node().value;
//   renderNetworkDataByFlask(selectedNetworkName);
// });

// function renderNetworkDataByFlask(networkName) {
//   var requestConent = { name: networkName };
//   var config = {
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//     },
//   };

//   axios
//     .post(`http://localhost:${flaskPort}/get_data`, requestConent, config)
//     .then((response) => setDataSet(response.data))
//     .catch((error) => console.log(error.response));
// }

// function setDataSet(data) {
//   window["dataSet"] = data;
//   console.log(window["dataSet"]);
// }

// Method2 : Import network datatby JSON file.
//           The data in network.json file is fake.
function loadDataByJSON() {
  console.log(network.default);
  var networkData = network.default;
  return networkData;
}

let svg = d3
  .select(containerId)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Build Scale.
let x = d3
  .scaleLinear()
  .domain([startRoundIndex, endRoundIndex])
  .range([0, boundaryPositionValue])
  .clamp(true);

// Build a Slider.
let slider = svg
  .append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + margin.left + "," + height / 5 + ")");

// Build a track.
let trackDragAction = d3
  .drag()
  .on("start.interrupt", function () {
    slider.interrupt();
  })
  .on("start drag", function () {
    currentPositionValue = d3.event.x;
    curRoundIndex = Math.round(x.invert(currentPositionValue));
    update();
  });

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
  .call(trackDragAction);

// Build ticks.
slider
  .insert("g", ".track-overlay")
  .attr("class", "ticks")
  .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(x.ticks(endRoundIndex - startRoundIndex + 1))
  .enter()
  .append("text")
  .attr("x", x)
  .attr("y", 10)
  .attr("text-anchor", "middle")
  .text(function (d) {
    return parseInt(d);
  });

// Build a circle handle.
let handle = slider
  .insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);

// Build handle with label upon it.
let label = slider
  .append("text")
  .attr("class", "label")
  .attr("text-anchor", "mid")
  .text(defaultLabelNumber)
  .attr("transform", "translate(0," + -25 + ")");

// Build a space to draw plot.
let plot = svg
  .append("g")
  .attr("class", "plot")
  .attr("transform", "translate( 250, 100 )");

// Function about play-button.
let playButton = d3.select("#play-button");
playButton.on("click", function () {
  let button = d3.select(this);

  // There are two scenarios when we click the the `playButton`.
  // Case 1 : The handle is moving, i.e. the word on `playButton` is "Pause".
  //          Once the button is clicked,
  //          the handle stop moving, the word on text changes to "Play", and the interval is cleared.
  if (button.text() == "Pause") {
    moving = false;
    clearInterval(timer);
    button.text("Play");

    // Case 2.1 : The handle is immobile, i.e. the word on `playButton` is "Play",
    //            Once the button is clicked,
    //            the the handle begin moving, the word on text changes to "Pause",
    //            and the interval is set to 50 ms.
  } else {
    moving = true;
    timer = setInterval(step, 50);
    button.text("Pause");
  }
  console.log("Slider moving: " + moving);
});

/**
 * Renew the information when make a step.
 */
function step() {
  curRoundIndex = Math.round(x.invert(currentPositionValue));
  update();
  currentPositionValue = currentPositionValue + boundaryPositionValue / 151;

  // Case 2.2 : Notice, When the handle is beyond the boundary of the slider, the handle should also stop.
  //            The interval is cleared, the word on the `playButton` changes to "Play".
  if (currentPositionValue > boundaryPositionValue) {
    moving = false;
    currentPositionValue = 0;
    clearInterval(timer);
    playButton.text("Play");
    console.log("Slider moving: " + moving);
  }
}

/**
 * Draw plot with nodes and lines.
 * Attach actions to nodes and lines with actions.
 * @param {Object} network - The network data of current round.
 */
function drawPlot(network) {
  const widthOfNodeIcon = 25;
  const heightOfNodeIcon = 25;
  const nodeIconURL = "https://image.flaticon.com/icons/svg/2991/2991034.svg";
  const generatorIconURL =
    "https://image.flaticon.com/icons/svg/3118/3118212.svg";
  const loadIconURL =
    "https://cdn3.iconfinder.com/data/icons/electricity-wires-and-cables-elasto-font-next-2020/18/06_electric-box-512.png";
  const iconsArr = {
    "0": nodeIconURL,
    "1": generatorIconURL,
    "2": loadIconURL,
  };

  console.log(network.lines);
  console.log(network.nodes);

  // Remove old plot.
  d3.select(".plot").selectAll(".nodes").remove();
  d3.select(".plot").selectAll(".lines").remove();

  // Format network node data to object with attribute `name` and `type`.
  // Identify a node by its name.
  // [Other attribute can be added here].
  let myNodes = $.map(network.nodes, function (d) {
    return {
      name: d.id,
      type: d.type,
    };
  });

  // Format network line data to object with attribute `id`, `source`, `target`, `value`.
  // Identify a line by its id.
  // [Other attribute can be added here].
  let myLines = $.map(network.lines, function (d) {
    return {
      id: d.id,
      source: d.source,
      target: d.target,
      value: d.value,
    };
  });

  // Combine the simuation picture with line data and node data.
  // Set the lines and center of simuation.
  let simulation = d3
    .forceSimulation(myNodes)
    .force("link", d3.forceLink().links(myLines))
    // .force("charge", d3.forceManyBody()) //default setting
    .force("charge", d3.forceCollide().radius(30))
    .force("center", d3.forceCenter(width / 2 - 200, height / 2));

  // Build lines.
  const lines = plot
    .append("g")
    .attr("class", "lines")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(myLines)
    .join("line")
    .attr("id", function (d) {
      return d.id;
    })
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  // Build nodes.
  const nodes = plot
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

  // Set the position of lines and nodes.
  simulation.on("tick", () => {
    lines
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    nodes.attr("transform", function (d) {
      return "translate(" + (d.x - 8) + "," + (d.y - 8) + ")";
    });
  });

  // Add hover action to show node info.
  nodes
    .on("mouseenter", function (d) {
      d3.select(this).style("cursor", "pointer");
      showInfo(d, "isNode");
    })
    .on("mouseleave", function () {
      hideInfo();
    });

  lines
    .on("mouseenter", function (d) {
      d3.select(this).style("cursor", "pointer");
      showInfo(d, "isLine");
    })
    .on("mouseleave", function () {
      hideInfo();
    });

  // Add drag action at node.
  let nodesDragAction = d3
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
    });

  nodes.call(nodesDragAction);
}

/**
 * Update the handle, label and plot.
 */
function update() {
  // Update position and text of label according to slider scale.
  let cx = x(curRoundIndex);

  handle.attr("cx", cx);
  label.attr("x", cx).text(curRoundIndex);

  // Update data of network, `newDataset` should be data at the round of `d.id`.
  let newDataset = dataset.filter(function (d) {
    return d.id === curRoundIndex;
  });
  var newData = newDataset[0];
  renewPlot(oldData, newData);
  oldData = newData;
}

/**
 * Show infomation of a node or a line.
 * @param {Object} data - The data of a node or a line.
 * @param {String} isLine - Identify the input is a line or not.
 */
function showInfo(data, isLine) {
  let infoHtml =
    isLine === "isLine" ? getLineInfoHtml(data) : getNodeInfoHtml(data);
  d3.select(containerId).append("div").attr("class", "info").html(infoHtml);

  $(".info")
    .css({
      left: d3.event.x + 10,
      top: d3.event.y + 10,
    })
    .show();
}

/**
 * Hide infomation of a node or a line.
 */
function hideInfo() {
  $(".info").remove();
}

/**
 * Build the html of node information.
 * @param {Object} node - The data of a node.
 * @returns {String}
 */
function getNodeInfoHtml(node) {
  let nodeType = "bus";

  if (node.type == 1) {
    nodeType = "generator";
  } else if (node.type == 2) {
    nodeType = "load";
  }

  let nodeInfoHtml = "<ul><span class='info-title'>Info:</span>";
  nodeInfoHtml +=
    "<li><span class='info-content'>index=" + node.index + "</span>";
  nodeInfoHtml +=
    "<li><span class='info-content'>type=" + nodeType + "</span></li></ul>";

  return nodeInfoHtml;
}

/**
 * Build the html of line information.
 * @param {Object} line - The data of a line.
 * @returns {String}
 */
function getLineInfoHtml(line) {
  let lineInfoHtml = "<ul><span class='info-title'>Info:</span>";
  lineInfoHtml +=
    "<li><span class='info-content'>Source node =" +
    line.source.name +
    "</span></li>";
  lineInfoHtml +=
    "<li><span class='info-content'>Target node =" +
    line.target.name +
    "</span></li>";
  lineInfoHtml +=
    "<li><span class='info-content'>type=" + line.value + "</span></li></ul>";
  return lineInfoHtml;
}

/**
 * Renew the plot under different scenarios.
 * @param {Object} preData - The data of previous round.
 * @param {Object} curData - The data of current round.
 */
function renewPlot(preData, curData) {
  var result = [];

  // There are three Scenarios:
  // Case 1 : `preData` is null/ empty/ does not have lines data.
  if (
    preData === undefined ||
    preData.length === 0 ||
    preData.lines.length === 0
  ) {
    // Based on the condition that Lines can only be deleted.

    // Case 1.1
    // If the `curRoundIndex` is equal to the `endRound`,
    // and there is not existing lines in previous network,
    // then we may assume no lines need to be deleted, so just do nothing.

    // Case 1.2
    // If the `curRoundIndex` is not equal to the `endRound`,
    // and previous network does not have lines,
    // then we may assume that the user wants to see the network of a specific round.
    // so we render a new plot with `curData` directly.
    if (curRoundIndex !== endRoundIndex) {
      drawPlot(curData);
    }

    // Case 2 : `NewData` is null/ empty/ does not have lines.
    // In this case, lines not exist in current round, but exist in previous round.
    // Then we may assume that lines in previous network are all needed to be removed.
  } else if (
    curData === undefined ||
    curData.length === 0 ||
    curData.lines.length === 0
  ) {
    preData.lines.forEach(function (item) {
      result.push(item.id);
    });
    removeLines(result);

    // Case3 : Both `preData` and `newData` have lines,
    //         then compare their lines and find lines need to be removed.
  } else {
    let preLines = preData.lines;
    let curLines = curData.lines;

    // Case 3.1 : If the count of lines is equal, it means no lines need to be removed,
    //            then we just do nothing.
    if (preLines.length === curLines.length) {
      return;

      // Case 3.2 : If the count of lines in previous network is more then current network,
      // it means lines in the `preLines` but not in `curLines` need to be removed.
    } else if (preLines.length > curLines.length) {
      let curLinesSet = new Set();

      curLines.forEach(function (item) {
        curLinesSet.add(item.id);
      });

      preLines.forEach(function (item) {
        if (!curLinesSet.has(item.id)) {
          result.push(item.id);
        }
      });
      console.log(result);
      removeLines(result);

      // Case 3.3 : If lines in previous network is fewer then lines in current network,
      // then we may assume that the user wants to see the network of a specific round.
      // We render a new plot with `curData` directly.
    } else {
      drawPlot(curData);
    }
  }
}

/**
 * Remove different lines between two rounds.
 * @param {Object} lines - The different lines.
 */
function removeLines(lines) {
  if (lines === undefined || lines.length === 0) {
    return;
  }

  lines.forEach(function (item) {
    $("#" + item).remove();
  });
}
