---
title: Display Current Branch Name in Terminal
categories: linux
directory: linux
excerpt: Display Current Branch Name in Terminal
tags:
comments: true
share: true
date: "2015-11-10T08:21:32+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

To show current branch name in terminal first open `~/.bashrc` in any of your favourire text editor

`sudo nano ~/.bashrc`

then add the following code at the end of file.

```bash
# display the current branch name in the terminal
function parse_git_branch () {
git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

RED="\[\033[0;31m\]"
YELLOW="\[\033[0;33m\]"
GREEN="\[\033[0;32m\]"
NO_COLOR="\[\033[0m\]"

PS1="$GREEN\u@\h$NO_COLOR:\w$YELLOW\$(parse_git_branch)$NO_COLOR\$ "
```
