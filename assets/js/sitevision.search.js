function strip(html){
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}


//Google analytics code
if(typeof ga != typeof Function){
	var ga = function(){ return; }
}

function recordOutboundLink(link, category, action){
	ga('send', 'event', category, action);
    setTimeout('document.location = "' + link.href + '"', 100);
}

function recordOutboundForm(el, category, action){
	ga('send', 'event', category, action);
	setTimeout(function(){ el.submit(); },100);
}

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

var jul = {

	local: {
		sv: {
			ajaxDBNoResults1: "Inga databaser pÃ¥trÃ¤ffades. SÃ¶k efter ",
			ajaxDBNoResults2: " i Primo"
		},
		en:{
			ajaxDBNoResults1: "No databases found. Search for ",
			ajaxDBNoResults2: " in Primo"
		}
	},

	scrollTo: function(container,target,direction){
		if(!target.length) return;
		if(direction == "down"){
			if(container.height() < ( target.offset().top - container.offset().top + target.height() ) ){
				//Move scrollbar down.
				container.scrollTop( container.scrollTop() +  target.height() );
			}
			else if(!target.prev().length){
				//Target is the first element. Move scrollbar to the top.
				container.scrollTop( 0 );
			}
		}
		else if(direction == "up"){
			if(target.offset().top < (container.offset().top)){
				//Move scrollbar up.
				container.scrollTop( target.offset().top - container.offset().top + container.scrollTop() );
			}
			else if(!target.next().length){
				//Target is the last element. Move scrollbar to the bottom.
				container.scrollTop( container[0].scrollHeight );
			}
		}
		else {
			container.scrollTop( target.offset().top - container.offset().top + container.scrollTop() );
		}
	},

	AJAXAutocomplete: function(searchfield,acWrapper,baseURL,lang,callbackIfNoMatches){

		this.searchfield = $(searchfield);
		this.acWrapper = $(acWrapper);
		this.baseURL = baseURL;
		this.callbackIfNoMatches = callbackIfNoMatches || false;
		this.timestamp; //Used to store timestamp, which we use to avoid unwanted event handling.

		this.fetchServerMatches = function(query, callbackOnSuccess){

			var query = strip(query);

			//Make request to server and fetch data.
			$.ajax({
				url: this.baseURL+"?query="+query+"&lang="+lang+"&jsoncallback=?",
				dataType: 'json',
				context: this,
				success: function(ajaxMatches){
					callbackOnSuccess.call(this, ajaxMatches);
				}
			});
		}

		this.appendMatchesToAutoCompleteList = function(ajaxMatches){
			for(var i = 0; i<ajaxMatches.length; i++){
				$(ajaxMatches[i]).appendTo(this.acWrapper);
			}
		}

		this.buildAutoCompleteList = function(ajaxMatches){
			this.acWrapper.empty();

			if(ajaxMatches.matches.byTitle != undefined){
				this.appendMatchesToAutoCompleteList(ajaxMatches.matches.byTitle);
			}

			this.acWrapper.find(".ajax-match").filter(":even").addClass("even");

			if(this.acWrapper.find(".ajax-match").length == 0 && this.callbackIfNoMatches){
				this.callbackIfNoMatches.call(this);
			}

			this.acWrapper.show();
		}

		this.showAutocomplete = function(query, reload){

			var query = strip(query);

			//The reload argument provides a means to avoid unneccessary server calls, for instance in situations where the search string has not changed.
			//It should be optional. If provided, use the set value. Otherwise, set it to true.
			var reload = (reload === undefined) ? true : reload;

			if(reload){
				this.acWrapper.empty().hide();
				this.fetchServerMatches(query, this.buildAutoCompleteList);
			}
			else{
				if(this.acWrapper.find(".ajax-match").length > 0){ this.acWrapper.show(); }
			}
		}

		this.bindEvents = function(){
			//Store the context of "this" in a new variable, as IE has some problem with binding "this".
			var that = this;

			//Hide AJAX autocomplete list?
			$("body").click(function(e){
				var target = $(e.target);
				//If the clicked target is neither the searchfield nor the autocomplete-list.
				if(target.attr("id") != that.searchfield.attr("id") && !target.hasClass("autocomplete")){
					$(".autocomplete").hide();
				}
			});

			//Attach events to the textfields.
			this.searchfield.bind({
				focus: function(e){
					if($(e.target).val() != ""){
						that.showAutocomplete($(e.target).val(), that.source);
					}
				},
				//AJAX Autocomplete behaviour and navigation.
				keyup: function(e){ //Used to navigate in the AJAX auto complete list.
					var currentSelection = that.acWrapper.find(".selected");

					//When did the event occur?
					that.timestamp = new Date().getTime();

					if(e.which == 38){ //Uparrow was depressed
						if(currentSelection.length == 0){
							//No element selected. Select last.
							that.acWrapper.find("div").last().addClass("selected");
						}
						else{
							currentSelection.removeClass("selected");
							if(currentSelection.prevAll(".ajax-match").length > 0){
								currentSelection.prevAll(".ajax-match").first().addClass("selected");
							}
							else{
								that.acWrapper.find("div").last().addClass("selected");
							}
						}
						jul.scrollTo(that.acWrapper,that.acWrapper.find(".selected"),"up");
					}
					else if(e.which == 40){ //Downarrow was depressed.
						if(currentSelection.length == 0){
							//No element selected. Select first.
							that.acWrapper.find("div.ajax-match").first().addClass("selected");
						}
						else{
							currentSelection.removeClass("selected");
							if(currentSelection.nextAll(".ajax-match").length > 0){
								currentSelection.nextAll(".ajax-match").first().addClass("selected");
							}
							else{
								that.acWrapper.find("div.ajax-match").first().addClass("selected");
							}
						}
						jul.scrollTo(that.acWrapper,that.acWrapper.find(".selected"),"down");
					}
					else if(e.which != 16 && e.which != 17){ //Do not trigger autocomplete if shift or ctrl was depressed.
						that.showAutocomplete($(e.target).val(),that.source);
					}
				}
			});

			//Use delegate to bind events to elements existing both in the present and future.
			this.acWrapper.delegate(".ajax-match", "mouseenter", function(e){
				//When did the event occur?
				if(new Date().getTime() - that.timestamp < 400){
					//Exit if the mouseenter event occured within 400 ms of the keydown event.
					return;
				}

				that.acWrapper.find(".selected").removeClass("selected");
				//Make sure the target element is the ajax-match main element, and not one of its childs.
				var target = ($(e.target).hasClass("ajax-match")) ? $(e.target) : $(e.target).parents(".ajax-match"); 
				target.addClass("selected");
			});

			this.acWrapper.delegate(".ajax-match", "mouseleave", function(e){
				$(this).removeClass("selected");
			});
		};

		this.bindEvents();

	}
};

