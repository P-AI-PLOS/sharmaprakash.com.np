---
title: Solving screen flickering issue in freshly installed ubuntu
categories: linux
directory: linux
excerpt: How to stop your flickering screen in freshly installed ubuntu
tags: 
comments: true
share: true
date: "2017-07-07T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2017-05-30-flickering-screen-chrome-ubuntu.png"
thumb: "/images/blog/generated/thumbs/2017-05-30-flickering-screen-chrome-ubuntu.png"
use_featured_image: true
---

Recently I upgraded my ubunutu to 17.04. After few minutes with this new os, I started noticing that my screen was flickering.
At first, I thought it was problem in new os but soon came to notice that it occured only when chrome was open.

If you also happen to bump into such issue after installing chrome in freshly setup ubuntu machine, You can solve this problem by disabling hardware acceleration for your browser.

You can follow following steps to disable hardware acceleration:

Settings > Advance Settings > System > uncheck the hardware acceleration.

References:

1. <https://askubuntu.com/questions/766725/annoying-flickering-in-16-04-lts-chrome>
