queue()
    .defer(d3.json, "/dashboarddata")
    .await(makeGraphs);

function makeGraphs(error, apiData) {

// console.log("dashboarddata1 " + JSON.stringify(apiData[0].pageViews));
// console.log("dashboarddata1 " + apiData[0].pageViews);
/*     var pageViewData = "";

    // For each value in the array
    for (var i = 0; i < apiData[0].pageViews.length; i++) 
    {
          console.log("apiData[0].pageViews[i] " + JSON.stringify(apiData[0].pageViews[i]));
         pageViewData += apiData[0].pageViews[i];
    }
console.log("dashboarddata2 " + JSON.stringify(pageViewData)); */
//Start Transformations
var dataSet;

  if (apiData.length == 0){
  //check if the dataset is empty.  If empty, display another page.
    console.log("apiData.length = 0");
    $("#dashboard_nodata").show();
    $("#dashboard_page").hide();
    
  }
  else{
    // $("#dashboard_nodata").hide();
    // $("#dashboard").show();
    console.log("apiData.length == 1");
    dataSet = JSON.stringify(apiData[0].pageViews);  
  dataSet = JSON.parse(dataSet);
  
  

  
	var dateFormat = d3.time.format("%Y-%m-%d");
  // var dateFormat = d3.time.format("%Y-%m-%d %X");
	dataSet.forEach(function(d) {
		d.date = dateFormat.parse(d.date);
    console.log("d.date " + d.date);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	var state = ndx.dimension(function(d) { return d.school_state; });
	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });
  
  	//Define Dimensions
	var pageViewsDate = ndx.dimension(function(d){return d.date;});
	var pageViewsSessionCookies = ndx.dimension(function(d) { return d.sessionCookies; });
  var pageViewsrevenue = ndx.dimension(function(d) { return d.revenue; });

/*   var pageViewsDate = ndx.dimension(function(d){
    return d.date_posted; 
    });
    for (i = 0; (i < d.pageViews.length) ; i++){
    console.log("i  " + i);
    console.log("d.pageViews[i].date " + d.pageViews[i].date);
    console.log("dateFormat.parse(d.pageViews[i].date) " + dateFormat.parse(d.pageViews[i].date));
      d.pageViews[i].date = dateFormat.parse(d.pageViews[i].date);
          d.pageViews[i].date.setDate(1);
      // d.total_donations = +d.total_donations;
    } */

	//Calculate metrics
	var projectsBypageViewsDate = pageViewsDate.group(); 
	var projectsBypageViewsSessionCookies = pageViewsSessionCookies.group(); 
  var projectsBypageViewsrevenue = pageViewsrevenue.group();
  var projectsBypageViewsrevenuebydate = pageViewsDate.group().reduceSum(function(d) {return d.revenue;});
	var all = ndx.groupAll();

	//Calculate Groups
	// var totalDonationsState = state.group().reduceSum(function(d) {
		// return d.total_donations;
	// });

	// var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
		// return d.grade_level;
	// });

	// var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
		// return d.funding_status;
	// });



	// var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});

	//Define threshold values for data
	var minDate = pageViewsDate.bottom(1)[0].date;
	var maxDate = pageViewsDate.top(1)[0].date;

console.log(minDate);
console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	// var pageViewsSessionCookiesChart = dc.rowChart("#grade-chart");
	var sessionCookieChart = dc.barChart("#sessionCookie-chart");
	// var fundingStatusChart = dc.pieChart("#funding-chart");
	// var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	// var netDonations = dc.numberDisplay("#net-donations");
	// var stateDonations = dc.barChart("#state-donations");
  var revenueChart = dc.lineChart("#revenue-chart");


  selectField = dc.selectMenu('#menuselect')
        .dimension(pageViewsDate)
        .group(projectsBypageViewsDate); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

/* 	netDonations
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".3s")); */

 	dateChart
		.width(700)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(pageViewsDate)
		.group(projectsBypageViewsDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Date")
		.yAxis().ticks(4); 

	sessionCookieChart
        .width(400)
        .height(300)
        .transitionDuration(1000)
        .dimension(pageViewsSessionCookies)
        .group(projectsBypageViewsSessionCookies)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("d"))

/* 	povertyLevelChart
		//.width(300)
		.height(220)
        .dimension(pageViewCount)
        .group(projectsBypageViewCount)
        .xAxis().ticks(4);*/

	revenueChart
    .width(700)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(pageViewsDate)
		.group(projectsBypageViewsrevenuebydate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Date")
    .yAxisLabel("Revenue in $")
		.yAxis().ticks(4); 

  
/*           fundingStatusChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(fundingStatus)
            .group(projectsByFundingStatus); */


/*     stateDonations
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(state)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s")); */






    dc.renderAll();
  }
};