---
layout: single
title: Setup Nodejs in Ubuntu
categories: nodejs
directory:  nodejs
excerpt: setup nodejs in ubuntu, avoid running npm as root
tags:
author:
comments: true
share: true
published: true
date: "2015-10-09T20:42:12+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-10-09-setup-nodejs-in-ubuntu.png"
thumb: "/images/blog/generated/thumbs/2015-10-09-setup-nodejs-in-ubuntu.png"
use_featured_image: true
---

This tutorial has been updated with installation instruction for nodejs6.

## Installation

To setup nodejs in ubuntu run following command

```bash
sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

First command adds nodejs repo to software sources. This might be helpful in getting update automatically whenever you run `sudo apt-get-update`. Second command is simply software installation command in ubuntu.

This will also install install npm. Now to install other node packages you can run command like `sudo npm install <package name>`.

### Locating node modules

Location of `node_modules` may be hard to find. Here is how I found out:

I listed all global node modules with this command: `npm list -g --depth=0'. Output was like:

```bash
/usr/lib
├── bower@1.5.3
├── express@4.13.3
├── gulp@3.9.0
├── npm@3.3.12
└── socket.io@1.3.7
```

First line tells the location of node modules, which was `/usr/lib`.

## Avoid running npm as root

Recently I ran into problem where running npm with sudo command would do nothing and npm command without sudo would not install packages either. Thus I thought of changing owner of node modules to myself so that I need not use npm as root user. Turned out that; not running npm as root user is actually a good practice. So here is what can be done, second method is my preferred one as I don't format my `/home` folder when I format or fresh install newer ubuntu versions and I wont need to reinstall global node packages later.

### option1: Change the permission to npm's default directory

```bash
sudo chown -R `whoami` /usr/lib/node_modules/
```

### option 2: Change npm's default directory to another directory
```bash
# make a directory for global installations:
mkdir ~/.npm-global
# configure npm to use the new directory path:
npm config set prefix '~/.npm-global'
# Open or create a ~/.profile file and add this line:
export PATH=~/.npm-global/bin:$PATH
# Back on the command line, update your system variables:
source ~/.profile
```

Now we no longer need to run npm with sudo command. This can be tested with following command:

```bash
npm install -g jshint
```

References:

- <a href="https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions" rel="nofollow" target="_blank">nodejs installation instructions</a>
- <a href=https://docs.npmjs.com/getting-started/fixing-npm-permissions rel="nofollow" target="_blank">fixing npm permissions</a>
