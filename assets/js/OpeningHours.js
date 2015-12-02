/**
 *  ## OpeningHours
 *  Opening Hours script for Jönköping University Library
 *  
 *  @author Gustav Lindqvist (gustav.lindqvist@ju.se)
 *  Use by including this file and then initializing with 'OpeningHours.initialize(language)' where language is a string containing 'sv' for swedish or 'en' for english.
 *
 *  jshint browser: true
 *  global $, jQuery, moment
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
        var setLanguage = OpeningHours.setLanguage,
            getData = OpeningHours.getData,
            showCountdown = OpeningHours.showCountdown,
            showWeek = OpeningHours.showWeek,
            showMonth = OpeningHours.showMonth,
            config = OpeningHours.config;

        if (typeof jQuery !== 'undefined') {

            // Load the dependencies
            $('head').append('<link rel="stylesheet" href="'+config.rootUrl+'/assets/css/openingHours.css">');
            $.getScript(config.rootUrl+'/assets/js/moment.js', function() {

                // Set the language attribute to the specified in the initialize function and the moment instance.
                setLanguage(lang);

                // Get 4 weeks of data from API and then pass it on to showCountdown() and showOpeningHours().
                getData(showCountdown, showWeek, showMonth);

            });
        } else {
          console.error('OpeningHours - Dependency missing: jQuery');
        }

    },

    /**
     * ## Config
     * Contains the Instance ID required for the API.
     */
    config: {
        iid: '3237',
        rootUrl: 'https://julius.hj.se/openinghours/',
        calendar: {
            template:  '\
<div class="oh-cal-controls">\
    <div class="oh-cal-prev">&lsaquo;</div>\
    <div class="oh-cal-next">&rsaquo;</div>\
    <div class="oh-cal-current-month"><%= month %></div>\
</div>\
<div class="oh-cal-grid">\
    <div class="oh-cal-header"><div class="oh-week-number"></div>\
    <% _.each(daysOfTheWeek, function(day) { %>\
        <div class="oh-cal-header-day"><%= day %></div>\
    <% }); %>\
    </div>\
    <div class="oh-cal-content">\
    <% _.each(days, function(day) { %>\
        <div class="<%= day.classes %> <% for(var event in day.events) { %><%= day.events[event].status.check %><% } %>">\
            <div class="oh-cal-day-number"><%= day.day %></div>\
                <% for(var event in day.events) { %>\
                <div class="oh-cal-hours">\
                    <% if(day.events[event].status.check == "open"){ %>\
                        <span><%= day.events[event].opening %></span>\
                        <span><%= day.events[event].closing %></span>\
                    <% } else {%>\
                        <%= day.events[event].status.output %>\
                    <% } %>\
                </div>\
                <div class="oh-overlay" style="height: <%= day.events[event].overlay.duration %>%; top: <%= day.events[event].overlay.starting %>%;">\
                    <div class="oh-overlay-content" style="top: -<%= day.events[event].overlay.starting*(100/day.events[event].overlay.duration) %>%;">\
                        <div class="oh-cal-day-number"><%= day.day %></div>\
                        <div class="oh-cal-hours">\
                            <% if(day.events[event].status.check == "open"){ %>\
                                <span><%= day.events[event].opening %></span>\
                                <span><%= day.events[event].closing %></span>\
                            <% } else {%>\
                                <%= day.events[event].status.output %>\
                            <% } %>\
                        </div>\
                    </div>\
                </div>\
                <% } %>\
            <% for(var event in day.events) { if(day.events[event].note != ""){ %><div class="oh-day-note"><%= day.events[event].note %></div><% } } %>\
        </div>\
    <% }); %>\
    </div>\
</div>'
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
    showWeek: function(data){
        var weeks = data.weeks,
            language = OpeningHours.language,
            strings = OpeningHours.strings,
            week;

        for (var w = 0; w < 1; w++){

            var currentDay = moment().startOf("day");
            week = $("<ul>").addClass("oh-week");

            // Loop through the days of the week
            for (var d = 0; d < weeks[w].days.length; d++){
                var day = $("<li>").addClass("oh-day");

                // If it is the current day, add current-day attribute.
                if(moment(weeks[w].days[d].date).diff(currentDay, "days") === 0){
                    day.attr("current-day", "");
                }

                // Create day element & add the weekday to it
                var label = $("<span>")
                   .addClass("oh-day-label")
                   .text(strings.weekdays[weeks[w].days[d].day][language].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
                        return letter.toUpperCase();
                    }));

                // Add sign showing theres an exception with a note
                if(weeks[w].days[d].note){
                    label.html(label.html()+'<span class="oh-note">*</span>');
                }
                
                // Show the opening/closed message
                var hours = $("<span>");
                hours.addClass("oh-day-hours");
                if(weeks[w].days[d].status === "open"){
                    hours.attr("data-state", "open");
                    hours.html('<span class="oh-opening">'+weeks[w].days[d].openingTime+'</span> - <span class="oh-closing">'+weeks[w].days[d].closingTime+'</span>');
                } else {
                    hours.attr("data-state", "closed");
                    hours.html(strings.closed[language].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
                        return letter.toUpperCase();
                    }));
                }
                day.append(label);
                day.append(hours);

                // Add note if there is one
                if(weeks[w].days[d].note){
                    var note = $("<span>");
                    note.attr("class","oh-day-note");
                    note.text(weeks[w].days[d].note[language]);
                    day.append(note);
                }
                week.append(day);
            }
        }
        $('.oh-week').replaceWith(week);
    },

    /**
     *  ## Show Monthly Hours
     *  Returns opening hours for 3 months
     *
     *  @private
     *  @param {Object} API data from openingHours()
     *  @returns {Void} Next day and time when the library is set to open.
     */
    showMonth: function(data){
        var hasMonth = OpeningHours.hasMonth,
            language = OpeningHours.language,
            config = OpeningHours.config,
            strings = OpeningHours.strings,
            template = OpeningHours.config.calendar.template;

        if(hasMonth()){

            // Load dependencies
            $.when(
                $.getScript(config.rootUrl+'assets/js/underscore-min.js'),
                $.getScript(config.rootUrl+'assets/js/clndr.min.js')

            // Run function when dependencies are loaded
            ).done(function(){
                var events = weeksToEvents(data.weeks);

                // Initialize the calendar widget
                $('#oh-month').clndr({
                    template: template,
                    weekOffset: 1,
                    daysOfTheWeek: daysOfTheWeek(language),
                    constraints: {
                        startDate: events[0].date,
                        endDate: moment().add(2, 'M').endOf('month').format('YYYY-MM-DD')
                      },
                    targets: {
                        nextButton: 'oh-cal-next',
                        previousButton: 'oh-cal-prev',
                        todayButton: 'oh-cal-today',
                        day: 'day',
                        empty: 'empty'
                    },
                    clickEvents: {
                        onMonthChange: pointer
                    },
                    events: events,
                    extras: {
                        today: strings.goTo[language]+' '+strings.today[language]
                    }

                });
                pointer();
                setInterval(pointer, 50000);
                /**
                 *  ## Days of the Week
                 *  Return the abbreviations of the days of the week according to language
                 *
                 *  @private
                 *  @param {String} Language
                 *  @returns {Array} Weekdays
                 *
                 */
                function daysOfTheWeek(language){
                    if(language == 'sv') {
                        return ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];
                    } else {
                        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    }
                }
                
                /**
                 *  ## Days of the Week
                 *  Return the abbreviations of the days of the week according to language
                 *
                 *  @private
                 *  @param {String} Language
                 *  @returns {Array} Weekdays
                 *
                 */
                function pointer(){
                    if(moment().isAfter(moment().startOf('day').hour(8).minute(0)) && moment().isBefore(moment().startOf('day').hour(20).minute(0)) && $('.oh-pointer').length == 0){
                        $('.oh-month .open.today').append('<div class="oh-pointer"></div>')
                    } else if(moment().isBefore(moment().startOf('day').hour(8).minute(0)) || moment().isAfter(moment().startOf('day').hour(20).minute(0))){
                        $('.oh-pointer').remove();
                    }
                    $('.oh-pointer').css('top', (moment().diff(moment().startOf('day').hour(8).minute(0), 'hours', true)/12)*100+'%');
                }

                /**
                 *  ## Weeks to Events
                 *  Transform the weekly data from API into event data for the calendar
                 *
                 *  @private
                 *  @param {Object} Weekly Data
                 *  @returns {Array} Events
                 */
                function weeksToEvents(weeks){
                    var events = [];
                    for(var w in weeks){
                        for(var d in weeks[w].days){
                            var status = weeks[w].days[d].status;
                            if(weeks[w].days[d].status == 'closed' && language == 'sv'){
                                status = 'stängt';
                            } else if(weeks[w].days[d].status == 'open' && language == 'sv'){
                                status = 'öppet';
                            }
                            var note = '';
                            if(typeof weeks[w].days[d].note != 'undefined'){
                                note = weeks[w].days[d].note[language];
                            }
                            events.push({
                                date: weeks[w].days[d].date,
                                status: {
                                    check: weeks[w].days[d].status,
                                    output: status,
                                },
                                opening: weeks[w].days[d].openingTime,
                                closing: weeks[w].days[d].closingTime,
                                note: note,
                                overlay: timeToPercentage(weeks[w].days[d].date, weeks[w].days[d].openingTime, weeks[w].days[d].closingTime)
                            });
                        }
                    }
                    return events;

                }
                /**
                 *  ## Time to percentage
                 *  Transform the weekly data from API into event data for the calendar
                 *
                 *  @private
                 *  @param {Object} Weekly Data
                 *  @returns {Array} Events
                 */
                function timeToPercentage(date, opening, closing){
                    moment(date+' '+closing).diff(moment(date+' '+opening), 'hours', true);
                    var duration = (moment(date+' '+closing).diff(moment(date+' '+opening), 'hours', true)/12)*100,
                        starting = (moment(date+' '+opening).diff(moment(date+' 08:00'), 'hours', true)/12)*100;
                    return {
                        duration: duration,
                        starting: starting
                    };
                };
            });
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
        var language = OpeningHours.language,
            strings = OpeningHours.strings,
            openingNext = {},
            weeks = data.weeks;

        function calculateTime() {
            // Loop through the weeks
            week:
            for (var w = 0; w < weeks.length; w++){
                var day, now, currentDay;
                // Loop through the days of the week
                for (var d = 0; d < weeks[w].days.length; d++){
                    var openingTime = moment(weeks[w].days[d].date+" "+weeks[w].days[d].openingTime, "YYYY-MM-DD HH:m"),
                        closingTime = moment(weeks[w].days[d].date+" "+weeks[w].days[d].closingTime, "YYYY-MM-DD HH:m");

                    now = moment();
                    currentDay = moment().startOf("day");

                    // If the current working day is going to open
                    if(weeks[w].days[d].status == "open"){
                        openingNext.day = weeks[w].days[d].day;
                        openingNext.openingTime = weeks[w].days[d].openingTime;
                        openingNext.closingTime = weeks[w].days[d].closingTime;
                        openingNext.date = weeks[w].days[d].date;

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
                            if (moment(weeks[w].days[d].date).diff(currentDay, "days") === 0){

                                // If it's 1 minute or less left, change to singular suffix
                                if(openingTime.diff(now, "minutes") <= 1){
                                    countdownOutput(strings.closedRelative[language]+strings.lessThanOne[language]+strings.time.minutes.singular[language]+".");
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
                            } else if(moment(weeks[w].days[d].date).diff(currentDay, "days") == 1){
                                countdownOutput(strings.closedAbsolute[language]+strings.weekdays.tomorrow[language]+strings.at[language]+openingNext.openingTime+".");
                                break week;

                                // Is it further in the future?
                            } else if(moment(weeks[w].days[d].date).diff(currentDay, "days") >= 2){
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
        setInterval(calculateTime, 30 * 1000);

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
     */
    getData: function(countdownCallback, weekCallback, monthCallback){
        var weeks,
            hasMonth = OpeningHours.hasMonth,
            iid = OpeningHours.config.iid;

        if(hasMonth()){
            weeks = 14;
        } else {
            weeks = 4;
        }

        // Grab data from the API with JSONP
        $.ajax({
            //url: 'http://localhost:3000/assets/js/libcal.json',
            url: 'https://api3.libcal.com/api_hours_grid.php?iid='+iid+'&format=json&weeks='+weeks+'&callback=response',
            jsonpCallback: "response",
            dataType: "jsonp",

            // When data is grabbed from API, format it into our own JSON-format
        }).then(function(content){
            var data = content.locations[0].weeks,
                response = {};

            // Loop through all the weeks.
            response.weeks = [];
            for(var w = 0; w < data.length; w++){
                var momentObject,
                    momentObjectClosing,
                    momentObjectOpening;

                // Create a moment object of the date of the day.
                momentObject = moment(data[w].Monday.date, "YYYY-MM-DD");
                var weekNumber = String(momentObject.format("W")),
                    weekDay,
                    currentWeek = {};

                currentWeek.weekNumber = weekNumber;
                currentWeek.days = [];

                // Loop through the days of the week
                for(var d = 0; d < 7; d++){
                    var weekday = getWeekday(d);
                    currentWeek.days[d] = {};
                    currentWeek.days[d].status = data[w][weekday].times.status;
                    currentWeek.days[d].day = weekday;
                    currentWeek.days[d].date = data[w][weekday].date;

                    // If there is a note add that to object
                    if(data[w][weekday].times.note){
                        currentWeek.days[d].note = {};
                        var note = data[w][weekday].times.note.split('/');
                        currentWeek.days[d].note.sv = note[0];
                        currentWeek.days[d].note.en = note[1];
                    }

                    // If it's open, write out the times it is open.
                    if(data[w][weekday].times.status == "open"){
                        momentObjectOpening = moment(data[w][weekday].times.hours[0].from, "ha");
                        momentObjectClosing = moment(data[w][weekday].times.hours[0].to, "ha");
                        currentWeek.days[d].openingTime = momentObjectOpening.format("HH:mm");
                        currentWeek.days[d].closingTime = momentObjectClosing.format("HH:mm");
                    }
                }
                response.weeks.push(currentWeek);
            }
            countdownCallback(response);
            weekCallback(response);
            monthCallback(response);
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
            sv: "Vi har stängt och öppnar om ",
            en: "We are currently closed and are opening in "
        },
        openAbsolute: {
            sv: "Vi har öppet till klockan ",
            en: "We are open until "
        },
        closedAbsolute: {
            sv: "Vi har stängt och öppnar ",
            en: "We are currently closed and are opening "
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
        lessThanOne: {
            sv: " mindre än en",
            en: " less than one"
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
        },
        goTo: {
            sv: "Gå till",
            en: "Go to"
        }
    },

    /**
     *  ## Has month?
     *  Check if a monthly calendar is present on the page
     *
     *  @private
     */
    hasMonth: function(){
        if($('#oh-month').length > 0){
            return true;
        } else {
            return false;
        }
    },

    /**
     *  ## Set language
     *  Set language of Moment.js and OpeningHours
     *
     *  @param {String} Language
     *  @private
     */
    setLanguage: function(language){
        OpeningHours.language = language;
        if(language == 'sv'){
            moment.locale('sv', {
                months : [
                    "januari", "februari", "mars", "april", "maj", "juni", "juli",
                    "augusti", "september", "oktober", "november", "december"
                ],
                weekdays : [
                    "söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"
                ],
                weekdaysShort : ["sön", "mån", "tis", "ons", "tor", "fre", "lör"]
            });
        } else {

        }
    },
};