$(document).ready(function(){

	//Manage helptexts using the In-Field Labels jQuery Plugin from http://fuelyourcoding.com/scripts/infield/
	$("#search-feature-outer-wrapper .sf-searcharea .input-wrapper label").show().inFieldLabels({ fadeDuration: 0, fadeOpacity: 1 });

	//$("#searchfield-primo").focus(); //Focus the active search!!!!

	var sfDefaultValue = $.cookie("sf-default-value");
	if(sfDefaultValue){
		$("#sf-remember-choice").attr("checked",true); //attr() should be prop() in jQuery > 1.6
	}

	var manageSfCookie = function(service){
		if($("#sf-remember-choice").is(":checked")){ //use prop() in jQuery > 1.6
			$.cookie("sf-default-value", service, { expires: 30 });
		}else{
			$.removeCookie("sf-default-value");
		}
	}

	//Toggle search form.
	var toggleSearchForm = function(target,service){
		//Hide all searchareas and displays.
		$(".sf-searcharea, .sf-options-display").hide();

		//Reveal the searcharea whose ID corresponds to the data-service-attribute of the clicked link.
		$("#"+service).show().find("input").focus();
		$(".sf-options-display[data-service="+service+"]").css("display","block");

		//Remove the class "selected" from all list items in the navigation, and add it to the currently selected one.
		target.parents("ul").find("li").removeClass("selected");
		target.addClass("selected");

		manageSfCookie(service);
	}

	//Logic for cookies and bookmarks
	var currentUrl = document.location.href;
	if(currentUrl.indexOf("#books") !== -1){
		toggleSearchForm($("#sf-options-popout li[data-service=sf-primo-books]"),"sf-primo-books");
	}else if(currentUrl.indexOf("#articles") !== -1){
		toggleSearchForm($("#sf-options-popout li[data-service=sf-primo-articles]"),"sf-primo-articles");
	}else if(currentUrl.indexOf("#journals") !== -1){
		toggleSearchForm($("#sf-options-popout li[data-service=sf-journals]"),"sf-journals");
	}else if(currentUrl.indexOf("#databases") !== -1){
		toggleSearchForm($("#sf-options-popout li[data-service=sf-databases]"),"sf-databases");
	}else{
		if(sfDefaultValue ==  "sf-primo-books"){
			toggleSearchForm($("#sf-options-popout li[data-service=sf-primo-books]"),"sf-primo-books");
		}else if(sfDefaultValue == "sf-primo-articles"){
			toggleSearchForm($("#sf-options-popout li[data-service=sf-primo-articles]"),"sf-primo-articles");
		}else if( sfDefaultValue == "sf-journals"){
			toggleSearchForm($("#sf-options-popout li[data-service=sf-journals]"),"sf-journals");
		}else if( sfDefaultValue == "sf-databases"){
			toggleSearchForm($("#sf-options-popout li[data-service=sf-databases]"),"sf-databases");
		}else{
			toggleSearchForm($("#sf-options-popout li[data-service=sf-primo-all]"),"sf-primo-all");
		}
	}

	var popoutShouldOpenAbove = function(){
		if($("#sf-options-desktop").offset().top - ($(window).scrollTop() + 125) > $("#sf-options-popout").height()){
			return true;
		}
		return false;
	}

	$("#sf-options-desktop").click(function(e){
		e.stopPropagation();

		var optionsPopout = $("#sf-options-popout");
		if(!optionsPopout.is(":visible")){
			if(popoutShouldOpenAbove()){
				$("#sf-options-popout")
				.addClass("above")
				.removeClass("below")
				.css({
					top: "auto",
					bottom: "74px"
				});
			}else{
				$("#sf-options-popout")
				.addClass("below")
				.removeClass("above")
				.css({
					top: "74px",
					bottom: "auto"
				});
			}
			optionsPopout.show();
		}
		else{
			optionsPopout.hide();
		}
	});

	$(document).click(function(e){
		$("#sf-options-popout").hide();
	});

	//Setup navigation.
	$('#sf-options-popout a').click(function(e){
		var target = $(e.target).parent("li");
		var service = target.attr("data-service");

		toggleSearchForm(target,service);
	});

	$("#sf-remember-choice").change(function(){
		manageSfCookie($("#sf-options-popout li.selected").attr("data-service"));
	});

	$('#sf-options-popout input, #sf-options-popout label').click(function(e){
		e.stopPropagation();
	});

	//And for mobile, using select box.
	$('#sf-options-mobile select').change(function(e){
		var target = $(e.target).find('option').filter(':selected');
		var service = target.attr("data-service");

		toggleSearchForm(target,service);
	});


	//Instantiate Auto Complete list for Databases.
	var dbAutoComplete = new jul.AJAXAutocomplete(
		"#searchfield-databases",
		"#autocomplete-db",
		"http://julius.hj.se/dblist/search-ajax.php",
		sfLang,
		function(){
			$("<div class='ajax-match'><a href='http://primo-p-jul.hosted.exlibrisgroup.com/primo_library/libweb/action/dlSearch.do?institution=JUL&onCampus=false&vid=jul&group=GUEST&query=any,contains," + strip(this.searchfield.val()) +"'>" + jul.local[sfLang]['ajaxDBNoResults1'] + "<strong><em>" + strip(this.searchfield.val()) + "</em></strong>" + jul.local[sfLang]['ajaxDBNoResults2'] + "</a></div>").appendTo(this.acWrapper);
		}
	);

	//Controls the behaviour of the ener key. If the AJAX autocomplete list exists, and a value has been selected
	//via the up/down arrow, prevent enter key from submitting the form.
	$("#form-databases").bind("keydown", function(e){

		if($("#autocomplete-db div.selected").length === 1 && e.keyCode === 13){
			var current = $("#autocomplete-db div.selected");

			//GA-code
			ga('send', 'event', "SÃ¶kfunktion vald databas", current.text());
			setTimeout('document.location = "' + current.find("a").attr("href") + '"', 100);
			return false;
		}
	});

	$("#search-feature-outer-wrapper form").submit(function(e){
		//Prevents the form from being submitted, in order for Google Analytics to track the search
		e.preventDefault();

		//Gather statistics for Google Analytics. The GA-function submits the form
		recordOutboundForm(e.target, 'SÃ¶kfunktion startsida', $(this).attr("data-searchtype"));
	});
});