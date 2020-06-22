init();

document.getElementById("animation").onclick = function () {
  init();
};

function init() {
  load_data();
}

function load_data() {
  axios
    .get("/get_data")
    .then((response) => show_image(response.data))
    .catch((error) => console.log(error.response));
}

function show_image(network) {
  const containerId = "#tpContainer";
  const widthOfSVG = 960;
  const heightOfSVG = 500;
  const widthOfNodeIcon = 30;
  const heightOfNodeIcon = 30;
  const nodeIconURL =
    "https://cdn0.iconfinder.com/data/icons/industrial-circle/512/Electricity_supply_network-512.png";
  const generatorIconURL =
    "https://f0.pngfuel.com/png/950/932/electric-generator-diesel-generator-engine-generator-electricity-alternator-business-png-clip-art.png";
  const loadIconURL =
    "https://library.kissclipart.com/20180830/xrq/kissclipart-electric-logo-png-clipart-electricity-electrical-e-bd404f699a04486b.jpg";
  const iconsArr = {
    "0": nodeIconURL,
    "1": loadIconURL,
    "2": generatorIconURL,
  };

  let myNodes = $.map(network.nodes, function (d) {
    return {
      name: d.index,
      type: d.type,
    };
  });
  let myLines = $.map(network.lines, function (d) {
    return {
      source: d.from_bus,
      target: d.to_bus,
      value: d.length_km,
      origin: d,
    };
  });

  // remove old image
  d3.select(containerId).selectAll("svg").remove();

  console.log("show image");

  let svg = d3
    .select(containerId)
    .append("svg")
    .attr("width", widthOfSVG)
    .attr("height", heightOfSVG)
    .style("pointer-events", "all");

  let graph = svg.append("g").attr("class", "graph");

  console.log(myNodes);
  console.log(myLines);

  let force = d3.layout
    .force()
    .nodes(myNodes)
    .links(myLines)
    .size([widthOfSVG, heightOfSVG])
    .linkDistance(60)
    .charge(-700)
    .start();

  var lines = graph
    .selectAll("line.line")
    .data(myLines)
    .enter()
    .append("g")
    .attr("class", "line");

  lines.append("line").style("stroke", "black").style("stroke-width", 2);

  var node = graph
    .selectAll("g.node")
    .data(myNodes)
    .enter()
    .append("g")
    .attr("class", "node");

  node
    .append("image")
    .attr("width", widthOfNodeIcon)
    .attr("height", heightOfNodeIcon)
    .attr("href", function (d) {
      return iconsArr[d.type];
    });

  node.call(getDragBehavior(force));

  force.on("tick", function () {
    lines
      .select("line")
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      var image = d3.select(this).select("image")[0][0],
        halfWidth = parseFloat(70) / 2,
        halfHeight = parseFloat(70) / 2;

      return "translate(" + (d.x - halfWidth) + "," + (d.y - halfHeight) + ")";
    });
  });

  node
    .on("mouseenter", function (d) {
      d3.select(this).style("cursor", "pointer");
      $(containerId).append(createNodeInfoHtml(d));
      showNodeInfo();
      console.log("mouseenter");
    })
    .on("mouseleave", function () {
      hideNodeInfo();
      console.log("mouseleave");
    });
}

function showNodeInfo() {
  $(".node-info")
    .css({
      left: d3.event.x + 20,
      top: d3.event.y + 20,
    })
    .show();
  console.log("showNodeInfo");
}

function hideNodeInfo() {
  $(".node-info").remove();
  console.log("hideNodeInfo");
}

function createNodeInfoHtml(node) {
  let type = "bus";
  if (node.type == 1) {
    type = "generator";
  }
  if (node.type == 2) {
    type = "load";
  }

  let html = "<div class='node-info'><ul><span class='info-title'>Info:</span>";
  html += "<li><span class='info-content'>index=" + node.index + "</span>";
  html += "<li><span class='info-content'>type=" + type + "</span></li>";
  html += "</ul></div>";

  console.log(node.index);
  console.log(node.type);
  return html;
}

function getDragBehavior(force) {
  return d3.behavior
    .drag()
    .origin(function (d) {
      return d;
    })
    .on("dragstart", dragstart)
    .on("drag", dragging)
    .on("dragend", dragend);

  function dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
    force.start();
  }

  function dragging(d) {
    d.x = d3.event.x;
    d.y = d3.event.y;
  }

  function dragend(d) {
    d3.select(this).classed("dragging", false);
  }
}
