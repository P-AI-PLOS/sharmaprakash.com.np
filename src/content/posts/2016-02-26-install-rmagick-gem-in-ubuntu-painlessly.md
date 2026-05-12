---
title: Install Rmagick Gem in Ubuntu Painlessly
categories:
  - linux,
  - technical
minute: 6
directory: linux
excerpt: Install Rmagick gem in Ubuntu Painlessly
tags:
  - rmagick
comments: true
share: true
date: "2016-02-26T13:13:23+05:45"
toc: true
category: ['code-quality', 'technical']
cover: "/images/blog/blog5.png"
thumb: "/images/blog/blog5.png"
show_category_hero_image: true
---

## tl;dr for busy ones

```bash
sudo apt-get install graphicsmagick-libmagick-dev-compat
sudo apt-get install imagemagick
sudo apt-get install libmagickcore-dev
sudo apt-get install libmagickwand-dev
gem install rmagick
```

## Let me guess why you are here!

You are about to install `imagemagick` gem in freshly setup laptop, and you try simple `gem install imagemagick` and currently your screen looks like this:

~~~ bash
$ gem install imagemagick
Building native extensions. This could take a while...
ERROR: Error installing rmagick:
ERROR: Failed to build gem native extension.

/home/untoldstory/.rvm/rubies/ruby-2.1.1/bin/ruby -r ./siteconf20160226-5081-j6qfa7.rb extconf.rb
checking for gcc... yes
checking for Magick-config... no
checking for pkg-config... yes
Package MagickCore was not found in the pkg-config search path.
Perhaps you should add the directory containing `MagickCore.pc'
to the PKG_CONFIG_PATH environment variable
No package 'MagickCore' found
checking for outdated ImageMagick version (<= 6.4.9)... *** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries
and/or headers.  Check the mkmf.log file for more details.  You may
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
	--ruby=/home/untoldstory/.rvm/rubies/ruby-2.1.1/bin/ruby

extconf failed, exit code 1

Gem files will remain installed in /home/untoldstory/.rvm/gems/ruby-2.1.1/gems/rmagick-2.15.4 for inspection.
Results logged to /home/untoldstory/.rvm/gems/ruby-2.1.1/extensions/x86_64-linux/2.1.0/rmagick-2.15.4/gem_make.out
~~~

## what is the solution?

You need to install some dependencies before you can proceed with installation of this gem.

### Install imagemagick library
~~~ bash
sudo apt-get install graphicsmagick-libmagick-dev-compat
sudo apt-get install imagemagick
~~~

### Install some more dependencies

After installing imagemagick if you try installing imagemagick gem you will see error, that looks like this:

~~~bash
$ gem install rmagick
Building native extensions.  This could take a while...
ERROR:  Error installing rmagick:
	ERROR: Failed to build gem native extension.

    /home/untoldstory/.rvm/rubies/ruby-2.1.1/bin/ruby -r ./siteconf20160226-22127-tgz3iy.rb extconf.rb
checking for gcc... yes
checking for Magick-config... yes
checking for outdated ImageMagick version (<= 6.4.9)... no
checking for Ruby version >= 1.8.5... yes
checking for stdint.h... yes
checking for sys/types.h... yes
checking for wand/MagickWand.h... no

Can't install RMagick 2.15.4. Can't find MagickWand.h.
*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers.  Check the mkmf.log file for more de
tails.  You may
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
	--ruby=/home/untoldstory/.rvm/rubies/ruby-2.1.1/bin/ruby

extconf failed, exit code 1

Gem files will remain installed in /home/untoldstory/.rvm/gems/ruby-2.1.1/gems/rmagick-2.15.4 for inspection.
Results logged to /home/untoldstory/.rvm/gems/ruby-2.1.1/extensions/x86_64-linux/2.1.0/rmagick-2.15.4/gem_make.out
~~~

To solve this, you will need to install some more libraries.

~~~bash
sudo apt-get install libmagickcore-dev
sudo apt-get install libmagickwand-dev
~~~

### Install rmagick gem

Finally you can try to install rmagick gem and you will be successful!

~~~bash
gem install rmagick
~~~

Did this help? please feel free to comment.

Happy learning!
