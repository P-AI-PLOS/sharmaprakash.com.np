---
title: Making Rbenv Work With Zsh
categories:
directory:
excerpt: Making Rbenv Work With Zsh
tags:
  - rbenv
  - ruby
  - shell
comments: true
share: true
date: "2016-03-01T01:13:36+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

I have heard lots of great things about `zsh`. I had already installed `zsh` in my system and tried out few times.

But I had not yet thought of using it as my default shell. Today, I decided to switch my default shell to `zsh`. 

Every new adoption comes with some learning experience. `Zsh` has already come up with first challenge for me: 

**My `rbenv` stopped working!**

I would set my default ruby version to 2.3.0 and switch to some project folder and do `ruby -v` and it would show `1.9.3-p374` as my ruby versions.

I copied some of my config from `.bashrc` to `.zshrc` with the hope to solve this problem.

~~~ bash
# rbenv settings
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"
~~~

But then I started getting error everytime I opened new terminal:

~~~ bash
/home/fleck/.rbenv/libexec/../completions/rbenv.bash:16: command not found: complete
~~~

I searched a bit and found that I need to update my rbenv settings from `eval "$(rbenv init -)"` to `eval "$(rbenv init - zsh)"` in order to work normally.

With this change, My rbenv started working normally. Here is how my `rbenv` settings in `.zshrc` file looks like currently:

~~~bash
# rbenv settings
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - zsh)"
export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"
~~~

Hope this helps you too.

Happy Learning!

References:

1. [rbenv with zsh](https://github.com/rbenv/rbenv/issues/487)
