/* jshint browser: true */
/* global jQuery, $, console, moment*/

function openingHours(weeks){
    console.log("STEP 1: Getting data from API");
    var ajax;
    $.ajax({
        url: "https://api3.libcal.com/api_hours_grid.php?iid=3237&format=json&weeks="+weeks+"&callback=response",
        jsonpCallback: "response",
        dataType: "jsonp",
    }).then(function(content){
        var data = content.locations[0].weeks;
        console.log(data);
        console.log("STEP 2: Starting formatting");
        var response = {};    
        response.timeZone = "+0200";

        // Loop through all the weeks.
        response.weeks = {};
        for(var i = 0; i < data.length; i++){
            var momentObject,
                momentObjectClosing,
                momentObjectOpening;

            // Create a moment object of the date of the day.
            momentObject = moment(data[i].Monday.date, "YYYY-MM-DD");
            var weekNumber = momentObject.format("W");
            console.log("-------------------------------------\nSTEP 2: Formatting week "+weekNumber+" ("+i+")");
            var weekDay;
            response.weeks[weekNumber] = [];
            for(var d = 0; d < 7; d++){
                weekDay = getWeekDay(d);
                console.log("STEP 2: Formatting week "+weekNumber+": "+weekDay+" ("+d+")");
                response.weeks[weekNumber][d] = {};
                response.weeks[weekNumber][d].status = data[i][weekDay].times.status;
                response.weeks[weekNumber][d].day = weekDay;
                response.weeks[weekNumber][d].date = data[i][weekDay].date;
                if(data[i][weekDay].times.status == "open"){
                    momentObjectOpening = moment(data[i][weekDay].times.hours[0].from, "ha");
                    momentObjectClosing = moment(data[i][weekDay].times.hours[0].to, "ha");
                    response.weeks[weekNumber][d].openingTime = momentObjectOpening.format("HH:mm");
                    response.weeks[weekNumber][d].closingTime = momentObjectClosing.format("HH:mm");
                } else if (response.weeks[weekNumber][d].status == "closed" && typeof data[i][weekDay].times.note != 'undefined') {
                    response.weeks[weekNumber][d].note = data[i][weekDay].times.note;
                }
            }
        }
        console.log("STEP 2: Formatting complete");
        console.log(JSON.stringify(response));
    });
    function getWeekDay(weekNumber){
        var day;
        switch (weekNumber) {
            case 0:
                day = "Monday";
                break;
            case 1:
                day = "Tuesday";
                break;
            case 2:
                day = "Wednesday";
                break;
            case 3:
                day = "Thursday";
                break;
            case 4:
                day = "Friday";
                break;
            case 5:
                day = "Saturday";
                break;
            case  6:
                day = "Sunday";
                break;
        }
        return day;
    }
}


/*if(typeof theObject.key != 'undefined'){
    //object exists, do stuff
}*/