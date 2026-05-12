---
title: Hosting Jekyll Blog for Your Github Project
categories: jekyll
directory: jekyll
excerpt: hosting jekyll blog for your github project
tags:
comments: true
share: true
date: "2015-10-29T13:37:25+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Note: this is not complete tutorial for hosting jekyll blog

If you are hosting jekyll blog for a project then by default rule of github page it will be hosted under `http://<username>.github.io/<project-name>`

The appropriate setting for this in your jekyll's config file i.e. `_config.yml` would be:

```ruby
baseurl: "/project-name" # the subpath of your site, e.g. /blog/
url: "http://username.github.io" # the base hostname & protocol for your site
```

Missing the trailing slash in `baseurl` won't locate resource properly and you may see site with no css applied. This may be frustrating while blog will be working fine in local.
