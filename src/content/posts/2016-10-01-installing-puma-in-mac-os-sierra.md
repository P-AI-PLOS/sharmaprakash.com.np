---
title: Install puma in mac os sierra
categories:
directory:
excerpt: install puma in mac os sierra
tags:
comments: true
share: true
date: "2016-10-01T07:51:29+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-10-01-installing-puma-in-mac-os-sierra.png"
thumb: "/images/blog/generated/thumbs/2016-10-01-installing-puma-in-mac-os-sierra.png"
use_featured_image: true
---

Today I was trying to install puma when I got this error:

```sh
$ gem install puma -v 2.4.0
Fetching: puma-2.4.0.gem (100%)
Building native extensions.  This could take a while...
ERROR:  Error installing puma:
	ERROR: Failed to build gem native extension.

    /Users/prakash/.rbenv/versions/2.2.4/bin/ruby -r ./siteconf20161001-74451-iz0okt.rb extconf.rb
creating Makefile

make "DESTDIR=" clean

make "DESTDIR="
compiling http11_parser.c
compiling io_buffer.c
io_buffer.c:118:10: warning: passing 'uint8_t *' (aka 'unsigned char *') to parameter of type 'const char *' converts between pointers to integer types with different sign [-Wpointer-sign]
  return rb_str_new(b->top, b->cur - b->top);
         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/Users/prakash/.rbenv/versions/2.2.4/include/ruby-2.2.0/ruby/intern.h:796:20: note: expanded from macro 'rb_str_new'
        rb_str_new_static((str), (len)) : \
                          ^~~~~
/Users/prakash/.rbenv/versions/2.2.4/include/ruby-2.2.0/ruby/intern.h:727:37: note: passing argument to parameter here
VALUE rb_str_new_static(const char *, long);
                                    ^
io_buffer.c:118:10: warning: passing 'uint8_t *' (aka 'unsigned char *') to parameter of type 'const char *' converts between pointers to integer types with different sign [-Wpointer-sign]
  return rb_str_new(b->top, b->cur - b->top);
         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/Users/prakash/.rbenv/versions/2.2.4/include/ruby-2.2.0/ruby/intern.h:797:13: note: expanded from macro 'rb_str_new'
        rb_str_new((str), (len));         \
                   ^~~~~
/Users/prakash/.rbenv/versions/2.2.4/include/ruby-2.2.0/ruby/intern.h:706:29: note: passing argument to parameter here
VALUE rb_str_new(const char*, long);
                            ^
2 warnings generated.
compiling mini_ssl.c
In file included from mini_ssl.c:2:
/Users/prakash/.rbenv/versions/2.2.4/include/ruby-2.2.0/ruby/backward/rubyio.h:2:2: warning: use "ruby/io.h" instead of "rubyio.h" [-W#warnings]
#warning use "ruby/io.h" instead of "rubyio.h"
 ^
mini_ssl.c:3:10: fatal error: 'openssl/bio.h' file not found
#include <openssl/bio.h>
         ^
1 warning and 1 error generated.
make: *** [mini_ssl.o] Error 1

make failed, exit code 2

Gem files will remain installed in /Users/prakash/.rbenv/versions/2.2.4/lib/ruby/gems/2.2.0/gems/puma-2.4.0 for inspection.
Results logged to /Users/prakash/.rbenv/versions/2.2.4/lib/ruby/gems/2.2.0/extensions/x86_64-darwin-16/2.2.0-static/puma-2.4.0/gem_make.out
```

At first I thought, probably there must be some issue with openssl but upon further digging I realised that I need to pass some more config. This issue was reported since el capitan.

```ruby
gem install puma -- --with-cppflags=-I/usr/local/opt/openssl/include
```

We can also install specifice puma version by code in following format:

```ruby
gem install puma -v 2.4.0 -- --with-cppflags=-I/usr/local/opt/openssl/include
```

References:

<http://stackoverflow.com/questions/30143180/puma-gem-failed-to-build-gem-native-extension>

<https://github.com/puma/puma/issues/718>
