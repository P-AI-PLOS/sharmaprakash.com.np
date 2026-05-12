---
layout: single
title: Js Debugger
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
categories: javascript
directory:  javascript
excerpt: debugger is a great tool in js that provides breakpoint in your code so that you can easily debug your code
tags:
author:
comments: true
share: true
date: "2015-10-05T23:09:10+05:45"
show_category_hero_image: false
---

## Bit of personal history, skip with pleasure

I remember my time when I used to write php codes, everytime I needed to debug I would `echo` whatever variable was there. Debugging has been quite easy since i have switched to rails, just simple `binding.pry` in a code and server stops there and let's me debug my code.

Previously, probably influenced by my past habit with php of printing everything to screen with echo, I would use `console.log();` in js to print variables and see if anything went wrong. I would sometimes wish if there was something like `binding.pry`. Then I realised js has `debugger` that works just like `binding.pry`.

## Debugger

>The `debugger` statement is used to tell the JavaScript engine to open a debugger if one is available and treat the statement as a breakpoint. <a href=http://es5.github.com/#x12.15 rel="nofollow" target="_blank">ES5 12.15</a>

As mentioned above, your code will stop at `debugger` if your console is open in browser. Then you can use console for debugging purposes. But can you guess what will happen if you push your code containing debugger? It is probably the worst way you can show your carelessness.

Jshint to the rescue shows <a href=https://jslinterrors.com/all-debugger-statements-should-be-removed rel="nofollow" target="_blank">Unexpected 'debugger'</a>. It is regarded as best practice to remove all `console.log();` and `debugger;` from the code before sending pull request to ensure they never reach production environment.
