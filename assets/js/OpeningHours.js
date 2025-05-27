/* exported OpeningHours */

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @return int
 * @param dowOffset
 */
Date.prototype.getWeek = function (dowOffset) {
	/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

	dowOffset = typeof dowOffset === 'number' ? dowOffset : 1; // default dowOffset to one
	let newYear = new Date(this.getFullYear(), 0, 1);
	let day = newYear.getDay() - dowOffset; // the day of week the year begins on
	day = day >= 0 ? day : day + 7;
	let daynum =
		Math.floor(
			(this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
				86400000,
		) + 1;
	let weeknum;
	// if the year starts before the middle of a week
	if (day < 4) {
		weeknum = Math.floor((daynum + day - 1) / 7) + 1;
		if (weeknum > 52) {
			nYear = new Date(this.getFullYear() + 1, 0, 1);
			nday = nYear.getDay() - dowOffset;
			nday = nday >= 0 ? nday : nday + 7;
			/* if the next year starts before the middle of
			 the week, it is week #1 of that year */
			weeknum = nday < 4 ? 1 : 53;
		}
	} else {
		weeknum = Math.floor((daynum + day - 1) / 7);
	}
	return weeknum;
};

Date.prototype.getWeeksOfMonth = function () {
	let firstDay = new Date(this.setDate(1)).getDay();
	let lastDay = new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();

	let used = firstDay + (firstDay === 0 ? 6 : -1) + lastDay;
	return Math.ceil(used / 7);
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
let OpeningHours = (function () {
	let LANGUAGE = 'en';
	let publicFunctions = {};
	let isInitialized = false;
	let libCalInstanceId = undefined;
	let STRINGS = {
		openRelative: {
			sv: 'Vi har öppet i ',
			en: 'We are open another ',
		},
		openRelativeSuffix: {
			sv: ' till.',
			en: '.',
		},
		closedRelative: {
			sv: 'Vi har stängt och öppnar om ',
			en: 'We are currently closed and are opening in ',
		},
		openAbsolute: {
			sv: 'Vi har öppet till klockan ',
			en: 'We are open until ',
		},
		closedAbsolute: {
			sv: 'Vi har stängt och öppnar ',
			en: 'We are currently closed and are opening ',
		},
		nextMonth: {
			sv: 'Visa nästa månad',
			en: 'Show next month',
		},
		previousMonth: {
			sv: 'Visa föregående månad',
			en: 'Show previous month',
		},
		open: {
			sv: 'öppet',
			en: 'open',
		},
		closed: {
			sv: 'stängt',
			en: 'closed',
		},
		today: {
			sv: 'i dag',
			en: 'today',
		},
		calendar: {
			sv: 'Kalender för öppettider',
			en: 'Calendar for opening hours',
		},
		noDefinedOpeningHours: {
			sv: 'Inga öppettider angivna',
			en: 'No defined opening hours',
		},
		calendarNavigation: {
			sv: 'Kalendernavigeringsmeny',
			en: 'Calendar navigation',
		},
		lessThanOne: {
			sv: ' mindre än en',
			en: ' less than one',
		},
		months: {
			sv: 'månader',
			en: 'months',
		},
		weekNumbers: {
			sv: 'Veckonummer',
			en: 'Week numbers',
		},
		time: {
			minutes: {
				singular: {
					sv: '&nbsp;minut',
					en: '&nbsp;minute',
				},
				plural: {
					sv: '&nbsp;minuter',
					en: '&nbsp;minutes',
				},
			},
			hours: {
				singular: {
					sv: '&nbsp;timme',
					en: '&nbsp;hour',
				},
				plural: {
					sv: '&nbsp;timmar',
					en: '&nbsp;hours',
				},
			},
			days: {
				singular: {
					sv: '&nbsp;dag',
					en: '&nbsp;day',
				},
				plural: {
					sv: '&nbsp;dagar',
					en: '&nbsp;days',
				},
			},
			week: {
				singular: {
					sv: 'vecka',
					en: 'week',
				},
				plural: {
					sv: 'veckor',
					en: 'weeks',
				},
			},
		},
		weekdays: {
			Monday: {
				sv: 'måndag',
				en: 'Monday',
			},
			Tuesday: {
				sv: 'tisdag',
				en: 'Tuesday',
			},
			Wednesday: {
				sv: 'onsdag',
				en: 'Wednesday',
			},
			Thursday: {
				sv: 'torsdag',
				en: 'Thursday',
			},
			Friday: {
				sv: 'fredag',
				en: 'Friday',
			},
			Saturday: {
				sv: 'lördag',
				en: 'Saturday',
			},
			Sunday: {
				sv: 'söndag',
				en: 'Sunday',
			},
			tomorrow: {
				sv: 'i morgon',
				en: 'tomorrow',
			},
		},
		at: {
			sv: ' klockan ',
			en: ' at ',
		},
		on: {
			sv: ' på ',
			en: 'on ',
		},
		and: {
			sv: ' och ',
			en: ' and ',
		},
		goTo: {
			sv: 'Gå till',
			en: 'Go to',
		},
		to: {
			sv: 'till',
			en: 'to',
		},
	};

	/**
	 *  ## Show Opening Hours
	 *  Returns opening hours for this week
	 *
	 *  @private
	 *  @param {Object} data API data from getData()
	 *  @returns {String} Next day and time when the library is set to open.
	 */
	let showWeek = function (data) {
		const longWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, { weekday: 'long' });
		const numberMonthFormat = new Intl.DateTimeFormat(LANGUAGE, { month: 'numeric' });
		const dateFormat = new Intl.DateTimeFormat('sv');

		let weeks = data.weeks;
		let weekElement;
		let currentDay = new Date();
		currentDay.setUTCHours(0, 0, 0, 0);

		for (let w = 0; w < weeks.length; w += 1) {
			const lastDayOfWeek = new Date(weeks[w].days[6].date);

			// Skip this iteration if currentDay is in a future week
			if (currentDay > lastDayOfWeek) {
				continue;
			}

			weekElement = document.createElement('ul');
			weekElement.classList.add('oh-week');

			// Loop through the days of the week
			for (let d = 0; d < weeks[w].days.length; d += 1) {
				let day = document.createElement('li');
				let indexDate = new Date(weeks[w].days[d].date);
				day.classList.add('oh-day');
				day.classList.add('-loaded');
				// If it is the current day, add current-day attribute.
				if (indexDate - currentDay === 0) {
					day.setAttribute('data-current-day', '');
				}
				// Create day element & add the weekday to it
				let weekday = document.createElement('time');
				weekday.classList.add('oh-day-weekday');
				weekday.innerText = `${longWeekdayFormat.format(indexDate).capitalizeFirstLetter()} (${indexDate.getDate()}/${numberMonthFormat.format(indexDate)})`;
				weekday.setAttribute('datetime', indexDate.toISOString());

				// Add a notes column
				let label = document.createElement('span');
				label.classList.add('oh-day-label');
				if (typeof weeks[w].days[d].note !== 'undefined' && typeof weeks[w].days[d].note[LANGUAGE] === 'string') {
					label.innerText = weeks[w].days[d].note[LANGUAGE];
				}

				// Show the opening/closed message
				let hours = document.createElement('span');
				hours.classList.add('oh-day-hours');
				if (weeks[w].days[d].status === 'open') {
					hours.setAttribute('data-state', 'open');
					hours.innerHTML =
						'<span class="oh-opening">' +
						weeks[w].days[d].openingTime.replace(/^0+/, '').replace(':00', '') +
						'</span>–<span class="oh-closing">' +
						weeks[w].days[d].closingTime.replace(/^0+/, '').replace(':00', '') +
						'</span>';
				} else {
					hours.setAttribute('data-state', 'closed');
					hours.innerHTML = STRINGS.closed[LANGUAGE].toLowerCase().replace(
						/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g,
						function (letter) {
							return letter.toUpperCase();
						},
					);
				}

				day.append(weekday);
				day.append(label);
				day.append(hours);

				weekElement.append(day);
			}

			// Break loop if currentDay is before or on last day of current week
			if (currentDay <= lastDayOfWeek) {
				break;
			}
		}

		let weekElements = document.querySelectorAll('.oh-week');
		weekElements.forEach((element) => {
			element.innerHTML = weekElement.innerHTML;
		});
	};

	/**
	 *  ## Show Monthly Hours
	 *  Returns opening hours for 3 months
	 *
	 *  @private
	 *  @param {Object} data API data from getData()
	 */
	let showCalendar = function (data) {
		// https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
		function getMonday(d) {
			d = new Date(d);
			let day = d.getDay();
			let diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
			return new Date(d.setDate(diff));
		}

		if (document.getElementById('oh-calendar')) {
			const now = new Date();
			const weeksToMonthData = function (data) {
				const monthFormat = new Intl.DateTimeFormat(LANGUAGE, { month: 'long' });
				const dateFormat = new Intl.DateTimeFormat('sv');
				const dayFormat = new Intl.DateTimeFormat(LANGUAGE, { weekday: 'long' });
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
							openingTime: typeof day.openingTime !== 'undefined' ? day.openingTime : undefined,
							closingTime: typeof day.closingTime !== 'undefined' ? day.closingTime : undefined,
							note: typeof day.note !== 'undefined' ? day.note : undefined,
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

					const monthNumber = now.getMonth() + i > 11 ? now.getMonth() + i - 12 : now.getMonth() + i;
					const currentYear = now.getMonth() + i > 11 ? now.getFullYear() + 1 : now.getFullYear();
					const firstDayOfCurrentMonth = new Date(currentYear, monthNumber, 1);
					const firstMonday = getMonday(firstDayOfCurrentMonth);

					const weeksInMonth = firstDayOfCurrentMonth.getWeeksOfMonth();

					month.month = firstDayOfCurrentMonth.getMonth();
					month.name = monthFormat.format(firstDayOfCurrentMonth);
					month.weeks = [];

					for (let w = 0; w < weeksInMonth; w++) {
						const firstDayOfWeek = new Date(
							firstMonday.getFullYear(),
							firstMonday.getMonth(),
							firstMonday.getDate() + 7 * w,
						);
						const week = {};
						week.week_number = firstDayOfWeek.getWeek();
						week.days = [];

						for (let d = 0; d < 7; d++) {
							const day = {};
							day.date = new Date(
								firstDayOfWeek.getFullYear(),
								firstDayOfWeek.getMonth(),
								firstDayOfWeek.getDate() + d,
							);

							day.is_today = day.date.getTime() === today.getTime();
							day.is_past = day.date < today;
							day.is_in_month = day.date.getMonth() === firstDayOfCurrentMonth.getMonth();
							day.date_string = dateFormat.format(day.date);
							day.open = undefined;
							day.opening_time = undefined;
							day.closing_time = undefined;
							day.note = undefined;

							if (openingHoursData.hasOwnProperty(day.date_string)) {
								day.open = openingHoursData[day.date_string].open;
								day.opening_time = openingHoursData[day.date_string].openingTime;
								day.closing_time = openingHoursData[day.date_string].closingTime;
								day.note =
									typeof openingHoursData[day.date_string].note !== 'undefined'
										? openingHoursData[day.date_string].note[LANGUAGE]
										: undefined;
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
			const monthFormat = new Intl.DateTimeFormat(LANGUAGE, { month: 'long' });
			const longWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, { weekday: 'long' });
			const longWeekdayFormatEnglish = new Intl.DateTimeFormat('en', { weekday: 'long' });
			const shortWeekdayFormat = new Intl.DateTimeFormat(LANGUAGE, { weekday: 'short' });

			const calendarElement = document.createElement('div');
			calendarElement.setAttribute('lang', LANGUAGE);

			const calendarToolbar = document.createElement('div');

			calendarToolbar.setAttribute('role', 'toolbar');
			calendarToolbar.classList.add('oh-calendar__toolbar');
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
			calendarButtonNextMonth.setAttribute('tabindex', '0');
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

			const monthList = document.createElement('section');
			monthList.classList.add('oh-calendar__calendar');
			monthList.setAttribute('id', 'oh-calendar__calendar');
			monthList.setAttribute('role', 'table');
			monthList.setAttribute('aria-label', STRINGS.calendar[LANGUAGE]);

			calendarData.forEach((month, index) => {
				const monthElement = document.createElement('div');
				monthElement.classList.add('oh-calendar__month');
				monthElement.setAttribute('role', 'rowgroup');
				monthElement.value = month.month + 1;
				monthElement.setAttribute('aria-label', month.name);
				monthElement.setAttribute('data-name', month.name);

				if (index === 0) {
					monthElement.setAttribute('aria-selected', 'true');
				} else {
					monthElement.setAttribute('aria-selected', 'false');
				}

				const weekDayHeaders = document.createElement('div');
				weekDayHeaders.classList.add('oh-calendar__weekdays');
				weekDayHeaders.setAttribute('role', 'row');

				const weekDayHeaderEmpty = document.createElement('span');
				weekDayHeaderEmpty.setAttribute('role', 'columnheader');
				weekDayHeaderEmpty.classList.add('oh-calendar__weekdays__empty');
				weekDayHeaderEmpty.innerHTML = `<span class="visually-hidden">${STRINGS.weekNumbers[LANGUAGE]}</span>`;
				weekDayHeaders.appendChild(weekDayHeaderEmpty);

				// Print out the names of the wekdays as a header
				calendarData[0].weeks[0].days.forEach((day) => {
					const listItem = document.createElement('span');
					const abbreviatedWeekday = document.createElement('abbr');
					const fullWeekDay = document.createElement('span');

					abbreviatedWeekday.setAttribute('aria-hidden', 'true');
					abbreviatedWeekday.innerText = shortWeekdayFormat.format(day.date).capitalizeFirstLetter();
					abbreviatedWeekday.setAttribute('title', longWeekdayFormat.format(day.date).capitalizeFirstLetter());

					fullWeekDay.classList.add('visually-hidden');
					fullWeekDay.innerText = longWeekdayFormat.format(day.date).capitalizeFirstLetter();

					listItem.setAttribute('role', 'columnheader');
					listItem.classList.add('oh-calendar__weekday');

					listItem.appendChild(abbreviatedWeekday);
					listItem.appendChild(fullWeekDay);
					weekDayHeaders.appendChild(listItem);
				});
				monthElement.appendChild(weekDayHeaders);

				month.weeks.forEach((week) => {
					const weekElement = document.createElement('div');
					weekElement.classList.add('oh-calendar__week');
					weekElement.setAttribute('role', 'row');

					const weekNumber = document.createElement('span');
					const abbreviatedWeekNumber = document.createElement('abbr');
					const fullWeekNumber = document.createElement('span');

					abbreviatedWeekNumber.setAttribute('aria-hidden', 'true');
					abbreviatedWeekNumber.innerText = week.week_number;
					abbreviatedWeekNumber.setAttribute('title', `${STRINGS.time.week['singular'][LANGUAGE]} ` + week.week_number);

					fullWeekNumber.classList.add('visually-hidden');
					fullWeekNumber.innerHTML = `<span>${STRINGS.time.week['singular'][LANGUAGE]}</span> ` + week.week_number;

					weekNumber.appendChild(abbreviatedWeekNumber);
					weekNumber.appendChild(fullWeekNumber);

					weekNumber.classList.add('oh-calendar__week-number');
					weekNumber.setAttribute('role', 'rowheader');

					if (week.week_number === now.getWeek()) {
						weekNumber.classList.add('-current-week');
					}

					weekElement.appendChild(weekNumber);

					week.days.forEach((day) => {
						let openingTime = STRINGS.noDefinedOpeningHours[LANGUAGE];
						if (day.open !== undefined && !day.is_past) {
							openingTime = day.open
								? STRINGS.open[LANGUAGE] +
									' ' +
									day.opening_time.replace(/^0+/, '').replace(':00', '') +
									' ' +
									STRINGS.to[LANGUAGE] +
									' ' +
									day.closing_time.replace(/^0+/, '').replace(':00', '')
								: STRINGS.closed[LANGUAGE];
						}
						const note = day.note !== undefined ? ', ' + day.note : '';
						const isToday = day.is_today ? ', ' + STRINGS.today[LANGUAGE] : '';

						const dayElement = document.createElement('div');
						dayElement.classList.add('oh-calendar__day');
						dayElement.classList.add('-' + longWeekdayFormatEnglish.format(day.date).toLowerCase());
						dayElement.setAttribute('role', 'cell');

						const dayDateElement = document.createElement('span');
						dayDateElement.classList.add('oh-calendar__date');
						dayDateElement.innerText = day.date.getDate();
						dayDateElement.setAttribute('aria-hidden', 'true');

						const dayHoursElement = document.createElement('span');
						dayHoursElement.classList.add('oh-calendar__day__hours');
						dayHoursElement.setAttribute('aria-hidden', 'true');

						const dayLabelElement = document.createElement('span');
						dayLabelElement.classList.add('visually-hidden');
						dayLabelElement.innerText =
							day.date.getDate() + ' ' + monthFormat.format(day.date) + isToday + ', ' + openingTime + note + '.';

						if (day.open !== undefined && !day.is_past) {
							dayHoursElement.innerText = day.open
								? day.opening_time.replace(/^0+/, '').replace(':00', '') +
									'–' +
									day.closing_time.replace(/^0+/, '').replace(':00', '')
								: STRINGS.closed[LANGUAGE];
							dayElement.classList.add(day.open ? '-open' : '-closed');
						}

						dayElement.appendChild(dayDateElement);
						dayElement.appendChild(dayLabelElement);
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
						}

						if (!day.is_in_month) {
							dayElement.classList.add('-outside-month');
						}

						weekElement.appendChild(dayElement);
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

			document.getElementById('oh-calendar').innerHTML = calendarElement.innerHTML;

			const announce = function (text) {
				announceElement.innerText = text;
				setTimeout(() => {
					announceElement.innerText = '';
				}, 500);
			};

			const changeMonth = (command) => {
				const currentMonth = document.querySelector('.oh-calendar__month[aria-selected="true"]');
				const previousMonthButton = document.getElementById('oh-calendar__toolbar-button__previous');
				const nextMonthButton = document.getElementById('oh-calendar__toolbar-button__next');
				let monthTarget = currentMonth;

				try {
					switch (command) {
						case 'NextMonth':
							monthTarget = currentMonth.nextSibling;
							break;
						case 'PreviousMonth':
							monthTarget = currentMonth.previousSibling;
							break;
					}

					monthList.childNodes.forEach((element) => element.setAttribute('aria-selected', 'false'));
					monthTarget.setAttribute('aria-selected', 'true');
					calendarCurrentMonth.innerText = monthTarget.getAttribute('data-name').capitalizeFirstLetter();

					monthTarget.setAttribute('aria-selected', 'true');
					currentMonth.setAttribute('aria-selected', 'false');

					// Set active/disabled status for month navigation
					if (!monthTarget.previousSibling) {
						previousMonthButton.setAttribute('aria-disabled', 'true');
						nextMonthButton.setAttribute('aria-disabled', 'false');
					} else if (!monthTarget.nextSibling) {
						previousMonthButton.setAttribute('aria-disabled', 'false');
						previousMonthButton.removeAttribute('disabled');
						nextMonthButton.setAttribute('aria-disabled', 'true');
					} else {
						previousMonthButton.setAttribute('aria-disabled', 'false');
						nextMonthButton.setAttribute('aria-disabled', 'false');
					}

					// If user is interacting with the toolbar or with the calendar grid
					if (document.activeElement.getAttribute('class') === 'oh-calendar__toolbar-button') {
						announce(monthTarget.getAttribute('data-name').capitalizeFirstLetter());
					} else {
						monthTarget.focus();
					}
				} catch (e) {
					announce(STRINGS.cantSelectDate[LANGUAGE]);
				}
			};

			const toolbarOnKeydown = (event) => {
				const previousMonthButton = document.getElementById('oh-calendar__toolbar-button__previous');
				const nextMonthButton = document.getElementById('oh-calendar__toolbar-button__next');
				const target = event.target;
				const key = event.key.replace('Arrow', '');

				if (key.match(/Left|Right|Enter/)) {
					switch (key) {
						case 'Right':
							nextMonthButton.focus();
							break;
						case 'Left':
							previousMonthButton.focus();
							break;
						case 'Enter':
							if (target.getAttribute('aria-disabled') === 'false') {
								changeMonth(target.value);
							}
					}
					event.preventDefault();
				}
			};

			const toolbarOnClick = (event) => {
				const target = event.target;

				if (target.getAttribute('aria-disabled') === 'false') {
					changeMonth(target.value);
				}
				event.preventDefault();
			};

			document.querySelectorAll('.oh-calendar__toolbar-button').forEach((element) => {
				element.addEventListener('keydown', toolbarOnKeydown);
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
	let showCountdown = function (data) {
		'use strict';
		let openingNext = {};
		let weeks = data.weeks;

		let calculateTime = function () {
			/**
			 *  ## countdownOutput
			 *  Print out the output for countDown.
			 *
			 *  @private
			 */
			let countdownOutput = function (content) {
				document.querySelectorAll('.oh-countdown').forEach((element) => (element.innerHTML = content));
			};

			// Loop through the weeks
			week: for (let w = 0; w < weeks.length; w += 1) {
				let now;
				let currentDay;

				// Loop through the days of the week
				for (let d = 0; d < weeks[w].days.length; d += 1) {
					let openingTime = new Date(weeks[w].days[d].date + ' ' + weeks[w].days[d].openingTime);
					let closingTime = new Date(weeks[w].days[d].date + ' ' + weeks[w].days[d].closingTime);

					now = new Date();
					currentDay = new Date().setUTCHours(0, 0, 0, 0);

					// If the current working day is going to open
					if (weeks[w].days[d].status === 'open') {
						openingNext.day = weeks[w].days[d].day;
						openingNext.openingTime = weeks[w].days[d].openingTime;
						openingNext.closingTime = weeks[w].days[d].closingTime;
						openingNext.date = weeks[w].days[d].date;

						// If we are currently open, print out the time to closing
						if (openingTime - now <= 0 && closingTime - now > 0) {
							// If we are closing in 1 minute or less show relative time with singular suffix
							if ((closingTime - now) / 1000 / 60 <= 1) {
								countdownOutput(
									STRINGS.openRelative[LANGUAGE] +
										Math.round((closingTime - now) / 1000 / 60) +
										STRINGS.time.minutes.singular[LANGUAGE] +
										STRINGS.openRelativeSuffix[LANGUAGE],
								);
								break week;

								// If it's 60 minutes or less show relative time.
							} else if ((closingTime - now) / 1000 / 60 < 60) {
								const minutes = Math.round((closingTime - now) / 1000 / 60);

								//Select singular och plural based on whether the rounded minutes is 1 or not.
								const outputString =
									(minutes === 1 ? STRINGS.time.minutes.singular[LANGUAGE] : STRINGS.time.minutes.plural[LANGUAGE]) +
									STRINGS.openRelativeSuffix[LANGUAGE];
								countdownOutput(outputString);
								break week;

								// Otherwise show absolute time.
							} else {
								countdownOutput(
									STRINGS.openAbsolute[LANGUAGE] + openingNext.closingTime + ' ' + STRINGS.today[LANGUAGE] + '.',
								);
								break week;
							}

							// Is the date in the future?
						} else if (openingTime - now > 0) {
							// Is it the same date?
							if (new Date(weeks[w].days[d].date) - currentDay === 0) {
								// If it's 1 minute or less left, change to singular suffix
								if ((openingTime - now) / 1000 / 60 <= 1) {
									countdownOutput(
										STRINGS.closedRelative[LANGUAGE] +
											STRINGS.lessThanOne[LANGUAGE] +
											STRINGS.time.minutes.singular[LANGUAGE] +
											'.',
									);
									break week;

									// If it's 60 minutes or less show relative time.
								} else if ((openingTime - now) / 1000 / 60 < 60) {
									countdownOutput(
										STRINGS.closedRelative[LANGUAGE] +
											Math.round((openingTime - now) / 1000 / 60) +
											STRINGS.time.minutes.plural[LANGUAGE] +
											'.',
									);
									break week;

									// Otherwise show absolute time.
								} else {
									countdownOutput(
										STRINGS.closedAbsolute[LANGUAGE] +
											' ' +
											STRINGS.today[LANGUAGE] +
											' ' +
											STRINGS.at[LANGUAGE] +
											openingNext.openingTime +
											'.',
									);
									break week;
								}

								// Is it tomorrow?
							} else if ((new Date(weeks[w].days[d].date) - currentDay) / 1000 / 60 / 60 / 24 === 1) {
								countdownOutput(
									STRINGS.closedAbsolute[LANGUAGE] +
										STRINGS.weekdays.tomorrow[LANGUAGE] +
										STRINGS.at[LANGUAGE] +
										openingNext.openingTime +
										'.',
								);
								break week;

								// Is it further in the future?
							} else if ((new Date(weeks[w].days[d].date) - currentDay) / 1000 / 60 / 60 / 24 >= 2) {
								countdownOutput(
									STRINGS.closedAbsolute[LANGUAGE] +
										STRINGS.on[LANGUAGE] +
										STRINGS.weekdays[openingNext.day][LANGUAGE] +
										STRINGS.at[LANGUAGE] +
										openingNext.openingTime +
										'.',
								);
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
	let getData = async function () {
		'use strict';

		let weeks = 20;
		let iid = libCalInstanceId;

		/**
		 *  ## Get Weekday
		 *  Translates the position in the array to the name of the weekday.
		 *
		 *  @private
		 *  @param {Number} weekdayNumber
		 *  @returns {String} Weekday
		 */
		let getWeekday = function (weekdayNumber) {
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
				case 6:
					day = 'Sunday';
					break;
			}
			return day;
		};

		let fetchData = async function () {
			const normalizeData = (data) => {
				let response = {};

				// Loop through all the weeks.
				response.weeks = [];
				for (let w = 0; w < data.length; w += 1) {
					let currentWeek = {};

					currentWeek.weekNumber = new Date(data[w].Monday.date).getWeek();
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
							note = note.length === 1 ? [note[0], note[0]] : note;
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
					localStorage.setItem(
						cacheName,
						JSON.stringify({
							expires: expiryTime.toISOString(),
							data: data,
						}),
					);
				},
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
			if (
				document.readyState === 'complete' ||
				document.readyState === 'loaded' ||
				document.readyState === 'interactive'
			) {
				resolve(data);
			} else {
				document.addEventListener(
					'DOMContentLoaded',
					function () {
						resolve(data);
					},
					false,
				);
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
	let setLanguage = function (lang) {
		LANGUAGE = lang;
		('use strict');
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
				console.error(
					'[Opening Hours]',
					'iid parameter needs to be set as the number of the LibCal instanceId to display hours from.',
				);
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
})();
