---
title: Running Docker as SSH Daemon
categories: devops
directory: devops
excerpt: Setup and run docker as ssh daemon
tags:
  - docker
comments: true
share: true
toc: true
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
date: "2016-02-06T00:07:54+05:45"
last_modified_at: "2016-04-10"
show_category_hero_image: false
---

Please follow [this tutorial][install-docker-in-ubuntu] to install docker.

## Step-by-step guide for running docker as ssh daemon
Dockerizing a SSH daemon service is two step process:

1. Build a docker image
2. Run the docker image in a container

### Step1 (Build)
First we need to build a docker image. For this copy the code below and paste it to your Dockerfile.

```ruby
# sshd
#
# VERSION               0.0.2

FROM ubuntu:14.04
MAINTAINER Sven Dowideit <SvenDowideit@docker.com>

RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo 'root:screencast' | chpasswd
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]

```

Now enter the following command to build the image:

```bash
$ sudo service docker restart
$ sudo docker build -t eg_sshd . #please don't forget the dot in this command
```

### Step2 (Run)

Now all we need to run this image in a container. Let’s run our image eg_sshd in a container test_sshd.

```bash
$ sudo docker run -d -P --name test_sshd eg_sshd
# -d runs container in background and print container ID
# -P Publish all exposed ports to random ports
# --name Assign a name to the container
```

Please note that eg_sshd here is name for your image and test_sshd is name for your container, you can name them anything you like. We all know that default port for ssh service is 22 so let’s find out what host port the container’s port 22 is mapped to:

```bash
$ sudo docker port test_sshd 22
0.0.0.0:49154
```

Now we have port number we want to ssh to but still don’t know the ip. Enter the following command in your terminal to reveal ip of your docker daemon.

```bash
$ ifconfig
docker0   Link encap:Ethernet  HWaddr 00:00:00:00:00:00
          inet addr:172.17.42.1  Bcast:0.0.0.0  Mask:255.255.0.0
```

For me the ip address was 172.17.42.1. Enter the following code to ssh into your docker container.

```bash
$ ssh root@172.17.42.1 -p 49154
# The password is `screencast`.
```

Congrats! you have now sshed into your docker image. Finally you can clean up after your test by stopping and removing the container, and then removing the image.

```bash
$ sudo docker stop test_sshd
$ sudo docker rm test_sshd
$ sudo docker rmi eg_sshd
```

This tutorial was made with reference of [docker ssh example][docker-ssh-example].
You can also visit [flux7’s docker tutorial][flux-docker-tutorial] for more knowledge. Please feel free to comment for suggestions.

[install-docker-in-ubuntu]: https://docs.docker.com/engine/installation/linux/ubuntulinux/
[docker-ssh-example]: https://docs.docker.com/engine/examples/running_ssh_service/
[flux-docker-tutorial]: http://blog.flux7.com/blogs/docker/docker-tutorial-series-part-1-an-introduction
