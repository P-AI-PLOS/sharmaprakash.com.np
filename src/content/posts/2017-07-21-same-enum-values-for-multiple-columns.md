---
title: How to have same enum values for multiple columns in rails
categories: rails
directory: rails
excerpt: How to have same enum values for multiple columns in rails
tags: 
comments: true
share: true
date: "2017-07-21T23:24:12+05:45"
last_modified_at: "2017-09-17T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2017-07-21-same-enum-values-for-multiple-columns.png"
thumb: "/images/blog/generated/thumbs/2017-07-21-same-enum-values-for-multiple-columns.png"
use_featured_image: true
---

Sometimes we may need to share same enum values in multiple columns in rails. For eg:
I may have a model named file that can either be of type transfer or new, and can be in transfer, review or approved state.
I now have both state and type as enum and my modal looks like this:

```ruby
class File < ActiveRecord::Base
  enum :state [ :transfer, :review, :approved]
  enum :type [ :transfer, :new]
end
```
ActiveRecord provides us some helper methods like bang and predicate methods for enums and in this case `File.last.transfer!`
would probably not work as we have two transfer to resolve to, hence this won't work.
As mentioned in [official doc](http://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html) we can make it work using prefix or suffix with enum.
Above code can be fixed as:

## Using suffix
We can either pass boolean or some value so that helper methods are still valid.

```ruby
class File < ActiveRecord::Base
  enum :state [ :transfer, :review, :approved], _suffix: :step  #providing some value for suffix
  enum :type [ :transfer, :new], _suffix: true, _suffix: true #providing boolean value
end
```
Now our helper methods would look like:

```sh
file.transfer_step?, file.transfer_step!
file.transfer_type?, file.transfer_type!
```

## Define prefix

```ruby
class File < ActiveRecord::Base
  enum :state [ :transfer, :review, :approved], _prefix: :step  #providing some value for suffix
  enum :type [ :transfer, :new], _suffix: true, _prefix: true #providing boolean value
end
```
How this works is similar to above except defined words will come at first in helper methods.

Now our helper methods would look like:

```sh
file.step_transfer?, file.step_transfer!
file.type_transfer?, file.type_transfer!
```

References: 

<https://stackoverflow.com/questions/30981350/same-enum-values-for-multiple-columns/38441150#38441150>
<http://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html>
