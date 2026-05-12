---
title: "RUBY: when to prefer eql? over =="
categories:
directory:
excerpt: "RUBY: when to prefer eql? over =="
tags: ruby
comments: true
share: true
date: "2015-11-20T14:16:50+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

I don't remember since when did I pick up habit of preferring `eql?` over `==`. But today I found out when should it be actually preferred and when it is ok to use `==`.

## Numbers

```ruby
2.2.0 :001 > 1 == 1
 => true
2.2.0 :002 > 1 == 1.0
 => true
2.2.0 :003 > 1.eql?1
 => true
2.2.0 :004 > 1.eql?1.0
 => false
```

Code speaks itself! `eql?` is handy when we want to differentiate float and integer.

## Hash

```ruby
2.2.0 :008 > h1={a:1, b:2}
 => {:a=>1, :b=>2}
2.2.0 :009 > h2={a:1.0, b:2.0}
 => {:a=>1.0, :b=>2.0}
2.2.0 :010 > h1.eql?h2
 => false
2.2.0 :011 > h1==h2
 => true
```

`eql?` should be preferred in comparing hashes.

## Strings

```ruby
2.2.0 :006 > "foo"=="foo"
 => true
2.2.0 :007 > "foo".eql?"foo"
 => true
```

It doesn't matter which one we use if we are comparing strings.

Reminder to self: Someday I will comeback and write in detail what is happening in each case.
