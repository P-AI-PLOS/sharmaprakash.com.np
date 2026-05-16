---
title: Generate an application with a specific Rails version
categories: rails
directory: rails
excerpt: Generate an application with a specific Rails version
tags:
  - rbenv
comments: true
classes: wide
share: true
toc: true
date: "2016-03-03T22:13:42+05:45"
last_modified_at: "2020-04-25"
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-03-03-generate-an-application-with-a-specific-rails-version.png"
thumb: "/images/blog/generated/thumbs/2016-03-03-generate-an-application-with-a-specific-rails-version.png"
use_featured_image: true
---

There are few ways we can create an application with specific rails version.

In this article, we will create a new rails app of version `6.0.1` while our system may have multiple rails versions installed in our system.

Here is the list of rails versions that were already installed in my system while writing this article.

~~~ruby
rails (6.0.2.2, 6.0.2.1, 6.0.1)
~~~

## Method 1: Common method

Let's start with most common and widely documented method:

```sh
 rails version new app_name
```

**Code example:**
Let's create an app named `my_app` with rails version `6.0.1`.

```sh
gem install rails -v 6.0.1 #only when the gem has not been installed in the desired ruby version you are using
rails _6.0.1_ new my_app
```

> The `_6.0.1_` feature is provided by `RubyGems`. It checks if the first argument(`ARGV` Array) is a version. It then modifies the $LOAD_PATH accordingly. Ruby seeks help from `RubyGems` because it knows where the gems are stored.

<BlogDetailsNoticeWrapper class="notice--danger block">
Hence this code will fail if you are currently using a different version of Ruby and in that particular version of Ruby that particular version of the gem might has not been installed. Thank you <a hef=http://disq.us/p/1lmdt8x>Shiva Bhusal for pointing out the problem and solution in the comments</a>.
</BlogDetailsNoticeWrapper>

## Method 2: Let bundler handle the rails version

In this method we will let `bundler` handle rails version.

Our workflow if we wanted to setup new project with rails version `6.0.1` would be:

### 2.1: Make new folder and initialize bundler

~~~bash
# make directory for new rails app
mkdir my_app
cd my_app

# specify ruby version we want to use
echo 2.4.1 > .ruby-version

# initialise bundler (creates Gemfile)
bundler init
~~~

### 2.2: Specify rails version

At this stage, our `Gemfile` probably looks like this:

~~~ruby
# A sample Gemfile
source "https://rubygems.org"

# gem "rails"
~~~

We have to uncomment rails gem and specify version so that our `Gemfile` looks like this:

~~~ruby
# A sample Gemfile
source "https://rubygems.org"

gem "rails", '6.0.1'
~~~

Now we need to run `bundle install`. (This would install `rails 6.0.1` if it had not been installed yet).

### 2.3: Initialise new rails app with specified rails version

At this point we already have minimal project with rails version `6.0.1`.

Now, we can use the rails command line tool with bundle exec to force the version:

~~~bash
bundle exec rails new . --force # --force to overrite curent Gemfile
~~~

If you were unaware about rails runtime option `force`, it is used to overwrite files that already exist. Just type `rails` in your commandline and you will see explanation about this command.

Now, we have new rails project with our desired rails version(`6.0.1`).

What do you think about this flow of setting up version specific new rails project? Feel free to comment.

Happy learning!

References:

1. <https://relativkreativ.at/articles/managing-multiple-rails-versions>
2. <https://coderwall.com/p/wrukbg/generate-an-application-with-a-specific-rails-version>
