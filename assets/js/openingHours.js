/**
 *  ## OpeningHours
 *  Opening Hours script for Jönköping University Library
 *  
 *  @author Gustav Lindqvist (gustav.lindqvist@ju.se)
 *  Use by including this file and then initializing with 'OpeningHours.initialize(language)' where language is a string.
 *
 *  jshint browser: true
 *  global jQuery, $, console, moment
 *
 */
var OpeningHours = {
    language: "",
    
    /**
     * ## Initialize
     * Initializes the Opening Hours script.
     *
     * @public
     * @param {String} Language, written out as either sv (swedish) or en (english).
     * @returns {Void}
     */
    initialize: function(lang) {
        // Set the language attribute to the specified in the initialize function.
        OpeningHours.language = lang;
        
        // Get 4 weeks of data from API and then pass it on to showCountdown() and showOpeningHours().
        OpeningHours.getData(4,OpeningHours.showCountdown, OpeningHours.showOpeningHours);
    },
     
    /**
     *  ### Currently Open
     *  Checks if the library is currently opened.
     *
     *  @private
     *  @param {String} output
     *  @returns {Boolean} status
     */
    currentlyOpen: function(output){
        $.ajax({
            url: "https://api3.libcal.com/api_hours_today.php?iid=3237&lid=0&format=json&callback=response",
            jsonpCallback: "response",
            dataType: "jsonp",
        }).then(function(content){
            outputLocation(strings.closedcontent.locations[0].times.currently_open)
        });

        function currentlyOpenOutput(content){
            $("#oh-todays-hours").text(content);
        }
    },

    /**
     *  ## Show Opening Hours
     *  Returns opening hours for this week
     *
     *  @private
     *  @param {Object} API data from openingHours() 
     *  @returns {String} Next day and time when the library is set to open. 
     */
    showOpeningHours: function(data){
        var weeks = data.weeks;
        var language = OpeningHours.language;
        var strings = OpeningHours.strings;

        for (var w in weeks){
            var currentDay,
                week;
            currentDay = moment().startOf("day");
            
            week = $("<ul>").addClass("oh-week");
            
            // Loop through the days of the week
            for (var d = 0; d < weeks[w].length; d++){
                var day;
                day = $("<li>").addClass("oh-day")
                
                // If it is the current day, add current-day attribute.
                if(moment(weeks[w][d].date).diff(currentDay, "days") == 0){
                    day.attr("current-day", "");
                }
                
                // Create day element & add the weekday to it
                day.append($("<span>")
                    .addClass("oh-day-label")
                    .text(strings.weekdays[weeks[w][d].day][language].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
return letter.toUpperCase();
})));
                
                var hours = $("<span>");
                hours.addClass("oh-day-hours");
                if(weeks[w][d].status === "open"){
                    hours.attr("data-state", "open");
                    hours.html('<span class="oh-opening">'+weeks[w][d].openingTime+'</span> - <span class="oh-closing">'+weeks[w][d].closingTime+'</span>');
                } else {
                    hours.attr("data-state", "closed");
                    hours.html(strings.closed[language].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
return letter.toUpperCase();
}));
                } 
                day.append(hours);
                week.append(day);
            }
            $(".oh-week").replaceWith(week);
            break;
        }
    },



    /**
     *  ## Countdown
     *  Next day and time when the library is set to open.
     *
     *  @private
     *  @param {Object} API data from openingHours() 
     *  @returns {Void} 
     */
    showCountdown: function(data){
        var language = OpeningHours.language;
        var strings = OpeningHours.strings;
        var openingNext = {};
        var weeks = data.weeks;

        function calculateTime() {
            // Loop through the weeks
            week:
            for (var w in weeks){
                var day, now, currentDay;

                // Loop through the days of the week
                for (var d = 0; d < weeks[w].length; d++){    
                    openingTime = moment(weeks[w][d].date+" "+weeks[w][d].openingTime, "YYYY-MM-DD HH:m");
                    closingTime = moment(weeks[w][d].date+" "+weeks[w][d].closingTime, "YYYY-MM-DD HH:m");

                    now = moment();
                    currentDay = moment().startOf("day");

                    // If the current working day is going to open
                    if(weeks[w][d].status == "open"){
                        openingNext.day = weeks[w][d].day;
                        openingNext.openingTime = weeks[w][d].openingTime;
                        openingNext.closingTime = weeks[w][d].closingTime;
                        openingNext.date = weeks[w][d].date;

                        // If we are currently open, print out the time to closing
                        if((openingTime.diff(now, "seconds") <= 0 && closingTime.diff(now, "seconds") > 0)){

                            // If we are closing in 1 minute or less show relative time with singular suffix
                            if(closingTime.diff(now, "minutes") <= 1){
                                countdownOutput(strings.openRelative[language] + closingTime.diff(now, "minutes") + strings.time.minutes.singular[language] +  strings.openRelativeSuffix[language]);
                                break week;

                            // If it's 60 minutes or less show relative time.
                            } else if(closingTime.diff(now, "minutes") < 60){
                                countdownOutput(strings.openRelative[language] + closingTime.diff(now, "minutes") + strings.time.minutes.plural[language] +  strings.openRelativeSuffix[language]);
                                break week;

                            // Otherwise show absolute time.
                            } else {
                                countdownOutput(strings.openAbsolute[language] + openingNext.closingTime + " " + strings.today[language]+".");
                                break week;
                            }     

                        // Is the date in the future?
                        } else if (openingTime.isAfter(now)){

                            // Is it the same date?
                            if (moment(weeks[w][d].date).diff(currentDay, "days") == 0){

                                // If it's 1 minute or less left, change to singular suffix
                                if(openingTime.diff(now, "minutes") <= 1){
                                    countdownOutput(strings.closedRelative[language]+openingTime.diff(now, "minutes")+strings.time.minutes.singular[language]+".");
                                    break week;

                                // If it's 60 minutes or less show relative time.
                                } else if(openingTime.diff(now, "minutes") < 60){
                                    countdownOutput(strings.closedRelative[language]+openingTime.diff(now, "minutes")+strings.time.minutes.plural[language]+".");
                                    break week;

                                // Otherwise show absolute time.
                                } else {
                                    countdownOutput(strings.closedAbsolute[language]+" "+strings.today[language]+" "+strings.at[language]+openingNext.openingTime+".");
                                    break week;
                                } 

                            // Is it tomorrow?
                            } else if(moment(weeks[w][d].date).diff(currentDay, "days") == 1){
                                countdownOutput(strings.closedAbsolute[language]+strings.weekdays.tomorrow[language]+strings.at[language]+openingNext.openingTime+".");
                                break week;

                            // Is it further in the future?
                            } else if(moment(weeks[w][d].date).diff(currentDay, "days") >= 2){
                                countdownOutput(strings.closedAbsolute[language]+strings.on[language]+strings.weekdays[openingNext.day][language]+strings.at[language]+openingNext.openingTime+".");
                                break week;
                            }
                        }
                    }
                }

            }
        }
        
        // Run the calculations once.
        calculateTime();
        
        // Then run the calculation once every minute.
        setInterval(calculateTime, 60 * 1000);
        
        /**
         *  ## countdownOutput
         *  Print out the output for countDown.
         *
         *  @private
         *  @param {Void}
         */
        function countdownOutput(content){
            $(".oh-countdown").text(content);
        }
    },

    /**
     *  ## Get Data
     *  Returns opening hours a specified amount of weeks forward
     *
     *  @private
     *  @param {Number} weeks 
     */
    getData: function(weeks, callback, callbackTwo){

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
                    weekday = getWeekday(d);
                    response.weeks[weekNumber][d] = {};
                    response.weeks[weekNumber][d].status = data[i][weekday].times.status;
                    response.weeks[weekNumber][d].day = weekday;
                    response.weeks[weekNumber][d].date = data[i][weekday].date;

                    // If it's open, write out the times it is open.
                    if(data[i][weekday].times.status == "open"){
                        momentObjectOpening = moment(data[i][weekday].times.hours[0].from, "ha");
                        momentObjectClosing = moment(data[i][weekday].times.hours[0].to, "ha");
                        response.weeks[weekNumber][d].openingTime = momentObjectOpening.format("HH:mm");
                        response.weeks[weekNumber][d].closingTime = momentObjectClosing.format("HH:mm");

                    // If it's closed, see if there is a note on why it's closed.
                    } else if (response.weeks[weekNumber][d].status == "closed" && typeof data[i][weekday].times.note != 'undefined') {
                        response.weeks[weekNumber][d].note = data[i][weekday].times.note;
                    }
                }
            }
            callback(response);
            callbackTwo(response);
        });

        /**
         *  ## Get Weekday
         *  Translates the position in the array to the name of the weekday.
         *
         *  @private
         *  @param {Number} Weekday number
         *  @returns {String} Weekday
         */
        function getWeekday(weekdayNumber){
            var day;
            switch (weekdayNumber) {
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
    },

    /**
     *  ## Strings
     *  List of translations for all strings used in the script.
     *
     *  @private
     */
    strings: {
        openRelative: {
            sv: "Vi har öppet i ",
            en: "We are open another "
        },
        openRelativeSuffix: {
            sv: " till.",
            en: "."
        },
        closedRelative: {
            sv: "Vi har stängt och öppnar igen om ",
            en: "We are currently closed and are opening again in "
        },
        openAbsolute: {
            sv: "Vi har öppet fram till klockan ",
            en: "We are open until "
        },
        closedAbsolute: {
            sv: "Vi har stängt och öppnar igen ",
            en: "We are currently closed and are opening again "
        },
        open: {
            sv: "öppet",
            en: "open"
        },
        closed: {
            sv: "stängt",
            en: "closed"
        },
        today: {
            sv: "i dag",
            en: "today"
        },
        time: {
            minutes: {
                singular: {
                    sv: " minut",
                    en: " minute",
                },
                plural: {
                    sv: " minuter",
                    en: " minutes",
                } 
            },
            hours: {
                singular: {
                    sv: " timme",
                    en: " hour",
                },
                plural: {
                    sv: " timmar",
                    en: " hours",
                }
            },
            days: {
                singular: {
                    sv: " dag",
                    en: " day",
                },
                plural: {
                    sv: " dagar",
                    en: " days",
                }
            },
            week: {
                singular: {
                    sv: "vecka",
                    en: "week",
                },
                plural: {
                    sv: "veckor",
                    en: "weeks",
                }
            }  
        },
        weekdays: {
            Monday: {
                sv: "måndag",
                en: "Monday"
            },
            Tuesday: {
                sv: "tisdag",
                en: "Tuesday"
            },
            Wednesday: {
                sv: "onsdag",
                en: "Wednesday"
            },
            Thursday: {
                sv: "torsdag",
                en: "Thursday"
            },
            Friday: {
                sv: "fredag",
                en: "Friday"
            },
            Saturday: {
                sv: "lördag",
                en: "Saturday"
            },
            Sunday: {
                sv: "söndag",
                en: "Sunday"
            },
            tomorrow: {
                sv: "i morgon",
                en: "tomorrow"
            }
        },
        at: {
            sv: " klockan ",
            en: " at "
        },
        on: {
            sv: " på ",
            en: "on "
        },
        and: {
            sv: " och ",
            en: " and "
        }
    }
};