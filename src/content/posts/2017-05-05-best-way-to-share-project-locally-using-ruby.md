---
title: Best way to share your code locally to non-core member
categories:
directory:
excerpt: Best way to share your code locally with non-core member using git, ruby/node/python.
tags:
comments: true
share: true
toc: true
date: "2017-05-05T23:24:12+05:45"
last_modified_at: "2017-05-25T23:24:12+05:45"
category: ['code-quality']
cover: "/images/blog/generated/covers/2017-05-05-best-way-to-share-project-locally-using-ruby.png"
thumb: "/images/blog/generated/thumbs/2017-05-05-best-way-to-share-project-locally-using-ruby.png"
use_featured_image: true
---

<BlogDetailsNoticeWrapper class="notice--info block">
This blog post assumes that you are using git as your version control tool.
</BlogDetailsNoticeWrapper>

**TOO BUSY JUST SHOW ME THE CODE**

For Sharer
```
cd your-awesome-project #move to the project you want to share
ruby -run -e httpd .git -p 8080 # serve you projects git folder over http on port 8080
git update-server-info
```
For Receiver
```
git clone http://<local-ip>:<port> ./<project-name(can be anything)>
```

**This looks interesting, tell me more**

If you have been working at service company, then you probably have faced this problem on; **how to effectively share code with non-core/short-term team members?**

Let's find out how this process can be simplified:

## Compress and share

It was pretty easy in the past to compress and share project's folder with your peer, but with advent of Single Page Applications, our apps' folder is usually cluttered with `node_modules` and `bower_components`. Compressing these folders could take more than 10-15 minutes depending on the size of app.

In several occasions, we have removed those folders before compressing. Running `npm install` and `bower install` after sharing your code is another pain.

Wouldn't it be awesome if you could share your project without removing these folders from your project.

That's when I thought of utilising git to share code.

## Sharing code locally with git

So, this is my current favourite way of sharing code with non-core team members. I can share my `.git` folder and they can clone the repo over local network.

Let me share ruby snippet on how I do this:

### Code for sharer
```sh
cd your-awesome-project #move to the project you want to share
ruby -run -e httpd .git -p 8080 # serve you projects git folder over http on port 8080
git update-server-info
```

**What's happening here?**

After moving into the project which is to be shared, I am using ruby command to share it's `.git` folder (`.git` is the folder that contains all the information that is necessary for project in version control). You can also use python or node to serve `.git` folder, snippets below:

#### Node

You can use <a href=https://www.npmjs.com/package/serve rel="nofollow" target="_blank">Serve</a> package to serve folder.

```sh
npm i -g serve #install serve
serve .git #serve .git folder with serve library
```

#### Python

You can also use your favourite python code to serve folder.

```sh
cd .git && python -m SimpleHTTPServer
```

<BlogDetailsNoticeWrapper class="notice--info block">
Last command, `git update-server-info` may be new command to even seasoned git users. It adds little extra information to our Git repository that a more complete Git server would handle for us. More technical details can be found in the <a href=https://git-scm.com/docs/git-update-server-info rel="nofollow" target="_blank">official documentation</a>
</BlogDetailsNoticeWrapper>

Since we are done serving our code with one of our favourite language and added that little extra info to be able to serve as git server, let's move to steps required on receiver side.

### Code for receiver

Receiver can now clone your repo:

```
git clone http://10.10.11.17:8080 ./your-awesome-project-cloned
```

<BlogDetailsNoticeWrapper class="notice--warning block">
I have been using internal ip(10.10.11.17) in example which you need to replace with sharer's ip.
This ip can be obtained with `ifconfig` command on mac,linux. (Try `ip a` if `ifconfig` doesn't work on your linux since net-tools has been deprecated in favor of iproute2).
</BlogDetailsNoticeWrapper>

## Sharing Code with people on different network

<a href=https://www.sitepoint.com/use-ngrok-test-local-site/ rel="nofollow" target="_blank">You can use `ngrok` to share with people who are not inside same network as you.</a>

## **Limitations**

1. At this point, anyone with the URL from Step above can pull code from your local repository. Without a complete Git daemon, they cannot push to your local repository, and you will need to run git update-server-info every time you make a change on your machine (e.g. after each new commit).
2. Your team member has to serve and you have to clone to get changes back to your machine.

You may want to look at this article for complete access including push:
<a href="http://railsware
.com/blog/2013/09/19/taming-the-git-daemon-to-quickly-share-git-repository/" rel="nofollow" target="_blank">Git daemon to quickly share git repo</a>

Have you tried this before? How do you share your code with non-core project member. Please feel free to comment below:

References:
1. <a href=http://blog.testdouble.com/posts/2017-02-01-local-clone-over-http.html rel="nofollow" target="_blank">local clone over http</a>
