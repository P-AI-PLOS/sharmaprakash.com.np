---
layout: single
title: Basics of Writing a Jquery Plugin
categories: javascript
directory:  javascript
excerpt: basics of developing your own jquery plugin
tags: 'js best practices'
author:
comments: true
share: true
toc: true
date: "2015-10-10T20:40:50+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

## Background on jquery plugins

I am moving on with fair assumption that you have used jquery previously. You may have done something simple like `$('#element-id').hide()` numerous times. Let's look at how this could have been done in plain javascript if we were not using jquery.

```javascript
var $element = document.getElementById('element-id');
$element.style.display = 'none';
```

Imagine if we had to write 2 lines instead of that simple `$('element-id').hide()` everytime! This is simple example, in some other cases we might have to write numerous lines of code. Thanks to jquery, we can write easy to read simple code without going much into detail. Jquery provides numerous such functions but they are not always enough, there's where jquery plugins come into play. They extend jquery library to add some more functionality.

## Rules of a good plugin

1. plugin's internal functions should not conflict with other functions.
2. It should be chainable
3. **Single entry point:** Entry point of plugin should look like simple function that can be attached to output of jquery's dom selecter. eg: `$('#element-id').myPluginFunction();`. Here simply calling `myPluginFunction()` should start our plugin.

### 1. Developers love peace and no conflict

Imagine, you downloaded an awesome plugin that absolutely solved your problem but has many functions that conflicts with your own js functions and now whole app is broken! What would you do if you find the guy who made that plugin? Would you like to be that guy who makes such plugin?

We would never want our plugin's functions to conflict with other functions, so we will be wrapping our plugin inside anonymous function. So this would be our starting point:

```javascript
(function($) {

})(jQuery);
```

This function runs immediately and is passed jQuery as a parameter named ‘$’. Since ‘$’ is a local variable, we can assume that it always refers to the jQuery library rather than another library that grabbed the global ‘$’ variable first.

With simple function above our plugin will safely stay outside global namespace and avoid colliding with other JavaScript on the page.

I think it would be better to explain rule no 2 and 3 later when we develop our plugin.

## Let's start Development

We will be developing a simple plugin that changes color of all the text for the acted upon elements to green. We will improvise it to accept options.

### Naming the file

It’s traditional to start our filename with “jquery,” followed by the actual plugin name, so we’ll call this “jquery.greenify.js”.

### greenify

```javascript
(function($) {

	$.fn.greenify = function() {
	    this.css( "color", "green" );
	};

}(jQuery));

// basic usage
$( "a" ).greenify(); // Makes all the links green.
```

Typical jQuery object will contain references to any number of DOM elements, and that's why jQuery objects are often referred to as collections. If we want to do any manipulating with specific elements (e.g. getting a data attribute, calculating specific positions) then we need to use .each() to loop through the elements.

```javascript
(function($) {

	$.fn.greenify = function() {
	    this.each( function() {
        	$(this).css("color", "green");
        	});
	};

}(jQuery));

// basic usage
$( "a" ).greenify(); // Makes all the links green.
```

### making chainable
This works great but it is not chainable. `$( "a" ).greenify().hide;` won't work. Making it chainable is easy, we just need to add `return` statement in the function above.

```javascript
(function($) {

	$.fn.greenify = function() {
	    return this.each( function() {
        	$(this).css("color", "green");
        	});
	};

}(jQuery));

// basic usage
$( "a" ).greenify();

// Now our plugin method is chainable and this will work
$( "a" ).greenify().hide();
```

Notice that we return the results of `.each()` instead of returning `this`. Since `.each()` is already chainable, it returns `this`, which we then return. This is a better way to maintain chainability than what we've been doing so far.

### orangify
Till now our plugin is working perfectly fine. But suppose you want orange color instead of green. Let's extend this plugin a bit.

```javascript
(function($) {

	$.fn.greenify = function() {
	    return this.each( function() {
        	$(this).css("color", "green");
        	});
	};

	$.fn.orangify = function() {
	    return this.each( function() {
        	$(this).css("color", "orange");
        	});
	};

}(jQuery));

$( "a" ).greenify(); // Makes all the links green.

$( "a" ).orangify(); // Makes all the links orange.

```

Great this works well too, but how many colors can we support like this? We are also violating *DRY* principle. This is not a good plugin as it has more than one entry point.

### colorify

Since we will now start supporting any color, let's call our plugin colorify instead.

```javascript
(function($) {

	$.fn.colorify = function(color) {
	    return this.each( function() {
        	$(this).css("color", color);
        	});
	};

}(jQuery));

$( "a" ).colorify('green'); // Makes all the links green.

$( "a" ).colorify('orange'); // Makes all the links orange.
```

Our plugin is *DRY* and we can support any color with those few lines of code. It won't change any color if no color is passed.

### Complete Customization

Now we will extend our plugin to also support changing background color.

```javascript
(function($) {

	$.fn.colorify = function(options) {

		// Establish our default settings
	    var settings = $.extend({
	        color               : null,
	        backgroundColor     : null
	    }, options);

	    return this.each( function() {
	    	if(settings.color){
	    		$(this).css("color", settings.color);
	    	}

	    	if(settings.backgroundColor){
	    		$(this).css("background-color", settings.backgroundColor);
	    	}

	    	});
	};

}(jQuery));

$( "a" ).colorify({
        color        		: 'blue',
        backgroundColor 	: 'orange'
    }); // Makes all the links blue with orange background.
```

Hope you learned the basics of writing jquery plugin. Leave your comments below for suggestions and feedback in the tutorial.

References:
- <a href=http://blog.teamtreehouse.com/writing-your-own-jquery-plugins rel="nofollow" target="_blank">http://blog.teamtreehouse.com/writing-your-own-jquery-plugins</a> ,
- <a href=https://learn.jquery.com/plugins/basic-plugin-creation/ rel="nofollow" target="_blank">https://learn.jquery.com/plugins/basic-plugin-creation/</a>,
- <a href=http://www.sitepoint.com/how-to-develop-a-jquery-plugin/ rel="nofollow" target="_blank">http://www.sitepoint.com/how-to-develop-a-jquery-plugin/</a>
