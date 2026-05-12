---
title: How to solve Deployment Failure-`assets:precompile`
categories:
  - rails,
  - entrepreneurial
directory: rails
minute: 3
excerpt: I was trying to deploy rails 6 app on ec2 server using capistrano when precompile failure lead to whole deploymentt failure. I had to uninstall cmdtest and install yarn
tags:
  - rails
  - yarn
comments: true
classes: wide
share: true
date: "2020-07-08T07:51:29+05:45"
last_modified_at: "2020-03-26T12:30:29+05:45"
category: ['code-quality', 'entrepreneurial']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

## Issue: Deployment Failure: `assets:precompile`

```
 deploy:assets:precompile
      01 $HOME/.rbenv/bin/rbenv exec bundle exec rake assets:precompile
      01 Usage: yarn [options]
      01
      01 yarn: error: no such option: --no-progress
```

I was trying to deploy rails 6 app on ec2 server using capistrano when precompile failure lead to whole deploymentt failure. I was facing this issue only in server so I started digging what I was doing different on server.

Turns out, 
On server my yarn command came from `cmdtest`. 
So I uninstalled `cmdtest` and installed `yarn`.The steps I followed is as below.

## Configure the repository:
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

## Install Yarn:
`sudo apt update && sudo apt install yarn`

Then I ran the `cap:production:deploy` and it worked.

Did you also face similar issue while deploying rails apps to ubuntu with webpack enabled? Did this help? Please let me know your findings in the comment section below.
