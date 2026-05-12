---
title: How to install guake dropdown terminal in ubuntu
categories: linux
directory: linux
excerpt: How to install guake dropdown terminal in ubuntu
tags: guake setup, dropdown terminal in ubuntu
comments: true
share: true
date: "2017-07-07T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Guake is a drop-down terminal for GNOME Desktop Environment.
Like similar terminals, it is invoked with a single key, and hidden by pressing the same key again.

## Install guake

We can install guake by entering following commands in the terminal. Here we first add webupd6team ppa which maked guake available for us.
Then we run `apt-update` and finally are able to install guake.

```sh
sudo add-apt-repository ppa:webupd8team/unstable
sudo apt update
sudo apt install guake
```

## Setup guake to automatically start at login

We have our dropdown terminal installed but we don't want to search for this app and click to start; each time we start our devlopment machine.

To make guake automatically start at startup we need to create startup entry for this app.
We can do this by entering following commands in the terminal.

```sh
sudo ln -s /usr/share/applications/guake.desktop /etc/xdg/autostart/
```
References:

1. <http://sourcedigit.com/20525-install-guake-drop-down-terminal-on-ubuntu-16-04/>
2. <https://askubuntu.com/questions/368705/how-to-make-guake-start-at-login>
