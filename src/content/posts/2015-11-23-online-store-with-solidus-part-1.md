---
title: Online Store with Solidus (Part 1)
categories:
directory:
excerpt: Ecommerce using solidus (spree's alternative)
tags:
  - rails
  - ecommerce
comments: true
share: true
date: "2015-11-23T23:04:49+05:45"
last_modified_at: "2015-05-10"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-11-23-online-store-with-solidus-part-1.png"
thumb: "/images/blog/generated/thumbs/2015-11-23-online-store-with-solidus-part-1.png"
use_featured_image: true
---
Since spree has been sold, I thought it might be good idea to setup tutorial to create ecommerce with alternative.

Here we will use <a href=https://github.com/solidusio/solidus rel="nofollow" target="_blank">solidus</a> which is a complete open source e-commerce solution built with Ruby on Rails. It is a fork of Spree.

## New Rails Project

Lets start with setting up new rails project.

```bash
rails _4.2.6_ new merchant -T -B --database=mysql
# -T skips unit test (we will use rspec)
# -B skips the bundle install after all files have been generated
# --database=mysql specifies database to be used is mysql
```

Now `cd` to the project directory and let's init git

```bash
cd merchant
git init
```

You may copy .gitignore content from <a href=/setup-new-rails-project/ target="_blank">here</a> to avoid tracking unnecessary files to your repo.

Create `.ruby-version` to specify ruby version.

```bash
echo '2.3.1' > .ruby-version
```

# Adding Solidus gem

Now let's add solidus to our gemfile:

```ruby
gem 'solidus'
gem 'solidus_auth_devise'
```

Run the `bundle` command to install.

```bash
$ bundle
```

After installing gems, let's setup database. My config/database.yml looks like this:

```yml
default: &default
  adapter: mysql2
  encoding: utf8
  pool: 5
  username: root
  password:
  socket: /var/run/mysqld/mysqld.sock

development:
  <<: *default
  database: merchant_development
test:
  <<: *default
  database: merchant_test
production:
  <<: *default
  database: merchant_production
  username: merchant
  password: <%= ENV['MERCHANT_DATABASE_PASSWORD'] %>
```

Now you need to run `rake db:create' command to create database.

<BlogDetailsNoticeWrapper class="notice block">
For me this command failed as ActiveRecord command could not support `gem mysql2 0.4.1` hence I switched to `0.3.15`
</BlogDetailsNoticeWrapper>

Then, you'll have to run the generators to create necessary configuration files and migrations.

```bash
bundle exec rails g spree:install
```

This may take a while but after some time you will be prompted to create admin user. Enter email and password and youe will see success message.

```bash
Create the admin user (press enter for defaults).
Email [spree@example.com]: prakashpoudel@lftechnology.com
Password [spree123]:
Done!
     loading  sample data
      insert  config/routes.rb
**************************************************
We added the following line to your application's config/routes.rb file:

    mount Spree::Core::Engine, :at => '/'
**************************************************
Spree has been installed successfully. You're all ready to go!

Enjoy!

```

The line below is copied from solidus's instruction and I expected it to copy migrations to my app but my terminal gave me no hint what it did! Then I ran `rake db:migrate` and again terminal gave no hint of what was happening but I guess that won't cause me problem because `bundle exec rails g spree:install` has already installed necessary migrations.

```bash
bundle exec rake railties:install:migrations
```

Let's see the output of our hardwork now! Run rails server!

```bash
rails s
```

Visit <a href=http://localhost:3000/ rel="nofollow" target="_blank">http://localhost:3000/</a> to see your store. <br />Your admin section will be in <a href=http://localhost:3000/admin rel="nofollow" target="_blank">http://localhost:3000/admin</a>

![solidus store](/images/blog/solidus.png)

We will do slight customisations of this store in next post.
