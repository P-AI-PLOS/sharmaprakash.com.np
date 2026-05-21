---
title: Curly Brackets in Linux Command Line
categories: linux
directory: linux
excerpt: few use cases of curly brackets in linux terminal
tags:
comments: true
share: true
date: "2015-10-25T12:03:35+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-10-25-curly-brackets-in-linux-command-line.png"
thumb: "/images/blog/generated/thumbs/2015-10-25-curly-brackets-in-linux-command-line.png"
use_featured_image: true
---

Here are few use cases of curly brackets in linux terminal.

## Selective deletion

If you have a directory that contains ten subdirectories and you want to delete three of them, the slow way to do it would be like this:

```bash
rm -rf /home/hudzilla/work
rm -rf /home/hudzilla/projects
rm -rf /home/hudzilla/sandbox
```

But that's pretty darn slow and open to making mistakes - a much smarter way to is to let Bash perform multiple filename expansion by placing the options inside braces. For example, this would achieve the same as the three lines from above:

```bash
rm -rf /home/hudzilla/{work,projects,sandbox}
```

## creation of multiple folders from single command

If you want to create three subdirectory inside a directory, the slow way to do it would be like this:

```bash
mkdir /home/hudzilla/work
mkdir /home/hudzilla/projects
mkdir /home/hudzilla/sandbox
```

Same could also be achieved by:

```bash
mkdir /home/hudzilla/{work,projects,sandbox}
```

However having space after `,` will have unexpected effect:

It will create folders named: `{work`, `projects,`, `sandbox}`

Also you need to already have folder inside which you want to create sub-directories. In case of example mentioned here, there need to be folder named hudzilla.
