---
layout: single
title: History With Terminal
categories: linux
directory:  linux
excerpt: some handy history commands in terminal
tags:
author:
comments: true
share: true
date: "2015-10-12T21:02:26+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Let's learn some cool command line shortcuts to better utilise our history.

## rerun the command you just typed with root access

Have you ever been unlucky to enter a command and realise that you have forgotten to enter sudo and command failed?

`sudo !!` will run your last used command with root privileges.

![sudo the expert way](/images/blog/sudo-expert-way.png)

## little old history
If the command you want to run is a bit further back in your history, you can use the bang in conjunction with the original string to find it. For example, if you want to run the last command that used cat, you could just type: `!cat`

If you just want to see what the last cat command was, you can instead run: `!cat:p`

This will print that command and add it to the end of your history. If you decide you then want to run it, you can just type `!!` and hit Enter.

## reusing the argument with !$
If you want to run a different command that you ran last, but with the same argument, there's a shortcut for that too. For example, say you had just created a folder using:

`mkdir /new/awesome/folder`

To then cd into that directory, you could just type: `cd !$`. The `!$` represents the arguments from your last command.

## correcting your typo
Another common problem is mistyping the command you want to run. Say you wanted to run `nano`, but accidentally typed `nanp`: `nanp /path/to/a/document/buried/deep/in/the/filesystem`

Instead of retyping the whole thing, you could just run:

`^nanp^nano`

This will find the first instance of `nanp` in the last run command and replace it with `nano`.

## digging your history
While all these shortcuts are fine and dandy, but it's worth mentioning that the `history` command is your friend. If you want to see all the recent commands you ran that included `nano`, for example, you could just run:
`history | grep nano`
You'll get a list that looks something like this:

```bash
381 sudo nano /etc/NetworkManager/nm-system-settings.conf
387 sudo nano /etc/rc.conf
388 sudo nano /etc/rc.conf
455 sudo nano /boot/grub/menu.lst
```

You can then pick a command out from that list—say I want to run `sudo nano /boot/grub/menu.lst`, which grep lists as command `455`—and run it using: `!455`
