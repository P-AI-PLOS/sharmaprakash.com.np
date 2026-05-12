---
title: Alternative of .includes() in Internet Explorer
categories:
  - javascript,
  - technical
minute: 3
directory: javascript
excerpt: Alternative of .includes() in Internet Explorer
tags:
comments: true
share: true
date: "2016-07-04T07:51:29+05:45"
last_modified_at:
category: ['code-quality', 'technical']
cover: "/images/blog/blog2.png"
thumb: "/images/blog/blog2.png"
show_category_hero_image: true
---

For past 2 months I have been actively developing emberjs addon. As we near the release of this add-on, it is time for cross-browser testing(only time developer tests runs his app in Internet Explorer(IE)).

First feature we noticed that was not working in IE was search feature. It depended on `.includes()` function of js and we realised `.includes` was not supported in IE.

I had to write substitute of this function. This function basically did 2 things:

1. check if element is in array
2. check if 1 or more alphabets were in string

Solution I came up with was using `indexOf`, `indexOf` works both on string and array, if element is present it returns the position value and -1 otherwise.

My code looked like this:

```js
function includes(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}
```
I tested this function with following values:

```js
includes([1,2,3],2) //=> true
includes([1,2,3],'a') //=> false
includes("abc",'a') //=> true
includes("abc",'e') //=> false
```
Since this worked, I began replacing `.includes` with my own `includes` function and then realised in some places I had wanted negative of .includes(). I also wrote another function that would do exactly opposite and named it `doesNotInclude`. The function looked like this:

```js
function doesNotInclude(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos < 0) {
		returnValue = true;
	}
	return returnValue;
}
```

I had to support IE 10 and above and these functions are working well for me. Don't forget to tell me what would be your approach if you were in my place. Happy Coding!
