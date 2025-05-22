OpeningHours.js
===============

Dependencies
------------

*   Springshare's LibCal _(For the API and data)_

<h2>How to include</h2>
<p>Script can be included either in <code>&lt;head&gt;</code> or just before closing <code>&lt;/body&gt;</code>, the 
script will always wait for DOM to load before running.</p>
<p>First argument should be the instance id of your LibCal hours instance.</p>
<p>It also takes an optional language argument in 2 letter language code, currently compatible with english (<code>'en'</code>), swedish (<code>'sv'</code>).</p>
<pre><code>&lt;script&gt;
  OpeningHours.initialize(3237, 'sv');
&lt;/script&gt;</code></pre>

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