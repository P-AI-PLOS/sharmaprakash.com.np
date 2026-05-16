---
title: install hipchat in ubuntu 16.04
categories: linux 
directory: linux
excerpt: how to install hipchat in ubuntu 16.04
tags:
comments: true
share: true
date: "2016-05-10T07:51:29+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-05-10-install-hipchat-in-ubuntu16.png"
thumb: "/images/blog/generated/thumbs/2016-05-10-install-hipchat-in-ubuntu16.png"
use_featured_image: true
---

Upgraded to ubuntu 16.04? chances are high that you have already faced problem while trying to install `hipchat` as steps listed in official site is of no help.

The script below will help you install older version of `hipchat`(i.e `2.2.1`).
 
```bash
sudo su
echo "deb http://downloads.hipchat.com/linux/apt stable main" > \
/etc/apt/sources.list.d/atlassian-hipchat.list
wget -O - https://www.hipchat.com/keys/hipchat-linux.key | apt-key add -
apt-get update
apt-get install hipchat
```

In case you want to install latest version, you may install `hipchat4` but it won't even remember your credentials once you quit. To install `hipchat4` you need to run following script:

```bash
wget https://atlassian.artifactoryonline.com/atlassian/hipchat-apt-client/pool/HipChat4-4.0.1517-Linux.deb
sudo dpkg -i HipChat4-4.0.1517-Linux.deb
```

References:

- <a href=https://gist.github.com/stephou0104/4a4f83d6d973a1999a76 rel="nofollow" target="_blank">https://gist.github.com/stephou0104/4a4f83d6d973a1999a76</a>
- <a href=http://askubuntu.com/questions/763391/how-do-i-install-hipchat-on-ubuntu-16-04 rel="nofollow" target="_blank">http://askubuntu.com/questions/763391/how-do-i-install-hipchat-on-ubuntu-16-04</a>
