import * as d3 from "d3";
import * as axios from "axios";
import "../css/style.css";

init();

document.getElementById("play-button").onclick = function () {
  init();
};

function init() {
  load_data();
}

function load_data() {
  let flaskPort = 5000;
  axios
    .get(`http://localhost:${flaskPort}/get_data`)
    .then((response) => show_image(response.data))
    .catch((error) => console.log(error.response));
}

function show_image(network) {
  const containerId = "#tpContainer";
  const widthOfSVG = 400;
  const heightOfSVG = 400;
  const widthOfNodeIcon = 3;
  const heightOfNodeIcon = 3;
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
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(widthOfSVG / 2, heightOfSVG / 2));

  const svg = d3
    .select(containerId)
    .append("svg")
    .attr("viewBox", [6, 10, 35, 35]);

  const link = svg
    .append("g")
    // .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(myLines)
    .join("line")
    .attr("stroke-width", 0.1)
    .attr("stroke", "black");

  console.log(link);

  const node = svg
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
      .attr("x1", (d) => d.source.x / 10)
      .attr("y1", (d) => d.source.y / 10)
      .attr("x2", (d) => d.target.x / 10)
      .attr("y2", (d) => d.target.y / 10);

    node.attr("transform", function (d) {
      return "translate(" + (d.x / 10 - 1.5) + "," + (d.y / 10 - 1.3) + ")";
    });
  });

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

function showNodeInfo() {
  $(".node-info")
    .css({
      left: d3.event.x - 330,
      top: d3.event.y - 280,
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
