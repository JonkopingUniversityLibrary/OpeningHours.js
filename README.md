OpeningHours.js
===============

Dependencies
------------

*   Springshare's LibCal _(For the API and data)_

How to include
--------------

Script can be included either in `<head>` or just before closing `</body>`, the script will always wait for DOM to load before running.

First argument should be the instance id of your LibCal hours instance.

    <script>
        OpeningHours.initialize(3237);
    </script>

It also takes an optional language argument in 2 letter language code, if not set defaults to english (`'en'`).

    <script>
        OpeningHours.initialize(3237, 'sv');
    </script>

With the `<script>` included you then add elements will specific classes to display the opening hours in various places.

Hours as a sentence
-------------------

This will display hours as a sentence which changes based on time of day. For example if it is currently open or if just before opening or if it is about to close.

Can be displayed an `n`\-number of times per page.

<div class="oh-opening-hours">
    <p class="oh-countdown"></p>
</div>

Current week
------------

Can be displayed an `n`\-number of times per page.

Any code can be included in the `.oh-week`\-element as that will get replaced. For example if you want to display your standard hours for those without JavaScript.

<div class="oh-opening-hours">
    <ul class="oh-week"></ul>
</div>

Monthly calendar widget
-----------------------

Only `1` can be displayed per page due to interactivity.

Accessible with keyboard navigation and screen readers.

<div class="oh-opening-hours">
    <div class="oh-calendar" id="oh-calendar"></div>
</div>