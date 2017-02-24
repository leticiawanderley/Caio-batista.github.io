    var widthLab3 = 600,
      heightLab3 = 900,
      start = 0,
      end = 2.5,
      numSpirals = 1,
      marginLab3 = {top:50, bottom:50, left:50, right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(['#1f77b4','#ff7f0e']);

    var r = d3.min([widthLab3, heightLab3]) / 2 - 40;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svgLab3 = d3.select("#chart").append("svg")
      .attr('version', '1.1')
      .attr('viewBox', '0 0 ' + (widthLab3 + marginLab3.right + marginLab3.left) + ' ' + (heightLab3 + marginLab3.left + marginLab3.right))
      .attr('width', '70%')
      .append("g")
      .attr("transform", "translate(" + widthLab3 / 2 + "," + heightLab3 / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svgLab3.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    var spiralLength = path.node().getTotalLength(),
        N = 60,
        barWidth = (spiralLength / N) - 1;

    var someData = [];
    d3.tsv("dataLab3.tsv", function(d) {
      d.frequency = +d.frequency;
      someData.push({
        number: d.number,
        frequency: d.frequency,
        group: d.question
      });
      return d;
    }, function(error, data) {
      if (error) throw error;
      var scale = d3.scaleLinear()
        .domain(d3.extent(someData, function(d){
          return (d.number) + d.group/2;
        }))
        .range([0, spiralLength]);
      
      // yScale for the bar height
      var yScale = d3.scaleLinear()
        .domain([0, d3.max(someData, function(d){
          return d.frequency;
        })])
        .range([0, (r / numSpirals) - 30]);

      svgLab3.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function(d,i){
          
          var linePer = scale(d.number + d.group/2),
              posOnLine = path.node().getPointAtLength(linePer),
              angleOnLine = path.node().getPointAtLength(linePer - barWidth);
        
          d.linePer = linePer; // % distance are on the spiral
          d.x = posOnLine.x; // x postion on the spiral
          d.y = posOnLine.y; // y position on the spiral
          d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

          return d.x;
        })
        .attr("y", function(d){
          return d.y;
        })
        .attr("width", function(d){
          return barWidth;
        })
        .attr("height", function(d){
          return yScale(d.frequency);
        })
        .style("fill", function(d){return color(d.group);})
        .style("stroke", "none")
        .attr("transform", function(d){
          return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
        });
      
      svgLab3.selectAll("text")
        .data(someData)
        .enter()
        .append("text")
        .attr("dy", 15)
        .attr("dx", 5)
        .style("text-anchor", "start")
        .style("font", "12px arial")
        .append("textPath")
        .text(function(d){
            if (d.group == 1) {
                return d.number;
            }
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })

      var tooltip = d3.select("#chart")
        .append('div')
        .attr('class', 'tooltip');

        tooltip.append('div')
        .attr('class', 'question');
        tooltip.append('div')
        .attr('class', 'number');
        tooltip.append('div')
        .attr('class', 'frequency');

      svgLab3.selectAll("rect")
        .on('mouseover', function(d) {

            tooltip.select('.question').html("Pergunta: <b>" + d.group + "</b>");
            tooltip.select('.number').html("Número escolhido: <b>" + d.number + "</b>");
            tooltip.select('.frequency').html("Frequência: <b>" + d.frequency + "%<b>");

            tooltip.style('display', 'block');
            tooltip.style('opacity',2);

        })
        .on('mousemove', function(d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
            .style('left', (d3.event.layerX - 25) + 'px');
        })
        .on('mouseout', function(d) {
            tooltip.style('display', 'none');
            tooltip.style('opacity',0);
        });

      var legend = svgLab3.selectAll(".legend")
        .data(["Pergunta 1", "Pergunta 7"])
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(-" + marginLab3.left * 9 + ", " + (i+2) * 20 + ")"; })
          .style("font", "12px sans-serif");

        legend.append("rect")
            .attr("x", widthLab3 + 18)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);

        legend.append("text")
            .attr("x", widthLab3 + 44)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d; });
    });

    