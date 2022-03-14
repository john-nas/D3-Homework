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


/// Create an SVG wrapper, append an SVG group that will hold our scatter plot,
/// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight )
  .attr("width", svgWidth + 500);

/// Append an SVG group
var chartgroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


/// function used for updating x-scale var upon click on axis label
function xScale(acs_data, chosenXAxis) {
// create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(acs_data, d => d[chosenXAxis]) * 0.7,
      d3.max(acs_data, d => d[chosenXAxis]) * 1.2])
    .range([0,width]);
  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
 // create scales
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// Function used for updating y-scale var upon click on axis label.
function yScale(acs_data, chosenYAxis) {
    // Create scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(acs_data, d => d[chosenYAxis]) * -1,
            d3.max(acs_data, d => d[chosenYAxis]) * +1])
        .range([height, 0]);
    return yLinearScale;
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

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("dx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}
// function used for updating circles group with a transition to
// new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
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
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

  // create variables for displaying labels in tooltip
  var tooltipX ;

  // if statement for xAxis value/label
  if      (chosenXAxis === "poverty") {
          tooltipX = "Poverty(%)";
          }
  else if (chosenXAxis === "age") {
          tooltipX = "Age";
          } 
  else {
          tooltipX = "Household Income";
};

  var tooltipY ;

    // if statement for yAxis value/label
 
    if      (chosenYAxis === "healthcare") {
            tooltipY = "Lacks Healthcare(%)";
            }
    else if (chosenYAxis ===  "smokes") {
            tooltipY = "Smokes(%)";
          }
    else {
            tooltipY = "Obesity(%)";
          };

    

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .style("color", "white")
    .style("background", 'black')
    .style("border", "solid")
    .offset([40, -60])
    .html(function(d) {return (`${d.state}<br>${tooltipX}: ${d[chosenXAxis]}<br>${tooltipY}: ${d[chosenYAxis]}`);
    });

    // Create tooltip in the chart for both circles and state label groups
    // =======================================================================
    circlesGroup.call(toolTip);


    // Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup
    .on("mouseover", function(acs_data) {toolTip.show(acs_data, this);})
    .on("mouseout", function(acs_data) {toolTip.hide(acs_data);});
    return circlesGroup;
 
};          

//----------------------------------------//
//----    Retrieve data from CSV  --------//
//----------------------------------------//


/// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(acs_data => {
 
  /// parse acs_data
  acs_data.forEach(data => {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
  });

  /// Initial  X Y Paramaters
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";


  // xLinearScale function above csv import
  var xLinearScale = xScale(acs_data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(acs_data, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartgroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

  // append y axis
  var yAxis = chartgroup
      .append("g")
      .call(leftAxis);

    
  // append initial circles
  var circlesGroup = chartgroup
      .selectAll("circle")
      .data(acs_data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 18)
      .attr("fill", "green")
      .attr("opacity", ".4")
      .append("g");

    // append text inside circles
    var circlesText = circlesGroup
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5);


    var circles = circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15);


//----------------------------------------//
//----Create group of X Axis labels  -----//
//----------------------------------------//

  var xlabelsGroup = chartgroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

          var povertyLabel = xlabelsGroup
          .append("text")
            .attr("x", -300)
            .attr("y", 50)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In poverty(%)");

          var ageLabel = xlabelsGroup
          .append("text")
            .attr("x", -50)
            .attr("y", 50)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

          var incomeLabel = xlabelsGroup
          .append("text")
            .attr("x", 200)
            .attr("y", 50)
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
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

//----------------------------------------//
//----x axis labels event listener--------//
//----------------------------------------//

  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // updates scale for new data
        xLinearScale = xScale(acs_data, chosenXAxis);
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circles = renderXCircles(circles, xLinearScale, chosenXAxis);
        //   updating text within circles
        circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
        
     // if statement for updating clicked label to active and others to inactive
    
    if (chosenXAxis === "poverty") {
            povertyLabel.attr("class", "active");
            ageLabel.attr("class", "inactive");
            incomeLabel.attr("class", "inactive");
          }
    else if (chosenXAxis === "age") {
            povertyLabel.attr("class", "inactive");
            ageLabel.attr("class", "active");
            incomeLabel.attr("class", "inactive");
          }
    else                            {
            povertyLabel.attr("class", "inactive")
            ageLabel.attr("class", "inactive");
            incomeLabel.attr("class", "active")
    
      }; /// if statement end
    }
  }
);
  
//------------------------------------------
    // on clicking Y axis labels
//------------------------------------------
  ylabelsGroup.selectAll("text")
    .on("click", function() {
  // get value of selection
      var value = d3.select(this).attr("value");
        
        if (value !== chosenYAxis) {
      
      // Assign new value to value
          chosenYAxis = value 
      // updates scale for new data
          yLinearScale = yScale(acs_data, chosenYAxis);
      // Update y axis with new transition    
          yAxis = renderYAxes(yLinearScale, yAxis);
      // Update circles with new y values.
          circles = renderYCircles(circles, yLinearScale, chosenYAxis);
          // Update circles text with new values.
          circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);
          // Update tool tips with new info.
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
          // if statement to update clicked label to active and others to inactive
              if   (chosenYAxis === "healthcare") {
                      healthcareLabel.attr("class", "active");
                      smokesLabel.attr("class", "inactive");
                      obesityLabel.attr("class", "inactive");
                        }
              else if(chosenYAxis === "smokes")  {
                      smokesLabel.attr("class", "active");
                      healthcareLabel.attr("class", "inactive");
                      obesityLabel.attr("class", "inactive");
                      }
              else                            {
                      obesityLabel.attr("class", "active");
                      smokesLabel.attr("class", "inactive");
                      healthcareLabel.attr("class", "inactive");
              }; 
            }; //if statement end
          });// close "on click" function for y axis


}).catch(function(error) {
  console.log(error);
});
// close "on click" function for y axis
