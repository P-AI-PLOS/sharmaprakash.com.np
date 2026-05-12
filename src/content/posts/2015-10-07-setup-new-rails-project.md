---
layout: single
title: Setup New Rails Project
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
categories: rails
directory:  rails
excerpt: setup new rails project with rspec for testing
tags: rails
author:
comments: true
share: true
date: "2015-10-07T00:13:34+05:45"
show_category_hero_image: false
---

Today we will setup new rails project with rspec for testing.

## Setup new rails project

1) Navigate to your desired directory and run the following command in terminal

```bash
$ rails new app-name -T # The -T option tells rails not to include Test::Unit

# Other available options are
# --database=mysql Tells rails to use MySQL by default
# --skip-turbolinks
# --skip-bundle  This skips the bundle install after all files have been generated
# $ rails --help Other Essential options could be viewed
```

my personally preferred command is:

```bash
$ rails new app-name -T --database=mysql --skip-turbolinks
```
I don't like turbolinks and I use rspec instead of Test::Unit and I mostly use mysql database rather than default sqlite

2) Navigate to newly created app.

```bash
$ cd /path/to/app-name
```

3) Initialize the project with git

```bash
$ git init
```

4) Create and Open .gitignore file and add following:

```bash
# Rubymine project
.idea/
# Test and misc files
*.rbc
capybara-*.html
.rspec
/public/system
/coverage/
/spec/tmp
**.orig
rerun.txt
pickle-email-*.html
# Ignore bundler config.
/.bundle
# Ignore the default SQLite database and schema.
/db/*.sqlite3
/db/*.sqlite3-journal
#Configs
/config/database.yml
/config/application.yml
# Ignore all logfiles and tempfiles.
/log/*.log
/tmp
# Ignore rmvrc
.rvmrc
# If using bower-rails ignore default bower_components path bower.json files
/vendor/assets/bower_components
*.bowerrc
bower.json
```

5) Open `Gemfile` and modify it as necessary. Here are sample some modifications done:
* Use mysql instead of sqlite for database.
* Added figaro gem for managing environment variables.
* Added pry-rails gem for debugging.
* Added capistrano gems for deployment.
* Group gems for development.

```ruby
source 'https://rubygems.org'
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.1'
# Use mysql as the database for Active Record
gem 'mysql2'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.3'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'
# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# Figaro for setting environment variables for secrets that aren't included with the source code
gem 'figaro'

group :development do
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  # For deployment
  gem 'capistrano-rails', '~> 1.1.2'
  gem 'capistrano-rvm', '~> 0.1.1'
  gem 'capistrano-bundler', '~> 1.1.3'
end
# Use pry debugger
gem 'pry-rails', group: [:development, :test]
```

6) Run 'bundle install' to update gems.

7) Setting up database.yml for different environments. Note that this file is in gitignore.

```ruby
default: &default
  adapter: mysql2
  encoding: utf8
  pool: 5
  username: root
  password:
  host: localhost
  socket: /tmp/mysql.sock #Your mysql socket location might be different.

development:
  <<: *default
  database: db_dev

test:
  <<: *default
  database: db_test

production:
  <<: *default
  database: db_prod
```

8) Run 'rake db:create' to create the database

9) Generate figaro files

```bash
$ rails generate figaro:install
$ figaro install (for figaro 1.0.0 version)
```

This will generate config/application.yml and add it to gitignore. The variables defined in application.yml is accessible via environment variables.

10) If you open up config/secrets.yml, you'll find

```bash
production:
  secret_key_base: <%= ENV["SECRET_KEY_BASE"] %>
```

This expects SECRET_KEY_BASE to be in environment variable. This is where figaro comes into play.
Open config/application.yml and add the following code. (Note: the 128 character key base is generated using command 'rake secret'. Don't use the secret below).The SECRET_KEY_BASE is not defined here because it is directly available in secrets.yml and not being read through environment variable.

```ruby
development:
  TEST_VAR: 'development'

test:
  TEST_VAR: 'test'

production:
  SECRET_KEY_BASE: 8b2971b58d99c483d43962e92f78d18133a552f71d2271ea28c638afaf0d75672442c40f3829d2f46b26be6898ec44110d1ccefbba94afcebe1c93c41d198f79
  TEST_VAR: 'prod'

#Heroku users can set the variable in heroku using 'rake figaro:heroku[APP_NAME]'
```

Similarly, the example variable TEST_VAR can be accessed anywhere using ENV['TEST_VAR'] in the rails app.

11) Create a file named '.ruby-version' in the project root. Open the file and type in the version of the ruby you are using.

```ruby
2.2.3
```

## Rspec Setup and Configuration

1) Dependencies in `Gemfile`

```ruby
# Required gems
gem 'rspec-rails'
gem 'shoulda-matchers', require: false
gem 'factory_girl_rails'
gem 'faker'
gem 'capybara'
```

2) Install gems

```bash
# Required gems
$ bundle install
$ rails g rspec:install
```

3) RSpec configuration

```ruby
# Additions (Need to include in rails_helper file)
require 'shoulda/matchers'
require 'capybara/rspec'
require 'factory_girl_rails'
RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods
end
```
