/**
 * @fileOverview
 * @name openingHours
 * @author Gustav Lindqvist gustav.lindqvist@ju.se
 *
 * jshint browser: true
 * global jQuery, $, console, moment
 */


/**
 *  Checks if the library is currently opened.
 *  @return {Boolean} status
 */
function currentlyOpen(){
    var ajax;
    $.ajax({
        url: "https://api3.libcal.com/api_hours_today.php?iid=3237&lid=0&format=json&callback=response",
        jsonpCallback: "response",
        dataType: "jsonp",
    }).then(function(content){
        console.log(content.locations[0].times.currently_open);
        return content.locations[0].times.currently_open;
    });
}


/**
 *  Returns opening hours a specified amount of weeks forward
 *  @param {Number} weeks 
 */
function openingHours(weeks){
    // Grab data from the API with JSONP
    $.ajax({
        url: "https://api3.libcal.com/api_hours_grid.php?iid=3237&format=json&weeks="+weeks+"&callback=response",
        jsonpCallback: "response",
        dataType: "jsonp",
    
    // When data is grabbed from API, format it into our own JSON-format
    }).then(function(content){
        var data = content.locations[0].weeks;
        var response = {};

        // Loop through all the weeks.
        response.weeks = {};
        for(var i = 0; i < data.length; i++){
            var momentObject,
                momentObjectClosing,
                momentObjectOpening;

            // Create a moment object of the date of the day.
            momentObject = moment(data[i].Monday.date, "YYYY-MM-DD");
            var weekNumber = momentObject.format("W"),
                weekDay;
            response.weeks[weekNumber] = [];
            
            // Loop through the days of the week
            for(var d = 0; d < 7; d++){
                weekDay = getWeekDay(d);
                response.weeks[weekNumber][d] = {};
                response.weeks[weekNumber][d].status = data[i][weekDay].times.status;
                response.weeks[weekNumber][d].day = weekDay;
                response.weeks[weekNumber][d].date = data[i][weekDay].date;
                
                // If it's open, write out the times it is open.
                if(data[i][weekDay].times.status == "open"){
                    momentObjectOpening = moment(data[i][weekDay].times.hours[0].from, "ha");
                    momentObjectClosing = moment(data[i][weekDay].times.hours[0].to, "ha");
                    response.weeks[weekNumber][d].openingTime = momentObjectOpening.format("HH:mm");
                    response.weeks[weekNumber][d].closingTime = momentObjectClosing.format("HH:mm");
                    
                // If it's closed, see if there is a note on why it's closed.
                } else if (response.weeks[weekNumber][d].status == "closed" && typeof data[i][weekDay].times.note != 'undefined') {
                    response.weeks[weekNumber][d].note = data[i][weekDay].times.note;
                }
            }
        }
    });
    
    // 
    /**
     *  Translate from number (Array 0-6) to the weekday.
     *  @param {Number} number of the day of the week
     *  @return {String} weekday
     */
    function getWeekDay(weekDayNumber){
        var day;
        switch (weekDayNumber) {
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