/* exported OpeningHours */

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function () {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof (dowOffset) == 'number' ? dowOffset : 1; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() -
                             (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1, 0, 1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
             the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
};
Date.prototype.getWeeksOfMonth = function () {
    var firstDay = new Date(this.setDate(1)).getDay();
    var lastDay = new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();

    var used = firstDay + (firstDay===0?6:-1) + lastDay;
    return Math.ceil( used / 7);
};

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 *  ## OpeningHours
 *  Opening Hours script for Jönköping University Library
 *
 *  @author Gustav Lindqvist (gustav.lindqvist@ju.se)
 *  Use by including this file and then initializing with 'OpeningHours.initialize({"lang": LANGUAGE_SHORTCODE})' where language is a string containing 'sv' for swedish or 'en' for english.
 */
var OpeningHours = (function () {
    var LANGUAGE = 'en';
    var publicFunctions = {};
    var isInitialized = false;
    var libCalInstanceId = undefined;
    var STRINGS = {
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
        keyboardShortcuts: {
            sv: 'tangentbordsgenvägar',
            en: 'Keyboard shortcuts'
        },
        keyboardShortcutsAre: {
            sv: 'Tangentbordsgenvägarna är följande:',
            en: 'The Keyboard shortcuts are the following:'
        },
        closeDialog: {
            sv: 'Stäng dialogrutan',
            en: 'Close dialog'
        },
        moveToToday: {
            sv: '<kbd>Hem</kbd> för att gå till idag.',
            en: '<kbd>Home</kbd> to move to today.'
        },
        moveDayToDay: {
            sv: '<kbd>Vänsterpil</kbd> och <kbd>högerpil</kbd> för att gå från dag till dag.',
            en: '<kbd>Left Arrow</kbd> and <kbd>Right Arrow</kbd> to move day to day.'
        },
        moveWeekToWeek: {
            sv: '<kbd>Uppåtpil</kbd> och <kbd>högerpil</kbd> för att gå från vecka till vecka.',
            en: '<kbd>Up Arrow</kbd> and <kbd>Down Arrow</kbd> to move week to week.'
        },
        moveMonthToMonth: {
            sv: '<kbd lang="en">Page Up</kbd> och <kbd lang="en">Page Down</kbd> för att gå från månad till månad.',
            en: '<kbd>Page Up</kbd> and <kbd>Page Up</kbd> to move month to month.'
        },
        nextMonth: {
            sv: 'Visa nästa månad',
            en: 'Show next month'
        },
        previousMonth: {
            sv: 'Visa föregående månad',
            en: 'Show previous month'
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
        calendar: {
            sv: 'Kalender för öppettider',
            en: 'Calendar for opening hours'
        },
        noDefinedOpeningHours: {
            sv: 'Inga öppettider angivna',
            en: 'No defined opening hours'
        },
        calendarNavigation: {
            sv: 'Kalendernavigeringsmeny',
            en: 'Calendar navigation'
        },
        cantSelectDate: {
            sv: 'Kan inte välja det datumet',
            en: `Can't select that date`
        },
        lessThanOne: {
            sv: ' mindre än en',
            en: ' less than one'
        },
        months: {
            sv: 'månader',
            en: 'months'
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
        },
        to: {
            sv: 'till',
            en: 'to'
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
    var showWeek = function (data) {
        const longWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, {weekday: 'long'});
        const numberMonthFormat = new Intl.DateTimeFormat(LANGUAGE, {month: 'numeric'});
        const dateFormat = new Intl.DateTimeFormat('sv');

        var weeks = data.weeks;
        var week;

        for (var w = 0; w < 1; w += 1) {
            var currentDay = new Date()
                .setUTCHours(0, 0, 0, 0);
            week = document.createElement('ul');
            week.classList.add('oh-week');

            // Loop through the days of the week
            for (var d = 0; d < weeks[w].days.length; d += 1) {
                var day = document.createElement('li');
                var indexDate = new Date(weeks[w].days[d].date);
                day.classList.add('oh-day');
                // If it is the current day, add current-day attribute.
                if (indexDate - currentDay === 0) {
                    day.setAttribute('current-day', '');
                }
                // Create day element & add the weekday to it
                var label = document.createElement('span');
                label.classList.add('oh-day-label');
                label.innerText = `${longWeekdayFormat.format(indexDate).capitalizeFirstLetter()} (${indexDate.getDate()}/${numberMonthFormat.format(indexDate)})`;
                label.setAttribute('datetime', indexDate.toISOString());

                // Add note if there is one
                if (weeks[w].days[d].note) {
                    label.classList.add('-note');
                    label.setAttribute('title', weeks[w].days[d].note[LANGUAGE]);
                    label.setAttribute('tabindex', '0');
                }

                // Show the opening/closed message
                var hours = document.createElement('span');
                hours.classList.add('oh-day-hours');
                if (weeks[w].days[d].status === 'open') {
                    hours.setAttribute('data-state', 'open');
                    hours.innerHTML = '<span class="oh-opening">' + weeks[w].days[d].openingTime.replace(/^0+/, '').replace(':00', '') + '</span>–<span class="oh-closing">' + weeks[w].days[d].closingTime.replace(/^0+/, '').replace(':00', '') + '</span>';
                } else {
                    hours.setAttribute('data-state', 'closed');
                    hours.innerHTML = STRINGS.closed[LANGUAGE].toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function (letter) {
                        return letter.toUpperCase();
                    });
                }
                day.append(label);
                day.append(hours);

                week.append(day);
            }
        }
        var weekElements = document.querySelectorAll('.oh-week');
        weekElements.forEach((weekElement) => weekElement.innerHTML = week.innerHTML);
    };

    /**
     *  ## Show Monthly Hours
     *  Returns opening hours for 3 months
     *
     *  @private
     *  @param {Object} data API data from getData()
     */
    var showCalendar = function (data) {

        // https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
        function getMonday (d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }

        if (document.getElementById('oh-calendar')) {

            const now = new Date();
            const weeksToMonthData = function (data) {
                const monthFormat = new Intl.DateTimeFormat(LANGUAGE, {month: 'long'});
                const dateFormat = new Intl.DateTimeFormat('sv');
                const dayFormat = new Intl.DateTimeFormat(LANGUAGE, {weekday: 'long'});
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                let months = [];

                // Make opening hours data fetchable by date string
                const openingHoursData = {};
                data.weeks
                    .map((item) => {
                        return item.days;
                    })
                    .flat(1)
                    .forEach((day) => {
                        openingHoursData[day.date] = {
                            open: undefined,
                            openingTime: (typeof day.openingTime !== 'undefined') ? day.openingTime : undefined,
                            closingTime: (typeof day.closingTime !== 'undefined') ? day.closingTime : undefined,
                            note: (typeof day.note !== 'undefined') ? day.note : undefined
                        };

                        if (day.status === 'open') {
                            openingHoursData[day.date].open = true;
                        } else if (day.status === 'closed') {
                            openingHoursData[day.date].open = false;
                        }
                    });

                // Loop through 3 months
                for (let i = 0; i < 3; i++) {
                    const month = {};

                    const monthNumber = (now.getMonth() + i) > 11 ? now.getMonth() + i - 12 : now.getMonth() + i;
                    const currentYear = (now.getMonth() + i) > 11 ? now.getFullYear() + 1 : now.getFullYear();
                    const firstDayOfCurrentMonth = new Date(currentYear, monthNumber, 1);
                    const firstMonday = getMonday(firstDayOfCurrentMonth);

                    const weeksInMonth = firstDayOfCurrentMonth.getWeeksOfMonth();

                    month.month = firstDayOfCurrentMonth.getMonth();
                    month.name = monthFormat.format(firstDayOfCurrentMonth);
                    month.weeks = [];

                    for (let w = 0; w < weeksInMonth; w++) {
                        const firstDayOfWeek = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + (7 * w));
                        const week = {};
                        week.week_number = firstDayOfWeek.getWeek();
                        week.days = [];

                        for (var d = 0; d < 7; d++) {
                            const day = {};
                            day.date = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + d);

                            day.is_today = (day.date.getTime() === today.getTime());
                            day.is_past = (day.date < today);
                            day.is_in_month = (day.date.getMonth() === firstDayOfCurrentMonth.getMonth());
                            day.date_string = dateFormat.format(day.date);
                            day.open = undefined;
                            day.opening_time = undefined;
                            day.closing_time = undefined;
                            day.note = undefined;

                            if (openingHoursData.hasOwnProperty(day.date_string)) {
                                day.open = openingHoursData[day.date_string].open;
                                day.opening_time = openingHoursData[day.date_string].openingTime;
                                day.closing_time = openingHoursData[day.date_string].closingTime;
                                day.note = (typeof openingHoursData[day.date_string].note !== 'undefined') ? openingHoursData[day.date_string].note[LANGUAGE] : undefined;
                            }

                            week.days.push(day);
                        }
                        month.weeks.push(week);
                    }

                    months.push(month);
                }

                return months;
            };

            const calendarData = weeksToMonthData(data);
            const monthFormat = new Intl.DateTimeFormat(LANGUAGE, {month: 'long'});
            const longWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, {weekday: 'long'});
            const longWeekdayFormatEnglish = new Intl.DateTimeFormat('en', {weekday: 'long'});
            const shortWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, {weekday: 'short'});

            const calendarElement = document.getElementById('oh-calendar');

            const calendarHelpButton = document.createElement('button');
            calendarHelpButton.classList.add('oh-calendar__help-button');
            calendarHelpButton.innerText = STRINGS.keyboardShortcuts[LANGUAGE].capitalizeFirstLetter();

            const calendarHelpDialog = document.createElement('dialog');
            calendarHelpDialog.classList.add('oh-calendar__help-dialog');
            calendarHelpDialog.setAttribute('aria-label', STRINGS.keyboardShortcuts[LANGUAGE].capitalizeFirstLetter());
            calendarHelpDialog.setAttribute('closed', 'true');
            calendarHelpDialog.setAttribute('tabindex', '-1');

            const calendarHelpDialogLead = document.createElement('p');
            calendarHelpDialogLead.innerText = STRINGS.keyboardShortcutsAre[LANGUAGE];

            const calendarHelpDialogShortcutList = document.createElement('ul');

            const calendarHelpDialogShortcutDay = document.createElement('li');
            calendarHelpDialogShortcutDay.innerHTML = STRINGS.moveDayToDay[LANGUAGE];
            calendarHelpDialogShortcutList.appendChild(calendarHelpDialogShortcutDay);

            const calendarHelpDialogShortcutWeek = document.createElement('li');
            calendarHelpDialogShortcutWeek.innerHTML = STRINGS.moveWeekToWeek[LANGUAGE];
            calendarHelpDialogShortcutList.appendChild(calendarHelpDialogShortcutWeek);

            const calendarHelpDialogShortcutMonth = document.createElement('li');
            calendarHelpDialogShortcutMonth.innerHTML = STRINGS.moveMonthToMonth[LANGUAGE];
            calendarHelpDialogShortcutList.appendChild(calendarHelpDialogShortcutMonth);

            const calendarHelpDialogShortcutToday = document.createElement('li');
            calendarHelpDialogShortcutToday.innerHTML = STRINGS.moveToToday[LANGUAGE];
            calendarHelpDialogShortcutList.appendChild(calendarHelpDialogShortcutToday);

            const calendarHelpDialogCloseButton = document.createElement('button');
            calendarHelpDialogCloseButton.classList.add('oh-calendar__help-dialog__close-button');
            calendarHelpDialogCloseButton.innerText = STRINGS.closeDialog[LANGUAGE].capitalizeFirstLetter();

            calendarHelpDialog.appendChild(calendarHelpDialogLead);
            calendarHelpDialog.appendChild(calendarHelpDialogShortcutList);
            calendarHelpDialog.appendChild(calendarHelpDialogCloseButton);

            calendarElement.appendChild(calendarHelpButton);
            calendarElement.appendChild(calendarHelpDialog);

            calendarHelpButton.addEventListener('click', () => {
                calendarHelpDialog.showModal();
                calendarHelpDialog.focus();
            });

            const calendarToolbar = document.createElement('div');

            calendarToolbar.setAttribute('role', 'application');
            calendarToolbar.classList.add('oh-calendar__toolbar');
            calendarToolbar.setAttribute('tabindex', '0');
            calendarToolbar.setAttribute('aria-label', STRINGS.calendarNavigation[LANGUAGE]);
            calendarToolbar.setAttribute('aria-controls', 'oh-calendar__calendar');

            const calendarButtonPreviousMonth = document.createElement('button');
            calendarButtonPreviousMonth.classList.add('oh-calendar__toolbar-button');
            calendarButtonPreviousMonth.setAttribute('id', 'oh-calendar__toolbar-button__previous');
            calendarButtonPreviousMonth.setAttribute('aria-label', STRINGS.previousMonth[LANGUAGE]);
            calendarButtonPreviousMonth.setAttribute('tabindex', '-1');
            calendarButtonPreviousMonth.innerText = '❮';
            calendarButtonPreviousMonth.value = 'PreviousMonth';
            calendarButtonPreviousMonth.setAttribute('aria-disabled', 'true');

            const calendarButtonNextMonth = document.createElement('button');
            calendarButtonNextMonth.classList.add('oh-calendar__toolbar-button');
            calendarButtonNextMonth.setAttribute('id', 'oh-calendar__toolbar-button__next');
            calendarButtonNextMonth.setAttribute('aria-label', STRINGS.nextMonth[LANGUAGE]);
            calendarButtonNextMonth.setAttribute('tabindex', '-1');
            calendarButtonNextMonth.innerText = '❯';
            calendarButtonNextMonth.value = 'NextMonth';
            calendarButtonNextMonth.setAttribute('aria-disabled', 'false');

            const calendarCurrentMonth = document.createElement('div');
            calendarCurrentMonth.classList.add('oh-calendar__toolbar-heading');
            calendarCurrentMonth.innerText = monthFormat.format(now).capitalizeFirstLetter();

            calendarToolbar.appendChild(calendarButtonPreviousMonth);
            calendarToolbar.appendChild(calendarCurrentMonth);
            calendarToolbar.appendChild(calendarButtonNextMonth);

            calendarElement.appendChild(calendarToolbar);

            calendarHelpDialogCloseButton.addEventListener('click', () => {
                calendarHelpDialog.close();
                caledarToolbar.focus();
            });

            const weekDayHeaders = document.createElement('div');
            weekDayHeaders.classList.add('oh-calendar__weekdays');
            weekDayHeaders.setAttribute('aria-hidden', 'true');

            // Print out the names of the wekdays as a header
            calendarData[0].weeks[0].days.forEach((day) => {
                const listItem = document.createElement('span');
                const abbreviatedWeekday = document.createElement('abbr');

                abbreviatedWeekday.setAttribute('title', longWeekdayFormat.format(day.date).capitalizeFirstLetter());
                abbreviatedWeekday.innerText = shortWeekdayFormat.format(day.date);

                listItem.appendChild(abbreviatedWeekday);
                weekDayHeaders.appendChild(listItem);
            });

            calendarElement.appendChild(weekDayHeaders);

            const monthList = document.createElement('section');
            monthList.classList.add('oh-calendar__calendar');
            monthList.setAttribute('id', 'oh-calendar__calendar');
            monthList.setAttribute('role', 'application');
            monthList.setAttribute('aria-label', STRINGS.calendar[LANGUAGE]);

            calendarData.forEach((month, index) => {
                const monthElement = document.createElement('div');
                monthElement.classList.add('oh-calendar__month');
                monthElement.value = month.month + 1;
                monthElement.setAttribute('aria-label', month.name);
                monthElement.setAttribute('data-name', month.name);

                if (index === 0) {
                    monthElement.setAttribute('aria-selected', 'true');
                } else {
                    monthElement.setAttribute('aria-selected', 'false');
                }

                month.weeks.forEach((week) => {
                    const weekElement = document.createElement('div');
                    weekElement.classList.add('oh-calendar__week');
                    weekElement.setAttribute('data-weeknumber', week.week_number);

                    if (week.week_number === now.getWeek()) {
                        weekElement.classList.add('-current-week');
                    }

                    week.days.forEach((day) => {
                        if (day.date.getMonth() === month.month) {
                            let openingTime = STRINGS.noDefinedOpeningHours[LANGUAGE];
                            if (day.open !== undefined && !day.is_past) {
                                openingTime = (day.open) ? STRINGS.open[LANGUAGE] + ' ' + day.opening_time.replace(/^0+/, '').replace(':00', '') + ' ' + STRINGS.to[LANGUAGE] + ' ' + day.closing_time.replace(/^0+/, '').replace(':00', '') : STRINGS.closed[LANGUAGE];
                            }
                            const note = (day.note !== undefined) ? ', ' + day.note : '';
                            const isToday = (day.is_today) ? ', ' + STRINGS.today[LANGUAGE] : '';

                            const dayElement = document.createElement('div');
                            dayElement.classList.add('oh-calendar__day');
                            dayElement.classList.add('-' + longWeekdayFormatEnglish.format(day.date).toLowerCase());
                            dayElement.setAttribute('data-weekday', longWeekdayFormatEnglish.format(day.date).toLowerCase());
                            dayElement.setAttribute('data-date', day.date.getDate());
                            dayElement.setAttribute('role', 'presentation');
                            dayElement.setAttribute('tabindex', '-1');
                            dayElement.setAttribute('aria-label', day.date.getDate() + ' ' + monthFormat.format(day.date) + ', ' + longWeekdayFormat.format(day.date) + isToday + ', ' + openingTime + note + '.');

                            const dayDateElement = document.createElement('span');
                            dayDateElement.classList.add('oh-calendar__date');
                            dayDateElement.innerText = day.date.getDate();

                            dayDateElement.setAttribute('aria-hidden', 'true');

                            const dayHoursElement = document.createElement('span');
                            dayHoursElement.classList.add('oh-calendar__day__hours');
                            dayHoursElement.setAttribute('aria-hidden', 'true');

                            if (day.open !== undefined && !day.is_past) {
                                dayHoursElement.innerText = (day.open) ? day.opening_time.replace(/^0+/, '').replace(':00', '') + '–' + day.closing_time.replace(/^0+/, '').replace(':00', '') : STRINGS.closed[LANGUAGE];
                                dayElement.classList.add((day.open) ? '-open' : '-closed');
                            }

                            dayElement.appendChild(dayDateElement);
                            dayElement.appendChild(dayHoursElement);

                            if (day.note !== undefined) {
                                const dayNoteElement = document.createElement('span');
                                dayNoteElement.classList.add('oh-calendar__day__note');
                                dayNoteElement.innerText = day.note;

                                dayNoteElement.setAttribute('aria-hidden', 'true');
                                dayElement.appendChild(dayNoteElement);
                            }

                            if (day.is_past) {
                                dayHoursElement.innerText = '';
                                dayElement.classList.add('-is-past');
                            }

                            if (day.is_today) {
                                dayElement.classList.add('-today');
                                dayElement.setAttribute('tabindex', '0');
                                dayElement.setAttribute('aria-selected', 'true');
                            } else {

                                dayElement.setAttribute('aria-selected', 'false');
                            }

                            if (!day.is_in_month) {
                                dayElement.classList.add('-outside-month');
                            }

                            weekElement.appendChild(dayElement);
                        }
                    });

                    monthElement.appendChild(weekElement);
                });

                const monthName = document.createElement('p');
                monthName.innerText = month.name;
                monthList.appendChild(monthElement);

            });
            calendarElement.appendChild(monthList);

            const announceElement = document.createElement('div');
            announceElement.classList.add('visually-hidden');
            announceElement.setAttribute('role', 'status');
            announceElement.setAttribute('aria-live', 'polite');
            calendarElement.appendChild(announceElement);

            calendarElement.appendChild(monthList);

            const announce = function (text) {
                announceElement.innerText = text;
                setTimeout(() => {
                    announceElement.innerText = '';
                }, 500);
            };

            const changeMonth = (command, date) => {
                const current = date;
                const currentMonth = current.parentElement.parentElement;
                let next = current;

                const previousMonthButton = document.getElementById('oh-calendar__toolbar-button__previous');
                const nextMonthButton = document.getElementById('oh-calendar__toolbar-button__next');

                try {
                    switch (command) {
                    case 'NextMonthFirstWeekday':
                        next = currentMonth.nextSibling.querySelector(`.oh-calendar__day[data-weekday="${current.getAttribute('data-weekday')}"]`);
                        break;
                    case 'PreviousMonthLastWeekday':
                        const allWeekDays = currentMonth.previousSibling.querySelectorAll(`.oh-calendar__day[data-weekday="${current.getAttribute('data-weekday')}"]`);
                        next = allWeekDays[allWeekDays.length - 1];
                        break;
                    case 'NextMonthFirstDay':
                        next = currentMonth.nextSibling.querySelector(`.oh-calendar__day`);
                        break;
                    case 'PreviousMonthFirstDay':
                        next = currentMonth.previousSibling.querySelector(`.oh-calendar__day`);
                        break;
                    case 'PreviousMonthLastDay':
                        const allDays = currentMonth.previousSibling.querySelectorAll(`.oh-calendar__day`);
                        next = allDays[allDays.length - 1];
                        break;
                    case 'PreviousMonthSameDay':
                        if (currentMonth.previousSibling.querySelector(`.oh-calendar__day[data-date="${current.getAttribute('data-date')}"]`) !== null) {
                            next = currentMonth.previousSibling.querySelector(`.oh-calendar__day[data-date="${current.getAttribute('data-date')}"]`);
                        } else {
                            const allDays = currentMonth.previousSibling.querySelectorAll(`.oh-calendar__day`);
                            next = allDays[allDays.length - 1];
                        }

                        break;
                    case 'NextMonthSameDay':
                        if (currentMonth.nextSibling.querySelector(`.oh-calendar__day[data-date="${current.getAttribute('data-date')}"]`) !== null) {
                            next = currentMonth.nextSibling.querySelector(`.oh-calendar__day[data-date="${current.getAttribute('data-date')}"]`);
                        } else {
                            const allDays = currentMonth.nextSibling.querySelectorAll(`.oh-calendar__day`);
                            next = allDays[allDays.length - 1];
                        }
                        break;
                    case 'Today':
                        next = document.querySelector('.oh-calendar .-today');
                        break;
                    }

                    const nextMonth = next.parentElement.parentElement;

                    monthList.childNodes.forEach((element) => element.setAttribute('aria-selected', 'false'));
                    nextMonth.setAttribute('aria-selected', 'true');
                    calendarCurrentMonth.innerText = nextMonth.getAttribute('data-name').capitalizeFirstLetter();
                    next.setAttribute('tabindex', '0');
                    current.setAttribute('tabindex', '-1');

                    next.setAttribute('aria-selected', 'true');
                    current.setAttribute('aria-selected', 'false');

                    // Set active/disabled status for month navigation
                    if (nextMonth === nextMonth.parentElement.firstElementChild) {
                        previousMonthButton.setAttribute('aria-disabled', 'true');
                        nextMonthButton.setAttribute('aria-disabled', 'false');
                    } else if (nextMonth === nextMonth.parentElement.lastElementChild) {
                        previousMonthButton.setAttribute('aria-disabled', 'false');
                        nextMonthButton.setAttribute('aria-disabled', 'true');
                    } else {
                        previousMonthButton.setAttribute('aria-disabled', 'false');
                        nextMonthButton.setAttribute('aria-disabled', 'false');
                    }

                    // If user is interacting with the toolbar or with the calendar grid
                    if (document.activeElement.getAttribute('class') === 'oh-calendar__toolbar') {
                        announce(nextMonth.getAttribute('data-name').capitalizeFirstLetter());
                    } else {
                        next.focus();
                    }

                } catch (e) {
                    announce(STRINGS.cantSelectDate[LANGUAGE]);
                }

            };

            const toolbarOnKeydown = (event) => {
                const selectedDate = document.querySelector('.oh-calendar__day[aria-selected=true]');
                const key = event.key.replace('Arrow', '');

                if (key.match(/Left|Right/)) {
                    switch (key) {
                    case 'Right':
                        changeMonth('NextMonthFirstDay', selectedDate);
                        event.target.focus();
                        break;
                    case 'Left':
                        changeMonth('PreviousMonthFirstDay', selectedDate);
                        event.target.focus();
                        break;
                    }
                    event.preventDefault();
                }
            };

            const toolbarOnClick = (event) => {
                const selectedDate = document.querySelector('.oh-calendar__day[aria-selected=true]');
                const target = event.target;

                if (target.value === 'NextMonth') {
                    changeMonth('NextMonthFirstDay', selectedDate);
                } else if (target.value === 'PreviousMonth') {
                    changeMonth('PreviousMonthFirstDay', selectedDate);
                }
                event.preventDefault();
            };

            const calendarOnKeydown = (event) => {

                const changeSelectedDate = function (current, command) {
                    const selectNewDateElement = function (current, next) {
                        current.setAttribute('aria-selected', 'false');
                        current.setAttribute('tabindex', '-1');
                        next.setAttribute('tabindex', '0');
                        next.setAttribute('aria-selected', 'true');
                        next.focus();
                    };
                    let next = current;
                    switch (command) {
                    case 'PreviousWeek':
                        if (current.parentElement.previousSibling && current.parentElement.previousSibling.querySelector('.-' + current.getAttribute('data-weekday'))) {
                            next = current.parentElement.previousSibling.querySelector('.-' + current.getAttribute('data-weekday'));
                            selectNewDateElement(current, next);
                        } else {
                            changeMonth('PreviousMonthLastWeekday', current);
                        }
                        break;
                    case 'NextWeek':
                        if (current.parentElement.nextSibling && current.parentElement.nextSibling.querySelector('.-' + current.getAttribute('data-weekday'))) {
                            next = current.parentElement.nextSibling.querySelector('.-' + current.getAttribute('data-weekday'));
                            selectNewDateElement(current, next);
                        } else {
                            changeMonth('NextMonthFirstWeekday', current);
                        }
                        break;
                    case 'PreviousDay':
                        if (current.previousSibling) {
                            next = current.previousSibling;
                            selectNewDateElement(current, next);
                        } else {
                            if (current.parentElement.previousSibling) {
                                next = current.parentElement.previousSibling.querySelector('.oh-calendar__day.-sunday');
                                selectNewDateElement(current, next);
                            } else {
                                changeMonth('PreviousMonthLastDay', current);
                            }
                        }
                        break;
                    case 'NextDay':
                        if (current.nextSibling) {
                            next = current.nextSibling;
                            selectNewDateElement(current, next);
                        } else {
                            if (current.parentElement.nextSibling) {
                                next = current.parentElement.nextSibling.querySelector('.oh-calendar__day.-monday');
                                selectNewDateElement(current, next);
                            } else {
                                changeMonth('NextMonthFirstDay', current);
                            }
                        }
                        break;
                    case 'PreviousMonth':
                        changeMonth('PreviousMonthSameDay', current);
                        break;
                    case 'NextMonth':
                        changeMonth('NextMonthSameDay', current);
                        break;
                    case 'Today':
                        const today = document.querySelector('.oh-calendar .-today');
                        if (current.parentElement.parentElement === today.parentElement.parentElement) {
                            next = today;
                            selectNewDateElement(current, next);
                        } else {
                            changeMonth('Today', current);
                        }
                        break;
                    }

                };
                const target = event.target;
                const key = event.key.replace('Arrow', '');

                if (target.classList.contains('oh-calendar__day') && key.match(/Up|Down|Left|Right|Home|PageUp|PageDown/)) {
                    switch (key) {
                    case 'Right':
                        changeSelectedDate(target, 'NextDay');
                        break;
                    case 'Left':
                        changeSelectedDate(target, 'PreviousDay');
                        break;
                    case 'Up':
                        changeSelectedDate(target, 'PreviousWeek');
                        break;
                    case 'Down':
                        changeSelectedDate(target, 'NextWeek');
                        break;
                    case 'Home':
                        changeSelectedDate(target, 'Today');
                        break;
                    case 'PageUp':
                        changeSelectedDate(target, 'PreviousMonth');
                        break;
                    case 'PageDown':
                        changeSelectedDate(target, 'NextMonth');
                        break;
                    }
                    event.preventDefault();
                }
            };

            document.querySelectorAll('.oh-calendar__day').forEach((element) => {
                element.addEventListener('keydown', calendarOnKeydown);
            });

            document.querySelectorAll('.oh-calendar__toolbar').forEach((element) => {
                element.addEventListener('keydown', toolbarOnKeydown);
            });

            document.querySelectorAll('.oh-calendar__toolbar-button').forEach((element) => {
                element.addEventListener('click', toolbarOnClick);
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
    var showCountdown = function (data) {
        'use strict';
        var openingNext = {};
        var weeks = data.weeks;

        var calculateTime = function () {
            /**
             *  ## countdownOutput
             *  Print out the output for countDown.
             *
             *  @private
             */
            var countdownOutput = function (content) {
                document.querySelectorAll('.oh-countdown').forEach((element) => element.innerHTML = content);
            };

            // Loop through the weeks
            week:
                for (var w = 0; w < weeks.length; w += 1) {
                    var now;
                    var currentDay;

                    // Loop through the days of the week
                    for (var d = 0; d < weeks[w].days.length; d += 1) {
                        var openingTime = new Date(weeks[w].days[d].date + ' ' + weeks[w].days[d].openingTime);
                        var closingTime = new Date(weeks[w].days[d].date + ' ' + weeks[w].days[d].closingTime);

                        now = new Date();
                        currentDay = new Date().setUTCHours(0, 0, 0, 0);

                        // If the current working day is going to open
                        if (weeks[w].days[d].status === 'open') {
                            openingNext.day = weeks[w].days[d].day;
                            openingNext.openingTime = weeks[w].days[d].openingTime;
                            openingNext.closingTime = weeks[w].days[d].closingTime;
                            openingNext.date = weeks[w].days[d].date;

                            // If we are currently open, print out the time to closing
                            if ((openingTime - now <= 0 && closingTime - now > 0)) {

                                // If we are closing in 1 minute or less show relative time with singular suffix
                                if ((closingTime - now) / 1000 / 60 <= 1) {
                                    countdownOutput(STRINGS.openRelative[LANGUAGE] + Math.round((closingTime - now) / 1000 / 60) + STRINGS.time.minutes.singular[LANGUAGE] + STRINGS.openRelativeSuffix[LANGUAGE]);
                                    break week;

                                    // If it's 60 minutes or less show relative time.
                                } else if ((closingTime - now) / 1000 / 60 < 60) {
                                    countdownOutput(STRINGS.openRelative[LANGUAGE] + Math.round((closingTime - now) / 1000 / 60) + STRINGS.time.minutes.plural[LANGUAGE] + STRINGS.openRelativeSuffix[LANGUAGE]);
                                    break week;

                                    // Otherwise show absolute time.
                                } else {
                                    countdownOutput(STRINGS.openAbsolute[LANGUAGE] + openingNext.closingTime + ' ' + STRINGS.today[LANGUAGE] + '.');
                                    break week;
                                }

                                // Is the date in the future?
                            } else if (openingTime - now > 0) {

                                // Is it the same date?
                                if (new Date(weeks[w].days[d].date) - currentDay === 0) {

                                    // If it's 1 minute or less left, change to singular suffix
                                    if ((openingTime - now) / 1000 / 60 <= 1) {
                                        countdownOutput(STRINGS.closedRelative[LANGUAGE] + STRINGS.lessThanOne[LANGUAGE] + STRINGS.time.minutes.singular[LANGUAGE] + '.');
                                        break week;

                                        // If it's 60 minutes or less show relative time.
                                    } else if ((openingTime - now) / 1000 / 60 < 60) {
                                        countdownOutput(STRINGS.closedRelative[LANGUAGE] + Math.round((openingTime - now) / 1000 / 60) + STRINGS.time.minutes.plural[LANGUAGE] + '.');
                                        break week;

                                        // Otherwise show absolute time.
                                    } else {
                                        countdownOutput(STRINGS.closedAbsolute[LANGUAGE] + ' ' + STRINGS.today[LANGUAGE] + ' ' + STRINGS.at[LANGUAGE] + openingNext.openingTime + '.');
                                        break week;
                                    }

                                    // Is it tomorrow?
                                } else if ((new Date(weeks[w].days[d].date) - currentDay) / 1000 / 60 / 60 / 24 === 1) {
                                    countdownOutput(STRINGS.closedAbsolute[LANGUAGE] + STRINGS.weekdays.tomorrow[LANGUAGE] + STRINGS.at[LANGUAGE] + openingNext.openingTime + '.');
                                    break week;

                                    // Is it further in the future?
                                } else if ((new Date(weeks[w].days[d].date) - currentDay) / 1000 / 60 / 60 / 24 >= 2) {
                                    countdownOutput(STRINGS.closedAbsolute[LANGUAGE] + STRINGS.on[LANGUAGE] + STRINGS.weekdays[openingNext.day][LANGUAGE] + STRINGS.at[LANGUAGE] + openingNext.openingTime + '.');
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
    var getData = async function () {

        'use strict';

        var weeks = 20;
        var iid = libCalInstanceId;

        /**
         *  ## Get Weekday
         *  Translates the position in the array to the name of the weekday.
         *
         *  @private
         *  @param {Number} weekdayNumber
         *  @returns {String} Weekday
         */
        var getWeekday = function (weekdayNumber) {
            var day;
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

        var fetchData = async function () {

            const normalizeData = (data) => {
                var response = {};

                // Loop through all the weeks.
                response.weeks = [];
                for (var w = 0; w < data.length; w += 1) {
                    var currentWeek = {};

                    currentWeek.weekNumber = new Date(data[w].Monday.date).getWeek();
                    currentWeek.days = [];

                    // Loop through the days of the week
                    for (var d = 0; d < 7; d += 1) {
                        var weekday = getWeekday(d);
                        currentWeek.days[d] = {};
                        currentWeek.days[d].status = data[w][weekday].times.status;
                        currentWeek.days[d].day = weekday;
                        currentWeek.days[d].date = data[w][weekday].date;

                        // If there is a note add that to object
                        if (data[w][weekday].times.note) {
                            currentWeek.days[d].note = {};
                            var note = data[w][weekday].times.note.split('/');
                            note = (note.length === 1) ? [note[0], note[0]] : note;
                            currentWeek.days[d].note.sv = note[0];
                            currentWeek.days[d].note.en = note[1];
                        }

                        // If it's open, write out the times it is open.
                        if (data[w][weekday].times.status === 'open') {
                            currentWeek.days[d].openingTime = data[w][weekday].times.hours[0].from;
                            currentWeek.days[d].closingTime = data[w][weekday].times.hours[0].to;
                        }
                    }
                    response.weeks.push(currentWeek);
                }

                return response;
            };

            const cache = {
                get: (cacheName) => {
                    if (localStorage.getItem(cacheName)) {
                        const cacheObject = JSON.parse(localStorage.getItem(cacheName));
                        if (new Date() > new Date(cacheObject.expires)) {
                            return null;
                        } else {
                            return cacheObject.data;
                        }
                    } else {
                        return null;
                    }
                },
                set: (cacheName, data, expires) => {
                    const expiryTime = new Date();
                    expiryTime.setSeconds(expiryTime.getSeconds() + expires);
                    localStorage.setItem(cacheName, JSON.stringify({
                        expires: expiryTime.toISOString(),
                        data: data
                    }));
                }
            };

            // Grab data from the API
            const url = `https://api3-eu.libcal.com/api_hours_grid.php?iid=${iid}&format=json&weeks=${weeks}&systemTime=1`;
            let data = undefined;

            if (cache.get('opening-hours')) {
                data = cache.get('opening-hours');

                return normalizeData(data.locations[0].weeks);
            } else {
                const cachedData = await fetch(url);
                const data = await cachedData.json();
                cache.set('opening-hours', data, 7200);

                return normalizeData(data.locations[0].weeks);
            }

        };

        return new Promise(async function (resolve) {
            const data = await fetchData();
            if (document.readyState === 'complete'
                || document.readyState === 'loaded'
                || document.readyState === 'interactive') {
                resolve(data);
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    resolve(data);
                }, false);
            }
        });
    };

    /**
     *  ## Set language
     *  Set language of Moment.js and OpeningHours
     *
     *  @param {String} lang
     *  @private
     */
    var setLanguage = function (lang) {
        LANGUAGE = lang;
        'use strict';
        if (LANGUAGE === 'sv') {
            return LANGUAGE;
        } else {
            return LANGUAGE;
        }
    };

    /**
     * ## Initialize
     * Initializes the Opening Hours script.
     *.
     * @public
     * @param iid Instance id of the LibCal object
     * @param language Language set in two letter code, compatible with sv and en
     */
    publicFunctions.initialize = async function (iid, ...language) {
        if (!isInitialized) {
            isInitialized = true;

            if (typeof iid !== 'number') {
                console.error('[Opening Hours]', 'iid parameter needs to be set as the number of the LibCal instanceId to display hours from.');
            } else {
                if (language.length) {
                    setLanguage(language[0]);
                } else {
                    console.error('language not set');
                }

                libCalInstanceId = iid;

                const data = await getData();

                showCountdown(data);
                showWeek(data);
                showCalendar(data);
            }
        }
    };

    return publicFunctions;
}());
