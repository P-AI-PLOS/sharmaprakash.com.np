---
title: Solution to warning Unresolved specs during Gem::Specification.reset
categories: 
directory:
excerpt: how to solve warnings you get as you upgrade Jekyll
tags:
  - jekyll
comments: true
share: true
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-02-06-unresolved-gem-specification.png"
thumb: "/images/blog/generated/thumbs/2016-02-06-unresolved-gem-specification.png"
date: "2016-02-06T14:40:14+05:45"
use_featured_image: true
---

Me: Hey! I upgraded my blog to use latest version of Jekyll.

Friend: So what! I am warning you for the last time don't ever give me such useless updates.

Me: Well why is that everybody loves warning me!

Friend: Who else warned you?

Me: Jekyll, I have been getting warnings since I upgraded to latest version.

Friend moves closer to my screen and shouts, "SHOW ME!".

```bash
# my screen looks like this:
$ jekyll s
WARN: Unresolved specs during Gem::Specification.reset:
      jekyll-watch (~> 1.1)
WARN: Clearing out unresolved specs.
Please report a bug if this causes problems.
Configuration file: /home/fleck/blog-new/_config.yml
            Source: /home/fleck/blog-new
       Destination: /home/fleck/blog-new/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 

```

Friend: This warning is not as scary as I am. Use `bundle exec jekyll s` instead.

I tried `bundle exec jekyll s` and it runs smoothly! But I am not satisfied! I want to run jekyll server like I used to: with no extra commands. No `bundle exec` for me! I look around and Friend was nowhere around to be seen. He has gone on his secret mission again!

I list all the gems installed in my system and realised there were 2 versions of jekyll-watch: 1.3.1 & 1.3.0. I uninstall jekyll-watch 1.3.0 and try to run jekyll server again. This time, I got another warning:

```bash
$ jekyll s
WARN: Unresolved specs during Gem::Specification.reset:
      listen (~> 3.0)
WARN: Clearing out unresolved specs.
Please report a bug if this causes problems.
Configuration file: /home/fleck/poudelprakash.github.io/_config.yml
            Source: /home/fleck/poudelprakash.github.io
       Destination: /home/fleck/poudelprakash.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
                    done in 1.839 seconds.
```

Ok, I got the pattern! `listen` too has 2 versions installed! I went on uninstalling older versions of `listen`, `rb-fsevent`, `red-carpet`. And then again ran `jekyll s`. It is running normally now.

```bash
$ jekyll s
Configuration file: /home/fleck/poudelprakash.github.io/_config.yml
            Source: /home/fleck/poudelprakash.github.io
       Destination: /home/fleck/poudelprakash.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
                    done in 1.811 seconds.
 Auto-regeneration: enabled for '/home/fleck/poudelprakash.github.io'
Configuration file: /home/fleck/poudelprakash.github.io/_config.yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

Friend is back now, he had actually gone to pee instead of on some sort of secret missions.

Friend: Let's end that warning now.

Me: I already did.

Friend: Really, how? 

Me: I was getting those errors because there were 2 versions of same gems installed and there was confusion on which gem to use. For eg: my `Gemfile.lock` says `jekyll-watch (>= 1.3)` could be used and there were two versions of jekyll-watch: 1.3.0 & 1.3.1.

Friend: So you removed lower version of the gem and there are no errors right?

Me: Yes.

Friend: But that is not permanent solution, why don't you run commands along with `bundle exec` and let bundler handle this instead?

Me: I don't like typing extra words! Hey, let's find out a way where we can leave this hassle to bundler but we won't need to type `bundle exec` everytime! 

Friend: I have heard about a plugin for `rbenv` that saves us from having to enter `bundle exec` inside a folder having `Gemfile`. It's name is [rbenv-bundler](rbenv-bundler). Let's try out. Here I found the installation instructions:

```bash
# install plugin
$ git clone -- https://github.com/carsomyr/rbenv-bundler.git ~/.rbenv/plugins/bundler
# cd to your project folder and enable rbenv bundler
$ rbenv bundler on

# This plugin is opt-in and can be disabled by typing
# $rbenv bundler off
```

Me: Wow! Worked like a charm!

Friend: Let's blog about it. Others may find it helpful, they may as well suggest us some other ways of achieving the same.

Me: Yea! Here we go.

Happy Learning! :)

References:

1. [Jekyll issues: jekyll broke after upgrade](jekyll-broke-after-upgrade)
2. [rbenv-bundler plugin](rbenv-bundler)

[jekyll-broke-after-upgrade]: https://github.com/jekyll/jekyll/issues/3084
[rbenv-bundler]: https://github.com/carsomyr/rbenv-bundler.git 
