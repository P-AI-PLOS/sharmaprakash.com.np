---
title: How to enable wifi when 'Enable Wifi' is disabled in linux GUI
categories: linux
directory: linux
excerpt: how to enable wifi when 'Enable Wifi' is disabled in linux GUI
tags:
comments: true
share: true
toc: true
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-02-05-troubleshoot-enable-wifi-disabled-in-linux.png"
thumb: "/images/blog/generated/thumbs/2016-02-05-troubleshoot-enable-wifi-disabled-in-linux.png"
date: "2016-02-05T21:32:30+05:45"
use_featured_image: true
---

## Ubuntu loves messing up!

This evening, when I reached my home and booted up my laptop I could not simply enable wifi! The option was disabled.

![wireless-diabled](/images/blog/wireless-disabled.png)

Last time I faced same problem, I had switched to windows 7 to search for solutions, but this time I had no other operating system installed in my machine. Also last time, I had to do nothing to solve this problem, just switching OS had automatically solved the problem. But this time, I really had to find solution. With a bit of searching, here is how my problem was solved.

## Solution

```bash
# step 1: run rfkill list all
$ rfkill list all
0: phy0: Wireless LAN
	Soft blocked: yes
	Hard blocked: no
1: hci0: Bluetooth
	Soft blocked: no
	Hard blocked: no

# step 2: ublock the wireless LAN
$ rfkill unblock 0
```

Just running 2 commands solved the problem. Hope this will be helpful to you too.
