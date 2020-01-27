<link rel="stylesheet" href="http://julius.hj.se/openinghours/assets/css/style.css">
<script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="http://julius.hj.se/openinghours/assets/js/moment.js"></script>
<script src="http://julius.hj.se/openinghours/assets/js/async.js"></script>
<script src="http://julius.hj.se/openinghours/assets/js/openingHours.js"></script>
<aside class="oh-opening-hours oh-web">
    <input id="oh-opening-hours-date" type="date" value="2015-07-17">
    <input id="oh-opening-hours-time" type="text" placeholder="14:58">
    <select id="oh-opening-hours-language">
        <option value="sv" selected>Svenska</option>
        <option value="en">English</option>
    </select>
    <input value="Ändra nuvarande klocka & datum" type="button" onclick="getOpeningHours('print',2,openingNext);">
    <p class="oh-todays-hours" id="oh-todays-hours"></p>
    <ul class="oh-days">
        <li class="oh-day">
            <span class="oh-day-label">Måndag</span>
            <span class="oh-day-hours" data-state="open"><span class="oh-opening">10:00</span> - <span class="oh-closing">16:00</span></span>
        </li>
        <li class="oh-day" current-day>
            <span class="oh-day-label">Tisdag</span>
            <span class="oh-day-hours" data-state="open"><span class="oh-opening">10:00</span> - <span class="oh-closing">16:00</span></span>
        </li>
        <li class="oh-day">
            <span class="oh-day-label">Onsdag</span>
            <span class="oh-day-hours" data-state="open"><span class="oh-opening">10:00</span> - <span class="oh-closing">16:00</span></span>
        </li>
        <li class="oh-day">
            <span class="oh-day-label">Torsdag</span>
            <span class="oh-day-hours" data-state="open"><span class="oh-opening">10:00</span> - <span class="oh-closing">16:00</span></span>
        </li>
        <li class="oh-day">
            <span class="oh-day-label">Fredag</span>
            <span class="oh-day-hours" data-state="open"><span class="oh-opening">10:00</span> - <span class="oh-closing">16:00</span></span>
        </li>
        </li>
        <li class="oh-day">
            <span class="oh-day-label">Lördag</span>
            <span class="oh-day-hours" data-state="closed">Stängt</span>
        </li>
        <li class="oh-day">
            <span class="oh-day-label">Söndag</span>
            <span class="oh-day-hours" data-state="closed">Stängt</span>
        </li>
    </ul>
</aside>