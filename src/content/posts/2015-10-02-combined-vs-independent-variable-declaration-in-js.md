---
layout: single
title: "Debate: combined vs independent variable declaration in js"
category: ['Javascript']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
categories: javascript
directory:  javascript
excerpt: Debate regarding combined variable declaration and individual variable declaration in js.
tags:
comments: true
share: true
date: "2015-10-02T14:00:30+05:45"
show_category_hero_image: false
---

It is regarded as good practice to declare all variables at the top. It is believed that this practice will make it easier while searching for variable declarations and may also help in avoiding multiple declarations in a long file.

```javascript
var someItem = 'some string';
var anotherItem = 'another string';
var oneMoreItem = 'one more string';
```

And it is regarded best practice to omit the `var` keyword and use commas instead. I doubt there's any real speed improvements here, but it cleans up your code a bit.

```javascript
var someItem = 'some string',
    anotherItem = 'another string',
    oneMoreItem = 'one more string';
```

<BlogDetailsNoticeWrapper class="notice block">
<strong>update: </strong> This practice is preferred by jshint. <strong>ref: </strong> <a href='https://jslinterrors.com/combine-this-with-the-previous-var-statement' target="_blank" rel="nofollow">combine this with the previous 'var' statement</a>
</BlogDetailsNoticeWrapper>

But there is a huge debate regarding this. Let's look at a sample code below:

```javascript
var someItem = 'some string'
    anotherItem = 'another string',
    oneMoreItem = 'one more string';
```

Did you catch the problem above?  A lot of people wouldn't - it's easy to miss it at first glance.  While adding the initial assignments, we "accidentally" lost a comma at the end of the `someItem` declaration.

But that typo isn't as interesting as the bug it'll cause.  In JavaScript, semicolons should be added at the end of every statement, but they're not required.  The code above will generate no error messages, no warnings...but it will create a serious bug.

Because the line `var someItem = 'some string'` is valid JavaScript even without the trailing comma, the parser will go ahead and "insert" a semicolon for you.  By doing this, it effectively interprets the code as:

```javascript
var someItem = 'some string';
    anotherItem = 'another string',
    oneMoreItem = 'one more string';
```

This breaks the `anotherItem` and `oneMoreItem` declarations into a separate statement, and these are now variable declarations *without the `var` keyword*.  Those variables will now be *ejected into the global namespace*, regardless of how you tried to scope them.

References:

- <a href="http://code.tutsplus.com/tutorials/24-javascript-best-practices-for-beginners--net-5399" rel="nofollow" target="_blank">24 Javascript best practices for beginners</a>
- <a href="https://github.com/stevekwan/best-practices/blob/master/javascript/best-practices.md" rel="nofollow" target="_blank">Pragmatic Standards: JavaScript Coding Standards and Best Practices </a>

