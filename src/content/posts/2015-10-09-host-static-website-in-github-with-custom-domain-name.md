---
layout: single
title: Host Static Website in Github With Custom Domain Name
categories:
directory:
excerpt: how to host static site in github with custom domain name
tags:
author: prakash_poudel
comments: true
share: true
published: false
date: "2015-10-09T21:06:47+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

 create a file called `CNAME` and write name of your site there. For me it was `www.sharmaprakash.com.np
`.
 Make a repo with your username.github.io
 push your jekyll site to this repo

go to your domain name provider and create `A` record to point to github.com.

congrats!
