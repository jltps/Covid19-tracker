const summaryURL = "https://api.covid19api.com/summary";
const activeURL = "https://api.covid19api.com/total/country/"
let casesHistory;

const getData = async () => {
    const response = await fetch(summaryURL);
    const data = await response.json();
    console.log(data, 'data');
    return data;
}


const writeSummaryToDocument = async () => {
    const data = await getData();
    document.getElementById("cases-number").innerHTML = data.Global.TotalConfirmed.toLocaleString();
    document.getElementById("active-number").innerHTML = data.Global.NewConfirmed.toLocaleString();
    document.getElementById("deaths-number").innerHTML = data.Global.TotalDeaths.toLocaleString();
    document.getElementById("recovered-number").innerHTML = data.Global.TotalRecovered.toLocaleString();
}
  

writeSummaryToDocument();


const fetchCountryName = async (event) => {
    const data = await getData();
    let countryNameInput = $("#coutryNameInput").val();
    console.log(data, 'countryName');
    
    if (!countryNameInput) {
        $("#searchCountryData").html(`<h5>Please enter a Country name</h5>`);
        return;
    }

    let foundCountries = [];
    for(let i = 0; i < data.Countries.length; i++) {
        if(data.Countries[i].Country.toLowerCase().includes(countryNameInput.toLowerCase()))
            foundCountries.push(data.Countries[i]);
    }
    
    if(foundCountries.length > 0) {
        $("#searchCountryData").html(
            `<div id="loader">
                <img src="assets/css/loader.gif" alt="loading..." />
                <h6><i class="fas fa-long-arrow-alt-down"></i> Please click an option below <i class="fas fa-long-arrow-alt-down"></i></h6>
            </div>`);
        } else {
            $("#searchCountryData").html(
                `<div id="loader">
                    <h6><i class="fas fa-exclamation-triangle"></i> No Country found</h6>
                </div>`);
    }
    
    for(let i=0; i < foundCountries.length; i++) {
        $("#searchCountryData").append(
            `<button class="btn btn-info search-country-button" onclick="selectCountry(this.innerHTML)">${foundCountries[i].Country}</button>`)
    }
    console.log(foundCountries, "found country")
}


const casesHistoryData = async (url) => {
    const response = await fetch(activeURL + url);
    const data = await response.json();
    let cases = [];

    for(let i in data) {
        cases.push(data[i].Cases);
    }
    return cases;
}


const selectCountry = async (selectedCountry) => {
    const data = await getData();

    let selectedIndex = data.Countries.findIndex(function(currentValue) {
        return (currentValue.Country == selectedCountry);
    });
    
    const slug = data.Countries[selectedIndex].Slug;
    const url = slug + "/status/confirmed";


    $("#searchCountryData").html(
        `<div class="row">
            <div class="col-12 col-m6 offset-m3 text-center">
                <h4 class="border border-primary border-5 rounded-pill bg-light">COVID-19 info for ${selectedCountry}:</h4>
            </div>
        </div>
        <div class="container">
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                <div class="col">
                    <div id="total-cases" class="card h-100 bg-light text-center">
                        <div class="card-header">CASES</div>
                        <div class="card-body">
                            <h5 id="cases-number" class="card-title">${data.Countries[selectedIndex].TotalConfirmed}</h5>
                        </div>
                    </div>
                </div>    
                <div class="col">
                    <div id="active-cases" class="card h-100 bg-light text-center">
                        <div class="card-header">ACTIVE</div>
                        <div class="card-body">
                            <h5 id="active-number" class="card-title">${data.Countries[selectedIndex].NewConfirmed}</h5>
                        </div>
                    </div>
                </div>   
                <div class="col">
                    <div id="deaths" class="card h-100 bg-light text-center">
                        <div class="card-header">DEATHS</div>
                        <div class="card-body">
                            <h5 id="deaths-number" class="card-title">${data.Countries[selectedIndex].TotalDeaths}</h5>
                        </div>
                    </div>
                </div>    
                <div class="col">
                    <div id="recovered" class="card h-100 bg-light text-center">
                        <div class="card-header">RECOVERED</div>
                        <div class="card-body">
                            <h5 id="recovered-number" class="card-title">${data.Countries[selectedIndex].TotalRecovered}</h5>
                        </div>
                    </div>
                </div>    
            </div>
        </div>`);
    
casesHistory = await casesHistoryData(url);

google.charts.load('current', { 'packages': ['line'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Day');
    data.addColumn('number', 'Total Cases');
    data.addColumn('number', 'New Cases');
     
    let casesRows = [[39, casesHistory[39], (casesHistory[39]-casesHistory[38])]];
    console.log(casesRows+"BEFORE")
    for(let i=40; i < casesHistory.length; i++) {
        casesRows.push([i-40, casesHistory[i], (casesHistory[i]-casesHistory[i-1])]);
    }

    console.log(casesRows+"cases ROWWWS")
    data.addRows(casesRows);

    var options = {
        chart: {
            title: 'Pandemic Evolution since March 1st 2020 until today',
            subtitle: 'in number of cases', 
            legend: 'none'
        },

        axes: {
            x: {
                0: { side: 'bottom' }
            }
        }
    };

    var timelineChart = new google.charts.Line(document.getElementById('timeline'));

    timelineChart.draw(data, google.charts.Line.convertOptions(options));

    $(window).resize(function() {
        timelineChart.draw(data, google.charts.Line.convertOptions(options));
    });
}
}

