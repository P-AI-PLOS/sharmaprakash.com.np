---
title: Personal Wiki
categories: 
directory:
excerpt: Personal wiki using gollum
tags:
comments: true
share: true
date: "2016-08-17T07:51:29+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

For some time I have been trying to have my personal wiki,where I could add programming notes for my own reference.
I didn't want them to exist in blogs. I think blogs need to be more carefully thought and polished. Also I could not write any secret informations there.

My search for personal wiki led me to gollum. It is a simple wiki system built on top of Git. Setting it up is quite easy for any rubyist.
Basic workflow to create new gollum wiki would be something like this:

## Installation

```sh
# install gollum
$ gem install gollum
# make new directory and cd into it
$ mkdir new_wiki && cd &_
# initialise git
$ git init
# start gollum there
$ gollum .
```

You need to visit <http://localhost:4567> to access this wiki. And you can now start adding new pages. If you want to create new pages inside folder you had to name as folder_name/file_name.

However I ran into problem while trying to install gollum gem. Here is that output:

```
$ gem install gollum
Fetching: charlock_holmes-0.7.3.gem (100%)
Building native extensions.  This could take a while...
ERROR:  Error installing gollum:
	ERROR: Failed to build gem native extension.

    current directory: /home/user/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/gems/charlock_holmes-0.7.3/ext/charlock_holmes
/home/user/.rbenv/versions/2.3.1/bin/ruby -r ./siteconf20160817-26716-1a0rqd4.rb extconf.rb
checking for main() in -licui18n... no
checking for main() in -licui18n... no


***************************************************************************************
*********** icu required (brew install icu4c or apt-get install libicu-dev) ***********
***************************************************************************************
*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers.  Check the mkmf.log file for more details.  You may
need configuration options.

Provided configuration options:
	--with-opt-dir
	--without-opt-dir
	--with-opt-include
	--without-opt-include=${opt-dir}/include
	--with-opt-lib
	--without-opt-lib=${opt-dir}/lib
	--with-make-prog
	--without-make-prog
	--srcdir=.
	--curdir
	--ruby=/home/user/.rbenv/versions/2.3.1/bin/$(RUBY_BASE_NAME)
	--with-icu-dir
	--without-icu-dir
	--with-icu-include
	--without-icu-include=${icu-dir}/include
	--with-icu-lib
	--without-icu-lib=${icu-dir}/lib
	--with-icui18nlib
	--without-icui18nlib
	--with-icui18nlib
	--without-icui18nlib

To see why this extension failed to compile, please check the mkmf.log which can be found here:

  /home/user/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/extensions/x86_64-linux/2.3.0-static/charlock_holmes-0.7.3/mkmf.log

extconf failed, exit code 1

Gem files will remain installed in /home/user/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/gems/charlock_holmes-0.7.3 for inspection.
Results logged to /home/user/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/extensions/x86_64-linux/2.3.0-static/charlock_holmes-0.7.3/gem_make.out
```

The error log clearly mentioned that gem depends on icu and I need to install it before being able to install gem.
Thus I installed dependencies as follows:

```sh
$ sudo apt-get install libicu-dev
```

## Removing files

I could not find any option to remove files in web interface, I had to remove files manually if I wanted to delete from my wiki.
However it wouldn't reflect until I made a git commit after deleting files. 

Adding/Updating files from web interface automatically make relevent git commit though.

Would you use gollum for personal wiki? what other solutions do you know? Don't forget to comment below.
