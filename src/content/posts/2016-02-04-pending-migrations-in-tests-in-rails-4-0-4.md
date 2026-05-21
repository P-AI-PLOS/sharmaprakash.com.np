---
title: Pending Migrations in Tests in Rails 4.0.4
categories: rails
directory: rails
excerpt: How to automatically run pending migrations while running rspec in all versions of rails
tags:
  - tdd
  - rspec
comments: true
share: true
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-02-04-pending-migrations-in-tests-in-rails-4-0-4.png"
thumb: "/images/blog/generated/thumbs/2016-02-04-pending-migrations-in-tests-in-rails-4-0-4.png"
date: "2016-02-04T11:14:31+05:45"
use_featured_image: true
---

How would you feel if all your test that were running fine till yesterday suddenly fails? That is what happened with me this morning. Below is the exception I encountered.

```bash
$ rspec spec/
/home/prakash/.rvm/gems/ruby-2.1.1/gems/activerecord-4.0.4/lib/active_record/migration.rb:383:in `check_pending!': Migrations are pending; run 'bin/rake db:migrate RAILS_ENV=test' to resolve this issue. (ActiveRecord::PendingMigrationError)
	from /home/prakash/ATS/spec/rails_helper.rb:57:in `<top (required)>'
	from /home/prakash/.rvm/gems/ruby-2.1.1/gems/activesupport-4.0.4/lib/active_support/dependencies.rb:229:in `require'
	...
```

When I saw, migrations are pending, I promptly ran `rake db:migrate` but nothing happened: which is a sign that there is no pending migrations. Having second look at the exception I realised that it was telling me to run migration in test environment. Like any obedient programmer I ran `rake db:migrate RAILS_ENV=test` and then `rspec spec`. Everything worked fine.

But I found it quite strange. It's already been a year that I have been coding rails and never before had I stumbled into this error. I jumped into `spec/rails_helper.rb:57` in my project and saw the following.

```ruby
# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.check_pending!
```

I searched what would check_pending! do and found this bit of code in [rails repo][rails active record 404].

```ruby
# File https://github.com/rails/rails/blob/4-0-stable/activerecord/lib/active_record/migration.rb, line 382
def self.check_pending!
  raise ActiveRecord::PendingMigrationError if ActiveRecord::Migrator.needs_migration?
end
```

Why would anyone just throw exception instead of actually running migration if pending! I searched how to maintain test schema and found this code: `ActiveRecord::Migration.maintain_test_schema!`. I checked if I had similar code in my previous project and yes it was there. This might be the reason, I never bumped into any pending migration exceptions while running tests. I changed the code in `spec/rails_hellper.rb` and expected to have solved the problem. Things started getting interesting when I bumped into another exception.

```bash
/home/prakash/.rvm/gems/ruby-2.1.1/gems
/activerecord-4.0.4/lib/active_record/migration.rb:628:
in `block in method_missing': undefined method `maintain_test_schema!' for
#<ActiveRecord::Migration:0x0000000374fc40> (NoMethodError)
```

`ActiveRecord::Migration.maintain_test_schema!` doesn't exist in rails 4.0.4, this explains why I had not encountered this condition previously. This also explains following code in [rspec][rspec spec helper template]:

```ruby
# https://github.com/rspec/rspec-rails/blob/b8680f98858598b5423e13765676773fe587288b/lib/generators/rspec/install/templates/spec/spec_helper.rb.tt, line 15

<% if ::Rails::VERSION::STRING >= '4.1' -%>
# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

<% elsif ::Rails::VERSION::STRING >= '4' -%>
# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.check_pending! if defined?(ActiveRecord::Migration)

<% end -%>
```

It would be great to have migrations maintained automatically. Thus I ended up using the following code as suggested [here][stack overflow migration 404].

```ruby
ActiveRecord::Migrator.migrate(File.join(Rails.root, 'db/migrate'))
```

[rspec spec helper template]: https://github.com/rspec/rspec-rails/blob/b8680f98858598b5423e13765676773fe587288b/lib/generators/rspec/install/templates/spec/spec_helper.rb.tt
[rails active record 404]: https://github.com/rails/rails/blob/4-0-stable/activerecord/lib/active_record/migration.rb
[stack overflow migration 404]: https://stackoverflow.com/a/22321132/4096120
