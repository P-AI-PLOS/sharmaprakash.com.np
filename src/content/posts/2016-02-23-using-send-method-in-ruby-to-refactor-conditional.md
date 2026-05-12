---
title: Using Send Method in Ruby to Refactor Conditional
categories: ruby 
directory: ruby
excerpt: refactor your ruby conditionals using send method
tags:
comments: true
share: true
date: "2016-02-23T08:27:33+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Hey Rubyist!

Have you ever tried calling function from string i.e. you have a string and you have a function name with the same name as string. How would you call that function!

Here, let's talk through example:

```ruby
class Hello

  def initialize(params)
    self.send(params)
  end

  def hi
    p 'I say hi'
  end

  def bye
    p 'I say bye'
  end
end

hello1 = Hello.new('hi') # >> 'I say hi'
hello2 = Hello.new('bye') # >> 'I say bye'
```

Now, let's see how I used send method to refactor conditional:

```ruby
  # before 
  role_name = current_user.role_name
  case role_name
  when CONST['super_admin']
    search_list_super_admin
  when CONST['customer_super_admin']
    search_list_customer_super_admin
  when CONST['manager']
    search_list_manager
  when CONST['supervisor']
    search_list_supervisor
  when CONST['executive']
    search_list_executive
  when CONST['recruiter']
    search_list_recruiter
  end
```

```ruby
  # after
  role_name = current_user.role_name
  function_name = "search_list_#{role_name}"
  self.send(function_name)
```

## Bit about send method

I remember watching one of the videos by Sandi Metz where she says each method in ruby is nothing but just a message. When we see methods as message, sending message to objects sounds more like Object Oriented approach than ever.

In real world, suppose your teacher sends you message 'Shut up' which would trigger your shut up function, then you would be silent.

We have `send` method in ruby for the same purpose. To call a method of object by sending a message.

### How does send method actually works?

`send` sends a message to an object instance and its ancestors in class hierarchy until some method reacts (because its name matches the first argument).

Happy Learning!
