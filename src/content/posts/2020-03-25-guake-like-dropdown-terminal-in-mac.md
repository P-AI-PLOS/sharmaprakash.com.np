---
title: Guake like dropdown terminal in mac os with iterm2
categories:
  - technical
minute: 3
directory:
excerpt: Guake like dropdown terminal in mac os with iterm2
tags:
comments: true
share: true
date: "2016-08-19T07:51:29+05:45"
toc: true
header:
  og_image: /assets/images/posts/guake-like-terminal-mac/header.jpg
last_modified_at: "2020-03-26T12:30:29+05:45"
category: ['code-quality', 'technical']
cover: "/images/blog/tech-notes/dropdown-terminal-iterm2.png"
thumb: "/images/blog/tech-notes/dropdown-terminal-iterm2.png"
use_featured_image: true
---

<BlogDetailsNoticeWrapper class="notice--info block">
This article was updated on March 2020 for iterm2 version 3.3.9
</BlogDetailsNoticeWrapper>

Switching to new operating system comes with lots of nostalgic and uneasy feelings. Looking for similar experiences in new OS is quite common.

Dropdown terminal is one of the application developers switching from linux to macos miss the most. Though `guake` does not work with mac, Iterm2 can be configured to setup as dropdown terminal.

## Installation

Installing iterm2 is quite easy, you just need to visit their [site](https://www.iterm2.com/index.html) and click download button, unzip and run.

## Configure iterm2 as dropdown terminal
Configuring iterm2 as dropdown terminal is really easy as you just need to assign a hotkey to open iterm.

Following are the steps you need to follow:

### Go to iterm2 preference
Assuming you are now running iterm2; on the top left you will see iterm2 written just beside apple logo, click there and go to preference.

### Click on Profiles tab, and then select keys tab inside profiles

### Create a dedicated hotkey window
On the right bottom of this window you will see a botton that says `Configure hotkey window`.
Click on that and you will see a new window where you can configure hotkey(shortcut) for dropdown terminal.
![Configure Hotkey Screenshot](/images/blog/hotkey-window.png)

### Assign hotkey
(On a newly opened window)<br>
Click on input box on the side of HotKey and then click the combination you want to assign to open iterm2. My combination is `CRTL-~`.

![Assign Hotkey Screenshot](/images/blog/assign-hotkey.png)

That's it, now you can open drop down terminal with shortcut you assigned in last step. In my case it is `CRTL+~`.

## Setup iterm2 to start when your mac starts
### Goto System Preferences > User and groups > Login Items.
### Drag and drop iterm from applications folders to login items.
![Guake in login items Screenshot](/images/blog/iterm-login-items.png)

## Setup iterm2 to float over full screen apps (optional)
By default, iterm switches your workspace when you try to open it from full screen apps.
You can setup iterm to float over full screen apps with following steps:

### Enable the 'Hide iTerm2 from the Dock...' option from the Advanced menu in preferences
Preference -> Advanced -> Hide iTerm2 from the dock ... => set to Yes
### Configure your profile for all spaces:
Under preference -> profile -> window -> space : set to all spaces.
### Restart Guake
After restarting you should be able to use iterm also from full screen apps.

Did this work for you? Please leave your comments below.

**References:** <br/>
1. <a href=http://stackoverflow.com/questions/30850430/iterm2-hide-show-like-guake target="_blank" rel="nofollow">http://stackoverflow.com/questions/30850430/iterm2-hide-show-like-guake </a>
2. <a href=http://apple.stackexchange.com/questions/48796/iterm-as-a-slide-out-terminal-from-the-top-of-the-screen target="_blank" rel="nofollow">http://apple.stackexchange.com/questions/48796/iterm-as-a-slide-out-terminal-from-the-top-of-the-screen</a>
3. <a href=https://superuser.com/a/1149772 target="_blank" rel="nofollow">https://superuser.com/a/1149772</a>
