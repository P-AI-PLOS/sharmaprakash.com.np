---
title: Pretend with rails generator
categories: rails 
directory: rails
excerpt: how to pretend rails generate to see if generated files will conflict
tags:
comments: true
share: true
date: "2016-05-10T07:51:29+05:45"
last_modified_at:
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-05-10-pretend-with-rails-generator.png"
thumb: "/images/blog/generated/thumbs/2016-05-10-pretend-with-rails-generator.png"
use_featured_image: true
---

The rails generate command will be used many times during the lifetime of a project. Sometimes the generate may create or modify multiple files that you may not want to. If you need to find out what files will be created/modified, you can run a pretend generation. Here let's try generating model that will conflict with already created model:

```bash
$ rails g model ticket owner:string status:integer assigned:string subject:string next_step:enum type:enum -p
      invoke  active_record
    conflict    db/migrate/20160510153738_create_tickets.rb
```

Now, let's pretend to generate model that has never been created in the app before:

```bash
$ rails g model comment body:text post_id:integer -p
      invoke  active_record
      create    db/migrate/20160510153812_create_comments.rb
      create    app/models/comment.rb
```            

In the first case we were told that migration file has already been created and will conflict while second generator ran smoothly. Since we were just pretending, no new files were actually created but we were able to analyse when generate command would create conflicting files in project.

I am yet to really make use of this feature but hopefully it will come handy someday in future.

References:

- <a href=https://www.airpair.com/ruby-on-rails/posts/ruby-rails-tips-hacks rel="nofollow" target="_blank">https://www.airpair.com/ruby-on-rails/posts/ruby-rails-tips-hacks</a>
