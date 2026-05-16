---
title: How to debug a Sidekiq worker
categories: ruby
directory: ruby
excerpt: Pry like debugger for Sidekiq
tags:
  - sidekiq
comments: true
share: true
classes: wide
date: "2018-08-14T23:24:12+05:45"
last_modified_at: "2020-04-24T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2017-08-14-background-job-debugger.png"
thumb: "/images/blog/generated/thumbs/2017-08-14-background-job-debugger.png"
use_featured_image: true
---

Are you looking to debug your sidekiq worker?

There is this gem called <a href=https://github.com/Mon-Ouie/pry-remote rel="nofollow" target="_blank">pry-remote</a> which stops all processes from running. And lets you debug just like with pry.

You will have to put `binding.remote_pry` in your code and you've got a stopping point.

# Installation

`gem install pry-remote`

# Usage

Here's a program starting pry-remote:

```ruby
  require 'pry-remote'

  class Foo
    def initialize(x, y)
      binding.remote_pry
    end
  end

  Foo.new 10, 20
```

Running it will prompt you with a message telling you Pry is waiting for a
program to connect itself to it:

```
  [pry-remote] Waiting for client on drb://localhost:9876
```

You can then connect yourself using `pry-remote`:

```
  $ pry-remote
  From: example.rb @ line 7 in Foo#initialize:
        2:
        3: require 'pry-remote'
        4:
        5: class Foo
        6:   def initialize(x, y)
    =>  7:     binding.remote_pry
        8:   end
        9: end
      10:
      11: Foo.new 10, 20
  pry(#<Foo:0x00000000d9b5e8>):1> self
  => #<Foo:0x1efb3b0>
  pry(#<Foo:0x00000001efb3b0>):2> ls -l
  Local variables: [
    [0] :_,
    [1] :_dir_,
    [2] :_file_,
    [3] :_ex_,
    [4] :_pry_,
    [5] :_out_,
    [6] :_in_,
    [7] :x,
    [8] :y
  ]
  pry(#<Foo:0x00000001efb3b0>):3>
```

## Alternative method:
You can also use pry in your code and call your your worker from rails console.

```
MyWorker.new.perform(some_args)
```

Did this work for you? Feel free to share in the comments below.

Happy Coding!

Reference: <https://stackoverflow.com/a/43738392/4096120>

[pry-remote]: https://github.com/Mon-Ouie/pry-remote
