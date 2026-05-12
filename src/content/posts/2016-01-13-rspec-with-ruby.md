---
title: Rspec With Ruby
categories:
directory:
excerpt: Test Driven Development in ruby using rspec
tags:
  - ruby
  - rspec
  - tdd
comments: true
share: true
date: "2016-01-13T08:41:34+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Most of the Ruby on Rails developer directly start their development career from rails project. They rarely work on any core ruby projects. They learn all the best practices, design principles, tdd. Doing something in core ruby sounds something from another world. If this sounds like someone is describing you or if you are just starting ruby, this post is for you.

Today we will get started in 'Test Driven Development' in Ruby.

As title suggests we will use rspec for testing.

## Requirements:

**IDE:** You can use any text editor you like, we at leapfrog prefer RubyMine.

**Ruby:** Any version, latest is preferred. Installation of ruby is not within the scope of this tutorial. Maybe you can get help from <http://sirupsen.com/get-started-right-with-rvm/> to install rvm and ruby in your system.

**Rspec gem:** Obviously, tutorial is all about rspec! latest version is preferred.

## Installation

If you already installed ruby in your system from above tutorial let's move forward with installing rspec.

```bash
gem install rspec
```

## Test Driven Development (TDD)

Before starting TDD, let's remind ourself what it is. TDD is a software development process where developer writes failing test initially, and then writes minimum code to pass the tests.

Let's start with a new project.

```bash
mkdir tdd_ruby
```

Now open this folder in your favourite text editor.

**Example 1:** we want to write a simple function that says hello world when called.

We start by writing test for this. Let's create files named hello_spec.rb to contain tests and hello.rb to contain the actual code.

```ruby
# hello_spec.rb

describe "#hello" do
  it "says Hello!" do
    expect(hello).to eql('Hello!')
  end
end
```

The test written above says that calling hello method should respond us with 'Hello!' string.

Now let's run this example and watch it fail.

```bash
prakash@prakash-Inspiron-5437:~/RubymineProjects/tdd_ruby$ rspec hello_spec.rb
F

Failures:

  1) #hello says Hello!
     Failure/Error: expect(hello).to eql('Hello!')

     NameError:
       undefined local variable or method `hello' for #<RSpec::ExampleGroups::Hello "says Hello!" (./hello_spec.rb:4)>
     # ./hello_spec.rb:5:in `block (2 levels) in <top (required)>'

Finished in 0.00047 seconds (files took 0.07086 seconds to load)
1 example, 1 failure

Failed examples:

rspec ./hello_spec.rb:4 # #hello says Hello!
```

Our test case is failing because it could not find hello method. That's fine as we have not written our real code. Now. let's open `hello.rb` and write hello function.

```ruby
# hello.rb

# @return [String] 'Hello!'
def hello

end
```

Test should not pass yet as we have not written any code inside the hello function. We have not included this file in our test file, let's first fix that and run the test. Now our test file should look like:

```ruby
# hello_spec.rb

# including file that contains actual code
require './hello'

describe "#hello" do
  it "says Hello!" do
    expect(hello).to eql('Hello!')
  end
end
```

If we run the test again we will see the following error:

```bash
prakash@prakash-Inspiron-5437:~/RubymineProjects/tdd_ruby$ rspec hello_spec.rb
F

Failures:

  1) #hello says Hello!
     Failure/Error: expect(hello).to eql('Hello!')

       expected: "Hello!"
            got: nil

       (compared using eql?)
     # ./hello_spec.rb:7:in `block (2 levels) in <top (required)>'

Finished in 0.01281 seconds (files took 0.06563 seconds to load)
1 example, 1 failure

Failed examples:

rspec ./hello_spec.rb:6 # #hello says Hello!

```

Our test is still failing. Now let's write code to pass the test.

```ruby
# hello.rb

# @return [String] 'Hello!'
def hello
  'Hello!'
end
```

Now, let's rerun the test and it should pass.

```bash
prakash@prakash-Inspiron-5437:~/RubymineProjects/tdd_ruby$ rspec hello_spec.rb
.

Finished in 0.00076 seconds (files took 0.06638 seconds to load)
1 example, 0 failures

```

Our test passed! Congratulations on your first tdd with rspec. But that test is boring. Instead of giving information like which test passed, it just says 1 example, 0 failures.

Let's run our test to be more descriptive. For now we will use color and format options of rspec.

```bash
prakash@prakash-Inspiron-5437:~/RubymineProjects/tdd_ruby$ rspec hello_spec.rb --color --format doc

#hello
  says Hello!

Finished in 0.00068 seconds (files took 0.0925 seconds to load)
1 example, 0 failures

```

But passing color and format everytime while running test sounds so boring. Let's create a config file to store this settings. We will call this configuration file spec_helper.rb. Configuration should look like this:

```ruby
# spec_helper.rb
# This is rspec configuration file

RSpec.configure do |config|
  config.default_formatter = 'doc'
  config.color = true
end

```

Include this file in your test file and run tests again to see colorful and descriptive output.

```bash
prakash@prakash-Inspiron-5437:~/RubymineProjects/tdd_ruby$ rspec hello_spec.rb

#hello
  says Hello!

Finished in 0.0007 seconds (files took 0.07414 seconds to load)
1 example, 0 failures

```
