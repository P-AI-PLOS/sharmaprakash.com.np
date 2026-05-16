---
layout: single
title: List Node Packages Installed
categories: nodejs
directory: nodejs
excerpt: listing node packages installed in system
tags:
comments: true
share: true
date: "2015-11-05T19:16:11+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-11-05-list-node-packages-installed.png"
thumb: "/images/blog/generated/thumbs/2015-11-05-list-node-packages-installed.png"
use_featured_image: true
---

If you are only interested in the packages installed globally without the full TREE then:

`npm -g ls --depth=0`

or locally (omit -g) :

`npm ls --depth=0`

`npm list` also can be used instead of `npm ls`.Then code would look like:
`npm list -g --depth=0`

Excluding depth will give you tree to show all packages with their respective dependencies.
