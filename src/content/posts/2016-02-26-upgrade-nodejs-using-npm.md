---
title: Upgrade Nodejs Using npm
categories: nodejs
directory: nodejs
excerpt: how to upgrade Nodejs version using npm
tags: 
comments: true
share: true
date: "2016-02-26T22:36:42+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

There are two kinds of nodejs users I frequently meet:

1. who use sudo with every npm command
2. who don't use sudo with every npm command ([learn about that here][how to install nodejs in ubuntu])

If you fit into first list. Good news for you, you can very simply upgrade your node version using npm.

~~~ bash
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
~~~

And poof you have latest stable version of node installed in your machine! But if you are of second kind, then last line will give you error like this:

~~~bash
$ sudo n stable
sudo: n: command not found
~~~

Chances are also there that you tried without sudo command and output might have been like this:

~~~bash
$ n stable
mkdir: cannot create directory ‘/usr/local/n’: Permission denied
mkdir: cannot create directory ‘/usr/local/n’: Permission denied

     install : node-v5.6.0
       mkdir : /usr/local/n/versions/node/5.6.0
mkdir: cannot create directory ‘/usr/local/n’: Permission denied
~~~

It sucks! It absolutely sucks when nothing works! But when something simple does not works, there needs to be some other way to make things work. And below is the code that will work for you.

~~~bash
$ sudo -E env "PATH=$PATH" n stable
~~~

Sometime you may want to install lts or other releases instead of stable version, in that case you can specify the version name in place of stable. Your code might look like this:

~~~bash
$ sudo -E env "PATH=$PATH" n 4.3.1 # most recent LTS version is 4.3.1

# in case you had been first type one
# your code might look like
$ sudo n 4.3.1
~~~

References:

1. [david walsh on how to upgrade node using n][david walsh blog]
2. [how to upgrade node using npm][upgrade node using npm]
3. [ubuntu forum answer][how to upgrade node for non sudo guys]

[how to install nodejs in ubuntu]: {{ site.url }}/nodejs/setup-nodejs-in-ubuntu/
[david walsh blog]: https://davidwalsh.name/upgrade-nodejs
[upgrade node using npm]: http://theholmesoffice.com/node-js-fundamentals-how-to-upgrade-the-node-js-version/
[how to upgrade node for non sudo guys]: http://askubuntu.com/a/645119
