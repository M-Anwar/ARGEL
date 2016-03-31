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
    $("#dashboard_nodata").hide();
    $("#dashboard_page").show();
    console.log("apiData.length != 0 ");
    dataSet = JSON.stringify(apiData);  
  dataSet = JSON.parse(dataSet);
  
  console.log("dashboarddata " + JSON.stringify(apiData));
	var dateFormat = d3.time.format("%Y-%m-%d");  //date only
  var timeFormat = d3.time.format("%X"); //time
  // var dateFormat = d3.time.format("%Y-%m-%d %X"); //date and time
	dataSet.forEach(function(d) {
  // console.log("d.date " + d.date);
		d.date = dateFormat.parse(d.date);
    d.time = timeFormat.parse(d.time);
    console.log("d.date " + d.date);
    console.log("d.time " + d.time);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	// var state = ndx.dimension(function(d) { return d.school_state; });
	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });
  
  /*** THINGS TO ADD: SUM of revenue; dropdown selector for view by ad; graph by time; 
        revenue by time; revenue by ad***/
  	//Define Dimensions
	var Date = ndx.dimension(function(d){return d.date;});
	var SessionCookies = ndx.dimension(function(d) { return d.sessionCookies; });
  var revenue = ndx.dimension(function(d) { return d.revenue; });
  var adId = ndx.dimension(function(d) { return d.adId; });

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
	var projectsByDate = Date.group(); 
	var projectsBySessionCookies = SessionCookies.group(); 
  var projectsByrevenue = revenue.group();
  var projectsByrevenuebydate = Date.group().reduceSum(function(d) {return d.revenue;});
  var projectsByadId = adId.group();
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


  var projectsBytotalRevenuePerAd = adId.group().reduceSum(function(d) {return d.revenue});
	// var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});
	var projectsBytotalRevenuetotal = ndx.groupAll().reduceSum(function(d) {return d.revenue;});

	//Define threshold values for data
	var minDate = Date.bottom(1)[0].date;
	var maxDate = Date.top(1)[0].date;

console.log(minDate);
console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	// var SessionCookiesChart = dc.rowChart("#grade-chart");
	var sessionCookieChart = dc.barChart("#sessionCookie-chart");
  var userCountChart = dc.rowChart("#user-count");
	// var fundingStatusChart = dc.pieChart("#funding-chart");
	// var povertyLevelChart = dc.rowChart("#poverty-chart");
  var AdDistributionChart = dc.pieChart("#ad-distribution-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var totalRevenue = dc.numberDisplay("#total-revenue");
	// var stateDonations = dc.barChart("#state-donations");
  // var revenueChart = dc.lineChart("#revenue-chart");


  selectField = dc.selectMenu('#menuselect')
        .dimension(adId)
        .group(projectsByadId); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	totalRevenue
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(projectsBytotalRevenuetotal)
		.formatNumber(d3.format("$.2f"))    ;

 	dateChart
		.width(700)
		.height(300)
    .legend(dc.legend().x(600).y(10).itemHeight(13).gap(5))
        .brushOn(false)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(Date)
		.group(projectsByDate, "Group by Date")
    .valueAccessor(function (d) {
            return d.value;
        })
    .stack(projectsByrevenuebydate, "Group by Revenue", function (d) {
            return d.value;
        })
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Date")
    .yAxisLabel("Ad View Count")
		.yAxis().ticks(4); 

	sessionCookieChart
        .width(400)
        .height(300)
        .transitionDuration(1000)
        .dimension(SessionCookies)
        .group(projectsBySessionCookies)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(Date))
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

 	userCountChart
		// .width(300)
		.height(450)
        .dimension(SessionCookies)
        .group(projectsBySessionCookies)
        // .xAxisLabel("View Count")
        // .yAxisLabel("User ID")
        .xAxis().ticks(4);

/* 	revenueChart
    .width(700)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(Date)
		.group(projectsByrevenuebydate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Date")
    .yAxisLabel("Revenue in $")
		.yAxis().ticks(4); 
 */
  
/*           fundingStatusChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(fundingStatus)
            .group(projectsByFundingStatus); */


           AdDistributionChart
            // .height(500)
            // .width(500)
            .radius(170)
            // .innerRadius(40)
            .transitionDuration(1000)
            .dimension(adId)
            .group(projectsByadId); 

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