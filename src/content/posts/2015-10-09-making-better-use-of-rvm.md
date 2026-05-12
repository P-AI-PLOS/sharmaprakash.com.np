---
title: Making Better Use of Rvm
categories: ruby
directory:  ruby
excerpt: solving 'path is not properly set up' error
tags:
comments: true
share: true
toc: true
date: "2015-10-09T20:40:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

## quick tip

Make `.ruby-version` file with your desired ruby version and `.ruby-gemset` with your desired ruby gemset, preferably name of your app. This will automatically switch ruby version and gemset containing all your project related dependencies as soon as you switch to project's folder. No more error! no more warnings!

```bash
# this command below will create both .ruby-version and .ruby-gemset file
rvm --ruby-version --create use 2.2.3@my_app_name

# do this everytime you setup new project
```

## Background you can skip with pleasure

I have been using rvm since I started coding rails but never paid much attention to gemsets. I don't think anyone else would have paid much attention either if they were working on single project for 8 months which depends on one rails version and one ruby version. I would make new gemset to install new rails version. I don't know why I used to do that, but I used to think that was good practice.

This week I moved to new project...well projects actually. There are 4 projects to be maintained all at once. Their ruby version range from 1.9.3 to 2.2.2 and rails version from 3.2.12 to 4.2.14. And considering my last project to the list that must be in working state in my machine, count reaches 5.

## Problem caused by half baked solution

They all are projects written by smart guys and contain `.ruby-version` file in the root of folder so that you would be switched to right ruby version as soon as you enter the project's folder. That's cool but the problem was, there was warning:

```bash
Warning! PATH is not properly set up, '/home/prakash/.rvm/gems/ruby-1.9.3-p551@rails3212/bin' is not at first place,
         usually this is caused by shell initialization files - check them for 'PATH=...' entries,
         it might also help to re-add RVM to your dotfiles: 'rvm get stable --auto-dotfiles',
         to fix temporarily in this shell session run: 'rvm use ruby-1.9.3-p551@rails3212'.
```

I have seen this before and following the solution had worked,so I try it again:

```bash
rvm get stable --auto-dotfiles
```

It does not work!

Here is my probable guess: With `.ruby-version` file, ruby version is selected but it does not know which gemset to use. I enter command `rvm gemset list' and realise that no gemset is selected exactly as I expected. I am writing this long blog just because that stupid warning didn't say something clearly! It could have simply said, "Now you have switched your ruby version and there are more than one gemset here, I am confused what gemset should I use. Please help me." That warning is the reason no one cared about half baked solution of selecting ruby version. Probably it worked for many programmers before for following reasons:

1. They didn't care enough to create gemsets!
2. They were dealing with few projects, with different ruby version for each, hence no confusion on gemset!

## All probable solutions

### .rvmrc to the rescue
Probable solutions were all documented in rvm's official documentation. Read the first paragraph from documentation carefully:

>RVM supports multiple types of files to allow configuring a project for automated ruby switching. In any case make sure to add those files to your version control systems as it is part of the project configuration.

And this is how they want their `.rvmrc` file to be created:

```bash
echo 'rvm --create use ruby-version@gemset' > .rvmrc
```
<BlogDetailsNoticeWrapper class="notice">
<strong>note:</strong> `.rvmrc` is a shell script that tells rvm which ruby version to use
</BlogDetailsNoticeWrapper>

This is first solution but it requires trusting to prevent execution of unauthorized code, which makes it hard to use and complicates deployment to production.

### Alternative solution (preferred)

```bash
rvm --ruby-version --create use 2.2.3@my_app

#incase you already have created gemset(replace my_app with your gemset)
rvm --ruby-version use 2.2.3@my_app

```

This code will create both `.ruby-version` and `.ruby-gemset`.

## More about .ruby-gemset
`.ruby-gemset` just does not select gemset, it creates one if it does not exist already. I find this quite useful. It is recommended to have app's name as gemset's name. This helps having all gems related to project inside one gemset. One disadvantage of this is you may have to install same gem multiple times. But managing gems of individual project seems like a good idea. This keeps your system clean, and eliminates “Gem clutter” and version mismatches. Also running bundle install will use the project defined gemset to also store the gems.

## Let's get back to some more basics
Ok, I also found solution to not have to install same gem multiple times.

Do you remember something called gemset with global scope? What's in there?

Gems in the global gemset, will be added to the global gemset in every new Ruby you install. rake, rdoc and bundler are good examples of handy global gems. The gems in the default gemset are the gems included in every newly created gemset.

But still, I wouldn't mind installing gem multiple times rather than dating “Gem clutter” and version mismatches. Have your say on comment section below. :)

References:

- <a href=https://rvm.io/workflow/projects rel="nofollow" target="_blank">RVM official documentation</a>
- <a href=http://sirupsen.com/get-started-right-with-rvm/ rel="nofollow" target="_blank">Getting started with RVM</a>
