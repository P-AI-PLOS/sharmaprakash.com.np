---
title: Setup golang in ubuntu 16.04
categories: linux
directory: linux
excerpt: Setup golang in ubuntu 16.04
tags: go, ubuntu
comments: true
share: true
date: "2017-07-07T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

## Install Go 1.8

Installing 1.8 in newer versions of ubuntu is as simple as `sudo apt-get install golang-1.8-go` unless you are running older versions of ubuntu like 16.04. In ubuntu 16.04 you need to use longsleep/golang-backports ppa. You can run following commands to install golang 1.8:

```sh
sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt-get update
sudo apt-get install golang-go
```

In case you are thinking why I won't use some version manager, I tried using gvm but some bugs made it totally unusable for me. I have not tried it recently if they have fixed those nasty bugs. So for now, I am going to continue without version manager. Besides that I have not been in dire need to manage multiple versions of golang.

## Setting up workspace

Golang developers like to keep all their go code in single workspace. Please refer this [doc](https://golang.org/doc/code.html) to know more about workspace practice of golang devs. You can create workspace as described there with following command:

```sh
mkdir go && cd go && mkdir bin pkg src
```

## Setting up gopath

Add following to your .zshrc or .bashrc.

```sh
export PATH=$PATH:$(go env GOPATH)/bin
export GOPATH=$(go env GOPATH)
```

You may need to restart your terminal to see this config in action. Please refer [doc](https://golang.org/doc/code.html) to know more about gopath.

## Setting up glide

Are you used to tools such as Cargo, npm, Composer, Nuget, Pip, Maven, Bundler, or other modern package managers? If so, Glide is the comparable Go tool.

If you have been following this doc throroughly you can easily setup glide with following command:

```sh
sudo add-apt-repository ppa:masterminds/glide && sudo apt-get update
sudo apt-get install glide
```

On Ubuntu Zesty (17.04) the package is called `golang-glide`.

References:

1. <https://github.com/golang/go/wiki/Ubuntu>
2. <https://golang.org/doc/code.html>
3. <https://github.com/Masterminds/glide>
