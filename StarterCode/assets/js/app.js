//----------------------------------------//
//----          SVG Dimensions    --------//
//----------------------------------------// 

var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 60,
  bottom: 80,
  left: 100
};


//----------------------------------------//
//----         Set up Chart       --------//
//----------------------------------------// 


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our scatter plot,
// and shift the latter by left and top margins.

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append an SVG group
var chartgroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

/// function used for updating x-scale var upon click on axis label
function xScale(acs_data, chosenXAxis,) {
/// create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(acs_data, d => d[chosenXAxis]) * 0.7,
      d3.max(acs_data, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

//----------------------------------------//
//----   Render new circles in svg--------//
//----------------------------------------// 

// function used for updating circles group for x values  

function renderCircles(circlesGroup, newXScale, chosenXAxis,chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("dx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))
    .attr("dy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
//----------------------------------------//
//----    Update Text in circles  --------//
//----------------------------------------//


// Function used for updating text in circles for X Values group with a transition to new text.
function renderXText(circlesGroup, chosenXAxis, newXScale) {
    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// Function used for updating text in circles for Y Values group with a transition to new text.
function renderYText(circleGroup, chosenYAxis, newYScale) {
  circleGroup.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis]));
  return circleGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var labelX;
  if (chosenXAxis === "poverty") {
    labelX = "In poverty(%):";
  }
  else if (chosenXAxis === "age") {
    labelX = "age(median)";
  }
  else {
    labelX = "Household income:"
}

var labelY;

// if statement for yAxis value/label

if      (chosenYAxis === "healthcare") {
        labelY = "Lacks Healthcare(%)";
        }
else if (chosenYAxis ===  "smokes") {
        labelY = "Smokes(%)";
      }
else {
        labelY = "Obesity(%)";
      };
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("color", "white")
    .style("background", 'black')
    .style("border", "solid")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX}: ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

// =======================================================================//        
// Create tooltip in the chart for both circles and state label groups
// =======================================================================//   
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
  return circlesGroup;
}


//----------------------------------------//
//----    Retrieve data from CSV  --------//
//----------------------------------------//

d3.csv("data.csv").then(acs_data => {
 
  // parse acs_data
  acs_data.forEach(data => {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(acs_data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
        .domain([d3.min(acs_data, d => d[chosenYAxis]) * -1,
            d3.max(acs_data, d => d[chosenYAxis]) * +1])
        .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // append x axis
  var xAxis = chartgroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  // append y axis
  var yAxis = chartgroup
    .append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circle
  var circlesGroup = chartgroup
    .selectAll("circle")
    .data(acs_data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 18)
    .attr("fill", "red")
    .attr("opacity", ".35");

    // append text inside circles
    var circlesText = circlesGroup
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5);

//----------------------------------------//
//Create group of X Axis labels 
//----------------------------------------//

  var xlabelsGroup = chartgroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var povertyLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In poverty(%)");
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("age (median)");

    var IncomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
//----------------------------------------//
//----Create group of Y Axis labels  -----//
//----------------------------------------//
    var ylabelsGroup = chartgroup
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`)
            .attr("transform", "rotate(-90)");
      
    var healthcareLabel = ylabelsGroup
            .append("text")
            .attr("x", -280)
            .attr("y", -30)
            .attr("value", "healthcare") // value to grab for event listener
            .classed("active", true)
            .text("Lacks Healthcare (%)");

      var smokesLabel = ylabelsGroup
            .append("text")
            .attr("x", -280)
            .attr("y", -50)
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

      var obesityLabel = ylabelsGroup
            .append("text")
            .attr("x", -280)
            .attr("y", -70)
            .attr("value", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("Obese (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      chosenXAxis = d3.select(this).attr("value");
        // updates x scale for new data
        xLinearScale = xScale(acs_data, chosenXAxis,width);
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            IncomeLabel
              .classed("active", true)
              .classed("inactive", false);
            AgeLabel
              .classed("active", false)
              .classed("inactive", true);
            PovertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
       // Update circles with new x values.
       circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
       // Update tool tips with new info.
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
       // Update circles text with new values.
       circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
   });
//------------------------------------------
// on clicking Y axis labels
//------------------------------------------
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // Grab selected label.
    chosenYAxis = d3.select(this).attr("value");
    // updates scale for new data
    yLinearScale = yScale(acs_data, chosenYAxis, height);  
    // Update y axis with new transition    
    yAxis = renderYAxes(yLinearScale, yAxis);
   
        // if statement to update clicked label to active and others to inactive
            if   (chosenYAxis === "healthcare") {
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                      }
            else if(chosenYAxis === "smokes")  {
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    }
            else                            {
                    obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            };
        // Update circles with new y values.
        circlesGroup = renderCircles(circlesGroup, newYScale, chosenYAxis);
        // Update circles text with new values.
        circlesText = renderYText(circlesText, newYScale, chosenYAxis);
        // Update tool tips with new info.
        circlesGroup = updateToolTip(chosenXxis, chosenYAxis,circlesGroup); 
      
        });// close "on click" function for y axis

}).catch(function(error) {
  console.log(error);
})