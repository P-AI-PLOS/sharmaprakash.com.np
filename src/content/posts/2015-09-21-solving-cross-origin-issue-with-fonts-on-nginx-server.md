---
title: "Solving Cross-origin Issue With Fonts on Nginx Server"
category: ['Devops']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
categories: devops
directory: devops
excerpt: In this post we learn to setup nginx to allow embedding font from 3rd party url in our rails app.
tags:
  - nginx
  - cors
  - rails
comments: true
share: true
date: "2015-09-21T19:38:15+05:45"
show_category_hero_image: false
---

​When using Webfonts via `@font-face` or other CSS3 methods, some browsers like Firefox and IE will refuse to embed the font when it’s coming from a 3rd party URL because it’s a security risk. The solution is very simple, just add a few lines in your `nginx.conf` file to permanently solve the problem.

```nginx
location ~ \.(ttf|ttc|otf|eot|woff|woff2|font.css|css|js)$ {
  add_header Access-Control-Allow-Origin "*";
}
```

Compiled from: <a href=https://www.maxcdn.com/one/tutorial/how-to-use-cdn-with-webfonts/ rel="nofollow" target="_blank">how to use cdn with webfonts</a>