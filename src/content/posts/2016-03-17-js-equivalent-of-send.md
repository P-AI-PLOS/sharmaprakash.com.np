---
title: Js Equivalent of Ruby send method
categories: javascript
directory: javascript
excerpt: js equivalent of ruby send method
tags:
comments: true
share: true
date: "2016-03-17T14:08:00+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-03-17-js-equivalent-of-send.png"
thumb: "/images/blog/generated/thumbs/2016-03-17-js-equivalent-of-send.png"
use_featured_image: true
---

Do you remember we talked about ruby's send method [here]({{ site.url }}/using-send-method-in-ruby-to-refactor-conditional/). It is used to call a ruby function from string having same value as function name.

There is js equivalent of the same:

~~~js
// defining the function
var apple = function(){
	console.log('apple');
}

eval('apple()') // => apple
~~~

Reference:

1. <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval>
2. <http://www.2ality.com/2014/01/eval.html>
