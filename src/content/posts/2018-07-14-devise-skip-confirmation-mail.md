---
title: Devise - create confirmed user account without sending out an email?
categories: ruby
directory: ruby
excerpt: Devise - create confirmed user account without sending out an email?
tags:
  - rubocop
comments: true
share: true
classes: wide
date: "2017-07-14T23:24:12+05:45"
last_modified_at: "2017-09-17T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---
So you integrated devise in your app and need your email signups to confirm. You setup devise and enabled confirmable module and things were going great.

One day your manager comes to you all excited about having social logins(Facebook, twitter, linkedin) and you no longer need them to confirm.
Or it may be that your application now has email invitation feature and it would be stupid to ask the user you just invited via email to confirm their email.

It is now time to skip confirmation mail.

For this you will have to detect the mechanism by which user is being created and If it is among above two cases you can add one more line `user.skip_confirmation!` before saving the user.

```ruby
user = User.new(user_attrs)
user.skip_confirmation!
user.save!
```

Did this work for you? Do you have some more edge case related to this? Feel free to share in the comments below.

Happy Coding!

Reference: <https://stackoverflow.com/a/7465664/4096120>
