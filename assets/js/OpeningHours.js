/* exported OpeningHours */
/* eslint-env jquery */
/* global $, jQuery, moment */

/**
 *  ## OpeningHours
 *  Opening Hours script for Jönköping University Library
 *
 *  @author Gustav Lindqvist (gustav.lindqvist@ju.se)
 *  Use by including this file and then initializing with 'OpeningHours.initialize(language)' where language is a string containing 'sv' for swedish or 'en' for english.
 */

let OpeningHours = (() => {
    let LANGUAGE = '',
        publicFunctions = {},
        IS_INITIALIZED = false;

    /**
     *  ## Strings
     *  List of translations for all strings used in the script.
     *
     *  @private
     */
    const strings = {
        openRelative: {
            sv: 'Vi har öppet i ',
            en: 'We are open another '
        },
        openRelativeSuffix: {
            sv: ' till.',
            en: '.'
        },
        closedRelative: {
            sv: 'Vi har stängt och öppnar om ',
            en: 'We are currently closed and are opening in '
        },
        openAbsolute: {
            sv: 'Vi har öppet till klockan ',
            en: 'We are open until '
        },
        closedAbsolute: {
            sv: 'Vi har stängt och öppnar ',
            en: 'We are currently closed and are opening '
        },
        open: {
            sv: 'öppet',
            en: 'open'
        },
        closed: {
            sv: 'stängt',
            en: 'closed'
        },
        today: {
            sv: 'i dag',
            en: 'today'
        },
        lessThanOne: {
            sv: ' mindre än en',
            en: ' less than one'
        },
        time: {
            minutes: {
                singular: {
                    sv: '&nbsp;minut',
                    en: '&nbsp;minute'
                },
                plural: {
                    sv: '&nbsp;minuter',
                    en: '&nbsp;minutes'
                }
            },
            hours: {
                singular: {
                    sv: '&nbsp;timme',
                    en: '&nbsp;hour'
                },
                plural: {
                    sv: '&nbsp;timmar',
                    en: '&nbsp;hours'
                }
            },
            days: {
                singular: {
                    sv: '&nbsp;dag',
                    en: '&nbsp;day'
                },
                plural: {
                    sv: '&nbsp;dagar',
                    en: '&nbsp;days'
                }
            },
            week: {
                singular: {
                    sv: 'vecka',
                    en: 'week'
                },
                plural: {
                    sv: 'veckor',
                    en: 'weeks'
                }
            }
        },
        weekdays: {
            Monday: {
                sv: 'måndag',
                en: 'Monday'
            },
            Tuesday: {
                sv: 'tisdag',
                en: 'Tuesday'
            },
            Wednesday: {
                sv: 'onsdag',
                en: 'Wednesday'
            },
            Thursday: {
                sv: 'torsdag',
                en: 'Thursday'
            },
            Friday: {
                sv: 'fredag',
                en: 'Friday'
            },
            Saturday: {
                sv: 'lördag',
                en: 'Saturday'
            },
            Sunday: {
                sv: 'söndag',
                en: 'Sunday'
            },
            tomorrow: {
                sv: 'i morgon',
                en: 'tomorrow'
            }
        },
        at: {
            sv: ' klockan ',
            en: ' at '
        },
        on: {
            sv: ' på ',
            en: 'on '
        },
        and: {
            sv: ' och ',
            en: ' and '
        },
        goTo: {
            sv: 'Gå till',
            en: 'Go to'
        }
    };

    /**
     * ## Config
     * Contains the configuration variables neccesary to run the script.
     */
    publicFunctions.config = {
        iid: '3237',
        rootUrl: 'https://julia.library.ju.se/openinghours/',
        calendar: {
            template: '<div class="oh-cal-controls">\n' +
                      '    <div class="oh-cal-prev">&lsaquo;</div>\n' +
                      '    <div class="oh-cal-next">&rsaquo;</div>\n' +
                      '    <div class="oh-cal-current-month"><%= month %></div>\n' +
                      '</div>\n' +
                      '<div class="oh-cal-grid">\n' +
                      '    <div class="oh-cal-header"><div class="oh-week-number"></div>\n' +
                      '    <% _.each(daysOfTheWeek, function(day) { %>\n' +
                      '        <div class="oh-cal-header-day"><%= day %></div>\n' +
                      '    <% }); %>\n' +
                      '    </div>\n' +
                      '    <div class="oh-cal-content">\n' +
                      '    <% _.each(days, function(day) { %>\n' +
                      '        <% if (day.classes.indexOf("calendar-dow-1") > -1) { %>\n' +
                      '        <div class="oh-cal-week">\n' +
                      '            <div class="oh-week-number"><%= day.date.format("W") %></div>\n' +
                      '            <% } %>\n' +
                      '            <div class="<%= day.classes %> <% for (let event in day.events) { %><%= day.events[event].status.check %><% } %>">\n' +
                      '                <div class="oh-cal-day-number"><%= day.day %></div>\n' +
                      '                    <% for (let event in day.events) { %>\n' +
                      '                    <div class="oh-cal-hours">\n' +
                      '                        <% if (day.events[event].status.check === "open") { %>\n' +
                      '                            <span><%= day.events[event].opening %></span>\n' +
                      '                            <span><%= day.events[event].closing %></span>\n' +
                      '                        <% } else {%>\n' +
                      '                            <%= day.events[event].status.output %>\n' +
                      '                        <% } %>\n' +
                      '                    </div>\n' +
                      '                    <% } %>\n' +
                      '                <% for (let event in day.events) { if(day.events[event].note !== "") { %><div class="oh-day-note"><%= day.events[event].note %></div><% } } %>\n' +
                      '            </div>\n' +
                      '        <% if (day.classes.indexOf("calendar-dow-0") > -1) { %>\n' +
                      '        </div>\n' +
                      '        <% } %>\n' +
                      '    <% }); %>\n' +
                      '    </div>\n' +
                      '</div>'
        }
    };

    /**
     *  ## Show Opening Hours
     *  Returns opening hours for this week
     *
     *  @private
     *  @param {Object} data API data from getData()
     *  @returns {String} Next day and time when the library is set to open.
     */
    let showWeek = (data) => {
        'use strict';
        let weeks = data.weeks;
        let week;

        for (let w = 0; w < 1; w += 1) {

            let currentDay = moment().startOf('day');
            week = $('<ul>').addClass('oh-week');

            // Loop through the days of the week
            for (let d = 0; d < weeks[w].days.length; d += 1) {
                let day = $('<li>').addClass('oh-day');

                // If it is the current day, add current-day attribute.
                if (moment(weeks[w].days[d].date).diff(currentDay, 'days') === 0) {
                    day.attr('current-day', '');
                }
                // Create day element & add the weekday to it
                let label = $('<span>')
                    .addClass('oh-day-label')
                    .text(strings.weekdays[weeks[w].days[d].day][LANGUAGE].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, (letter) => {
                        return letter.toUpperCase();
                    }));

                // Add sign showing theres an exception with a note
                if (weeks[w].days[d].note) {
                    label.html(label.html() + '<span class="oh-note">*</span>');
                }

                // Show the opening/closed message
                let hours = $('<span>');
                hours.addClass('oh-day-hours');
                if (weeks[w].days[d].status === 'open') {
                    hours.attr('data-state', 'open');
                    hours.html('<span class="oh-opening">' + weeks[w].days[d].openingTime + '</span> - <span class="oh-closing">' + weeks[w].days[d].closingTime + '</span>');
                } else {
                    hours.attr('data-state', 'closed');
                    hours.html(strings.closed[LANGUAGE].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, (letter) => {
                        return letter.toUpperCase();
                    }));
                }
                day.append(label);
                day.append(hours);

                // Add note if there is one
                if (weeks[w].days[d].note) {
                    let note = $('<span>');
                    note.attr('class', 'oh-day-note');
                    note.text(weeks[w].days[d].note[LANGUAGE]);
                    day.append(note);
                }
                week.append(day);
            }
        }
        $('.oh-week').replaceWith(week);
    };

    /**
     *  ## Show Monthly Hours
     *  Returns opening hours for 3 months
     *
     *  @private
     *  @param {Object} data API data from getData()
     */
    let showMonth = (data) => {
        'use strict';
        let template = publicFunctions.config.calendar.template;

        // Only run if a monthly calendar is present.
        if ($('#oh-month').length) {

            // Load dependencies
            $.when(
                $.getScript(publicFunctions.config.rootUrl + 'assets/js/underscore-min.js'),
                $.getScript(publicFunctions.config.rootUrl + 'assets/js/clndr.min.js')

                // Run function when dependencies are loaded
            ).done(() => {
                /**
                 *  ## Days of the Week
                 *  Return the abbreviations of the days of the week according to language
                 *
                 *  @private
                 *  @param {String} language
                 *  @returns {Array} Weekdays
                 *
                 */
                let daysOfTheWeek = (language) => {
                    if (language === 'sv') {
                        return ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];
                    } else {
                        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    }
                };


                /**
                 ## Time to percentage
                 *  Transform the weekly data from API into event data for the calendar
                 *
                 * @param date
                 * @param opening
                 * @param closing
                 * @returns {Object} {{duration: number, starting: number}}
                 */

                let timeToPercentage = (date, opening, closing) => {
                    moment(date + ' ' + closing).diff(moment(date + ' ' + opening), 'hours', true);
                    let duration = (moment(date + ' ' + closing).diff(moment(date + ' ' + opening), 'hours', true) / 12) * 100,
                        starting = (moment(date + ' ' + opening).diff(moment(date + ' 08:00'), 'hours', true) / 12) * 100;
                    return {
                        duration: duration,
                        starting: starting
                    };
                };

                /**
                 *  ## Weeks to Events
                 *  Transform the weekly data from API into event data for the calendar
                 *
                 *  @private
                 *  @param {Object} weeks Weekly Data
                 *  @returns {Array} Events
                 */

                let weeksToEvents = (weeks) => {
                    let events = [];
                    for (let w in weeks) {
                        if (weeks.hasOwnProperty(w)) {
                            for (let d in weeks[w].days) {
                                if (weeks[w].days.hasOwnProperty(d)) {
                                    let status = weeks[w].days[d].status;
                                    if (weeks[w].days[d].status === 'closed' && LANGUAGE === 'sv') {
                                        if (weeks[w].days.hasOwnProperty(d)) {
                                            status = 'stängt';
                                        }
                                    } else if (weeks[w].days[d].status === 'open' && LANGUAGE === 'sv') {
                                        status = 'öppet';
                                    }
                                    let note = '';
                                    if (typeof weeks[w].days[d].note !== 'undefined') {
                                        note = weeks[w].days[d].note[LANGUAGE];
                                    }
                                    events.push({
                                        date: weeks[w].days[d].date,
                                        status: {
                                            check: weeks[w].days[d].status,
                                            output: status
                                        },
                                        opening: weeks[w].days[d].openingTime,
                                        closing: weeks[w].days[d].closingTime,
                                        note: note,
                                        overlay: timeToPercentage(weeks[w].days[d].date,
                                            weeks[w].days[d].openingTime,
                                            weeks[w].days[d].closingTime)
                                    });
                                }
                            }
                        }
                    }
                    return events;
                };

                let events = weeksToEvents(data.weeks);

                // Initialize the calendar widget
                $('#oh-month').clndr({
                    template: template,
                    weekOffset: 1,
                    daysOfTheWeek: daysOfTheWeek(LANGUAGE),
                    constraints: {
                        startDate: events[0].date,
                        endDate: moment().add(3, 'M').endOf('month').format('YYYY-MM-DD')
                    },
                    targets: {
                        nextButton: 'oh-cal-next',
                        previousButton: 'oh-cal-prev',
                        todayButton: 'oh-cal-today',
                        day: 'day',
                        empty: 'empty'
                    },
                    events: events,
                    extras: {
                        today: strings.goTo[LANGUAGE] + ' ' + strings.today[LANGUAGE]
                    }

                });

            });
        }
    };

    /**
     *  ## Countdown
     *  Next day and time when the library is set to open.
     *
     *  @private
     *  @param {Object} data API data from getData()
     */
    let showCountdown = (data) => {
        'use strict';
        let openingNext = {},
            weeks = data.weeks;

        let calculateTime = () => {
            /**
             *  ## countdownOutput
             *  Print out the output for countDown.
             *
             *  @private
             */
            let countdownOutput = (content) => {
                $('.oh-countdown').html(content);
            };

            // Loop through the weeks
            week:
            for (let w = 0; w < weeks.length; w += 1) {
                let day, now, currentDay;
                // Loop through the days of the week
                for (let d = 0; d < weeks[w].days.length; d += 1) {
                    let openingTime = moment(weeks[w].days[d].date + ' ' + weeks[w].days[d].openingTime, 'YYYY-MM-DD HH:m'),
                        closingTime = moment(weeks[w].days[d].date + ' ' + weeks[w].days[d].closingTime, 'YYYY-MM-DD HH:m');

                    now = moment();
                    currentDay = moment().startOf('day');

                    // If the current working day is going to open
                    if (weeks[w].days[d].status === 'open') {
                        openingNext.day = weeks[w].days[d].day;
                        openingNext.openingTime = weeks[w].days[d].openingTime;
                        openingNext.closingTime = weeks[w].days[d].closingTime;
                        openingNext.date = weeks[w].days[d].date;

                        // If we are currently open, print out the time to closing
                        if ((openingTime.diff(now, 'seconds') <= 0 && closingTime.diff(now, 'seconds') > 0)) {

                            // If we are closing in 1 minute or less show relative time with singular suffix
                            if (closingTime.diff(now, 'minutes') <= 1) {
                                countdownOutput(strings.openRelative[LANGUAGE] + closingTime.diff(now, 'minutes') + strings.time.minutes.singular[LANGUAGE] +  strings.openRelativeSuffix[LANGUAGE]);
                                break week;

                                // If it's 60 minutes or less show relative time.
                            } else if (closingTime.diff(now, 'minutes') < 60) {
                                countdownOutput(strings.openRelative[LANGUAGE] + closingTime.diff(now, 'minutes') + strings.time.minutes.plural[LANGUAGE] +  strings.openRelativeSuffix[LANGUAGE]);
                                break week;

                                // Otherwise show absolute time.
                            } else {
                                countdownOutput(strings.openAbsolute[LANGUAGE] + openingNext.closingTime + ' ' + strings.today[LANGUAGE] + '.');
                                break week;
                            }

                            // Is the date in the future?
                        } else if (openingTime.isAfter(now)) {

                            // Is it the same date?
                            if (moment(weeks[w].days[d].date).diff(currentDay, 'days') === 0) {

                                // If it's 1 minute or less left, change to singular suffix
                                if (openingTime.diff(now, 'minutes') <= 1) {
                                    countdownOutput(strings.closedRelative[LANGUAGE] + strings.lessThanOne[LANGUAGE] + strings.time.minutes.singular[LANGUAGE] + '.');
                                    break week;

                                    // If it's 60 minutes or less show relative time.
                                } else if (openingTime.diff(now, 'minutes') < 60) {
                                    countdownOutput(strings.closedRelative[LANGUAGE] + openingTime.diff(now, 'minutes') + strings.time.minutes.plural[LANGUAGE] + '.');
                                    break week;

                                    // Otherwise show absolute time.
                                } else {
                                    countdownOutput(strings.closedAbsolute[LANGUAGE] + ' ' + strings.today[LANGUAGE] + ' ' + strings.at[LANGUAGE] + openingNext.openingTime + '.');
                                    break week;
                                }

                                // Is it tomorrow?
                            } else if (moment(weeks[w].days[d].date).diff(currentDay, 'days') === 1) {
                                countdownOutput(strings.closedAbsolute[LANGUAGE] + strings.weekdays.tomorrow[LANGUAGE] + strings.at[LANGUAGE] + openingNext.openingTime + '.');
                                break week;

                                // Is it further in the future?
                            } else if (moment(weeks[w].days[d].date).diff(currentDay, 'days') >= 2) {
                                countdownOutput(strings.closedAbsolute[LANGUAGE] + strings.on[LANGUAGE] + strings.weekdays[openingNext.day][LANGUAGE] + strings.at[LANGUAGE] + openingNext.openingTime + '.');
                                break week;
                            }
                        }
                    }
                }
            }
        };

        // Run the calculations once.
        calculateTime();

        // Then run the calculation once every 30 seconds.
        setInterval(calculateTime, 30 * 1000);
    };

    /**
     *  ## Get Data
     *  Returns opening hours a specified amount of weeks forward
     *
     *  @private
     */
    let getData = (countdownCallback, weekCallback, monthCallback) => {
        'use strict';
        let weeks = 20,
            iid = publicFunctions.config.iid,
            cachedData = publicFunctions.Cache.load();

        /**
         *  ## Get Weekday
         *  Translates the position in the array to the name of the weekday.
         *
         *  @private
         *  @param {Number} weekdayNumber
         *  @returns {String} Weekday
         */
        let getWeekday = (weekdayNumber) => {
            let day;
            switch (weekdayNumber) {
            case 0:
                day = 'Monday';
                break;
            case 1:
                day = 'Tuesday';
                break;
            case 2:
                day = 'Wednesday';
                break;
            case 3:
                day = 'Thursday';
                break;
            case 4:
                day = 'Friday';
                break;
            case 5:
                day = 'Saturday';
                break;
            case  6:
                day = 'Sunday';
                break;
            }
            return day;
        };

        let getData = () => {
            // Grab data from the API with JSONP.
            $.ajax({
                url: 'https://api3-eu.libcal.com/api_hours_grid.php?iid=' + iid + '&format=json&weeks=' + weeks + '&callback=response',
                jsonpCallback: 'response',
                dataType: 'jsonp'

                // When data is grabbed from API, format it into our own JSON-format.
            }).then((content) => {
                let data = content.locations[0].weeks,
                    response = {};

                // Loop through all the weeks.
                response.weeks = [];
                for (let w = 0; w < data.length; w += 1) {
                    let momentObject,
                        momentObjectClosing,
                        momentObjectOpening;

                    // Create a moment object of the date of the day.
                    momentObject = moment(data[w].Monday.date, 'YYYY-MM-DD');
                    let currentWeek = {};

                    currentWeek.weekNumber = String(momentObject.format('W'));
                    currentWeek.days = [];

                    // Loop through the days of the week
                    for (let d = 0; d < 7; d += 1) {
                        let weekday = getWeekday(d);
                        currentWeek.days[d] = {};
                        currentWeek.days[d].status = data[w][weekday].times.status;
                        currentWeek.days[d].day = weekday;
                        currentWeek.days[d].date = data[w][weekday].date;

                        // If there is a note add that to object
                        if (data[w][weekday].times.note) {
                            currentWeek.days[d].note = {};
                            let note = data[w][weekday].times.note.split('/');
                            currentWeek.days[d].note.sv = note[0];
                            currentWeek.days[d].note.en = note[1];
                        }

                        // If it's open, write out the times it is open.
                        if (data[w][weekday].times.status === 'open') {
                            momentObjectOpening = moment(data[w][weekday].times.hours[0].from, 'ha');
                            momentObjectClosing = moment(data[w][weekday].times.hours[0].to, 'ha');
                            currentWeek.days[d].openingTime = momentObjectOpening.format('HH:mm');
                            currentWeek.days[d].closingTime = momentObjectClosing.format('HH:mm');
                        }
                    }
                    response.weeks.push(currentWeek);
                }
                publicFunctions.Cache.clear(); // Clear the cache before saving
                publicFunctions.Cache.save(response); // Save data to cache

                // Call callback functions after DOM has loaded.
                $(document).ready(() => {
                    countdownCallback(response);
                    weekCallback(response);
                    monthCallback(response);
                });
            });
        };

        // Check if data is stored in session.
        if (cachedData) {
            window.console.log('OpeningHours: Loaded from cache');

            // Call callback functions after DOM has loaded.
            $(document).ready(() => {
                countdownCallback(cachedData);
                weekCallback(cachedData);
                monthCallback(cachedData);
            });
        } else {
            window.console.log('OpeningHours: Loaded from API');
            getData();
        }

    };


    /**
     *  ## Set language
     *  Set language of Moment.js and OpeningHours
     *
     *  @param {String} lang
     *  @private
     */
    let setLanguage = (lang) => {
        LANGUAGE = lang;
        'use strict';
        if (LANGUAGE === 'sv') {
            moment.locale('sv', {
                months: [
                    'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli',
                    'augusti', 'september', 'oktober', 'november', 'december'
                ],
                weekdays: [
                    'söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'
                ],
                weekdaysShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör']
            });
            return LANGUAGE;
        } else {
            return LANGUAGE;
        }
    };

    /**
     * ## Initialize
     * Initializes the Opening Hours script.
     *
     * @public
     * @param {String} lang, written out as either sv (swedish) or en (english).
     */
    publicFunctions.initialize = (lang) => {
        if (IS_INITIALIZED) {
            return 'Script is already initialized';
        } else {
            IS_INITIALIZED = true;
        }
        'use strict';
        if (typeof jQuery !== 'undefined') {

            // Load the dependencies
            $('head').append('<link rel="stylesheet" href="' + publicFunctions.config.rootUrl + 'assets/css/OpeningHours.css">');
            $.getScript(publicFunctions.config.rootUrl + '/assets/js/moment.js', () => {

                // Set the language attribute to the specified in the initialize function and the moment instance.
                setLanguage(lang);

                // Get 4 weeks of data from API and then pass it on to showCountdown() and showWeek() and showMonth().
                getData(showCountdown, showWeek, showMonth);

            });
        } else {
            window.console.error('OpeningHours: Dependency missing: jQuery');
        }

    };
    /**
     * ## Cache
     * Object with functions for handling cache in localStorage.
     */
    publicFunctions.Cache = {
        // TODO: Add cross domain support.

        /**
         * # Save
         * Saves data to cache in localstorage with timestamp.
         * @param response
         */
        save: (response) => {
            let timestamp = moment(),
                openingHoursData = {
                    timestamp: timestamp.format(),
                    response: response
                };
            localStorage.setItem('openingHoursData', JSON.stringify(openingHoursData));
        },

        /**
         * ## Load
         * Checks if data is not too old and then loads from cache in localstorage.
         * @returns {Object} data Returns data if it exists in cache and isn't too old.
         */
        load: () => {
            let data = false;

            // Check if object exists in LocalStorage.
            if (localStorage.hasOwnProperty('openingHoursData')) {
                data = JSON.parse(localStorage.getItem('openingHoursData'));
                /**
                 * ## Is not expired?
                 * Checks if the data is older than 24 hours.
                 * @returns {boolean}
                 */
                let isNotExpired = () => {
                    let now = moment(),
                        then = moment(data.timestamp),
                        diff = now.diff(then, 'hours');
                    return (diff <= 2);
                };

                // If data isn't expired, return it.
                if (isNotExpired()) {
                    return data.response;
                }

            } else {
                return data;
            }
        },
        clear: () => {
            localStorage.removeItem('openingHoursData');
            window.console.log('OpeningHours: Cache cleared.');
        }
    };

    return publicFunctions;
})();