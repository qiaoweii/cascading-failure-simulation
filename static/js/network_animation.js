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

// function load_data(after) {

//   console.log("load data");
//   var k = 0;

//   function load_next() {
//     if (k >= files_to_load.length) {
//       after();
//       return;
//     }

//     var file_name = "/" + files_to_load[k] + ".json";

//     d3.json(file_name, function (data) {
//       network[files_to_load[k]] = data;
//       k++;
//       load_next();
//     });
//   }

//   load_next();
// }

function show_image(network) {
  d3.select("#tpContainer").selectAll("svg").remove();
  console.log("show image");

  var width = 960,
    height = 500;

  var color = d3.scale.category20();

  var force = d3.layout
    .force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

  // var svg = d3
  //   .select("#tpContainer")
  //   .append("svg")
  //   .attr("width", width)
  //   .attr("height", height);
  var svg = d3
    .select("#tpContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("pointer-events", "all");

  var graph = svg.append("g").attr("class", "graph");

  var size_of_nodes = network.nodes.length;
  console.log(size_of_nodes);
  var my_nodes = $.map(network.nodes, function (d) {
    return { name: d.index, type: d.type };
  });
  var my_lines = $.map(network.lines, function (d) {
    return {
      source: d.from_bus,
      target: d.to_bus,
      value: d.length_km,
      origin: d,
    };
  });

  console.log(my_nodes);
  console.log(my_lines);

  force.nodes(my_nodes).links(my_lines).start();

  // var link = graph
  //   .selectAll(".link")
  //   .data(my_links)
  //   .enter()
  //   .append("line")
  //   .attr("class", "link")
  //   .style("stroke", "black")
  //   .style("stroke-width", 1);

  var lines = graph
    .selectAll("line.line")
    .data(my_lines)
    .enter()
    .append("g")
    .attr("class", "line");

  lines.append("line").style("stroke", "black").style("stroke-width", 2);

  // var node = graph
  //   .selectAll(".node")
  //   .data(my_nodes)
  //   .enter()
  //   .append("circle")
  //   .attr("class", "node")
  //   .attr("r", 5)
  //   .style("fill", function (d) {
  //     if (d.type == 0) {
  //       return "blue";
  //     } else if (d.type == 1) {
  //       return "yellow";
  //     } else {
  //       return "red";
  //     }
  //   })
  //   .call(force.drag);

  var icons = {
    "0":
      "https://cdn0.iconfinder.com/data/icons/industrial-circle/512/Electricity_supply_network-512.png",
    "1":
      "https://library.kissclipart.com/20180830/xrq/kissclipart-electric-logo-png-clipart-electricity-electrical-e-bd404f699a04486b.jpg",
    "2":
      "https://f0.pngfuel.com/png/950/932/electric-generator-diesel-generator-engine-generator-electricity-alternator-business-png-clip-art.png",
  };

  var node = graph
    .selectAll("g.node")
    .data(my_nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  node
    .append("image")
    .attr("width", 40)
    .attr("height", 40)
    .attr("href", function (d) {
      return icons[d.type];
    });

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

      $("#tpContainer").append(createInfoTip(d));
      $(".node-info")
        .css({
          left: d3.event.x + 20,
          top: d3.event.y + 20,
        })
        .show();
      console.log("mouseenter");
    })
    .on("mouseleave", function () {
      $(".node-info").remove();
      console.log("mouseleave");
    });
}

function createInfoTip(node) {
  let type = "bus";
  if (node.type == 1) {
    type = "generator";
  }
  if (node.type == 2) {
    type = "load";
  }
  var html = "<div class='node-info'><ul><span class='info-title'>Info:</span>";
  html += "<li><span class='info-content'>index=" + node.index + "</span>";
  html += "<li><span class='info-content'>type=" + type + "</span></li>";
  html += "</ul></div>";

  console.log(node.index);
  console.log(node.type);
  return html;
}
