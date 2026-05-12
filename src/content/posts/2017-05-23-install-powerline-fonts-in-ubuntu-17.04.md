---
title: Install powerline fonts in ubuntu 17.04
categories: linux
directory: linux
excerpt: Quickly install powerline fonts on ubuntu 17.04.
tags:
comments: true
share: true
date: "2017-05-23T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

<BlogDetailsNoticeWrapper class="notice--info block">
This post is by no means meant to be detailed instruction on zprezto or powerline. It is short note that will help you install fonts required to make powerline theme work with prezto. It also does not explain why something works and something doesn't.
</BlogDetailsNoticeWrapper>

New version of ubuntu, fresh install = Awesome.

Setup you machine with all the language and tools you need = Cumbersome.

Same story every time! Real panic begins when you can't get some damn small thing running and you can't remember what you did rights last time.
It happened to me today, I installed [prezto](https://github.com/sorin-ionescu/prezto) and then selected my favourite theme powerline.
Only to realise I also need to install fonts. Then I went on to install fonts from [powerline-fonts-repo](https://github.com/powerline/fonts).
After following all their instructions, fonts were not working.

I doubted if it was related to fact that my fonts were being installed on `~/.local/share/fonts`. I also searched for alternative way to install these fonts.
Many of them linked to <https://powerline.readthedocs.io/en/latest/installation/linux.html#fonts-installation> as preferred way.
I went on following the instructions and downloaded two files:

```sh
wget https://github.com/powerline/powerline/raw/develop/font/PowerlineSymbols.otf
wget https://github.com/powerline/powerline/raw/develop/font/10-powerline-symbols.conf
```
Now I had to install the fonts.But I was not happy with the instructions.
It asked to copy these fonts to `~/.fonts/` but `.fonts` folder was not in my home path yet. I didn't want to make a new path and move on with some configuration.
I wanted to install fonts to default directory. Thus I ended up running following commands:

```sh
# move font to valid font path
mv PowerlineSymbols.otf /usr/share/fonts/
# Update font cache for the path the font
fc-cache -vf /usr/share/fonts/
# Install the fontconfig file
mv 10-powerline-symbols.conf /etc/fonts/conf.d/
```
Then I opened a new terminal and it was working.

Did this work for you? Feel free to leave your views in comment box below.

References:
1. <a href=https://www.tecmint.com/powerline-adds-powerful-statuslines-and-prompts-to-vim-and-bash rel="nofollow" target="_blank">https://www.tecmint.com/powerline-adds-powerful-statuslines-and-prompts-to-vim-and-bash</a>
2. <a href=https://powerline.readthedocs.io/en/latest/installation/linux.html#fonts-installation rel="nofollow" target="_blank">https://powerline.readthedocs.io/en/latest/installation/linux.html#fonts-installation</a>