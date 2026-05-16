---
title: Running Shell Command From Ruby Script
modified:
categories: ruby
directory: ruby
excerpt: running shell command from ruby script using rake
tags:
  - ruby
  - shell
comments: true
share: true
toc: true
toc_label: "possible ways"
category: ['code-quality']
cover: "/images/blog/generated/covers/2016-02-14-running-shell-command-from-ruby-script.png"
thumb: "/images/blog/generated/thumbs/2016-02-14-running-shell-command-from-ruby-script.png"
date: "2016-02-14T12:50:09+05:45"
use_featured_image: true
---

Yesterday I was watching ruby-tapas video on binary literals. Avdi was showing an example where he changes file permissions from ruby script. His code would look like this:

```ruby
require 'fileutils'
include FileUtils

#using octal literal
chmod 0755, 'shell1.sh'
```

`chmod` is a method provided by `FileUtils`, other methods it provides are:

```ruby
FileUtils.methods
=> [:chdir, :getwd, :pwd, :mkdir, :rmdir, :private_module_function, :cd, :uptodate?, :commands, :have_option?, :collect_method, :options_of, :mkpath, :makedirs, :ln, :remove_file, :ln_s, :ln_sf, :cp, :identical?, :mkdir_p, :copy_file, :cp_r, :copy, :copy_entry, :chmod, :chown, :link, :symlink, :mv, :remove_entry_secure, :remove_entry, :move, :rm, :rm_f, :install, :safe_unlink, :rm_r, :rm_rf, :rmtree, :remove, :copy_stream, :remove_dir, :compare_file, :options, :compare_stream, :cmp, :chmod_R, :chown_R, :touch, :<=>, :module_exec, :class_exec, :<=, :>=, :==, :===, :include?, :included_modules, :ancestors, :name, :public_instance_methods, :instance_methods, :private_instance_methods, :protected_instance_methods, :const_get, :constants, :const_defined?, :const_set, :class_variables, :class_variable_get, :remove_class_variable, :class_variable_defined?, :class_variable_set, :private_constant, :public_constant, :singleton_class?, :deprecate_constant, :freeze, :inspect, :module_eval, :const_missing, :prepend, :method_defined?, :class_eval, :public_method_defined?, :private_method_defined?, :<, :public_class_method, :>, :protected_method_defined?, :private_class_method, :to_s, :autoload, :autoload?, :instance_method, :public_instance_method, :include, :instance_of?, :public_send, :instance_variable_get, :instance_variable_set, :instance_variable_defined?, :remove_instance_variable, :private_methods, :kind_of?, :instance_variables, :tap, :method, :public_method, :singleton_method, :is_a?, :extend, :define_singleton_method, :to_enum, :enum_for, :=~, :!~, :eql?, :respond_to?, :display, :object_id, :send, :nil?, :hash, :class, :singleton_class, :clone, :dup, :itself, :taint, :tainted?, :untaint, :untrust, :trust, :untrusted?, :methods, :protected_methods, :frozen?, :public_methods, :singleton_methods, :!, :!=, :__send__, :equal?, :instance_eval, :instance_exec, :__id__]
```

Changing file permissions from ruby script looked like cool thing to do but after digging through other available methods I could not find any command to see persmissions of file.

I wanted to run `ls -la` from within ruby script but at this point, I was sure `FileUtils` would not let me do so. So, I searched for alternative and found `rake`. Using `rake` I would be able to run any shell command from inside the ruby script.

## rake

```ruby
>> require 'rake'
=> true

>> sh 'ls -la'
ls -la
total 12
drwxrwxr-x  2 fleck fleck 4096 फ़रवरी  5 20:00 .
drwxrwxr-x 12 fleck fleck 4096 फ़रवरी 14 12:27 ..
-rwxrwxrwx  1 fleck fleck   38 फ़रवरी  5 20:00 shell1.sh
=> true

```

Ok! after finding out about rake, I found another way I can run shell commands from inside ruby! This one does not require me to require any library.

## system

```ruby
>> system 'ls -la'
total 12
drwxrwxr-x  2 fleck fleck 4096 फ़रवरी  5 20:00 .
drwxrwxr-x 12 fleck fleck 4096 फ़रवरी 14 12:27 ..
-rwxrwxrwx  1 fleck fleck   38 फ़रवरी  5 20:00 shell1.sh
=> true
```

There may be other ways of achieving the same and I would love to learn what is your preferred way. Feel free to comment below.

Happy Learning! :)
