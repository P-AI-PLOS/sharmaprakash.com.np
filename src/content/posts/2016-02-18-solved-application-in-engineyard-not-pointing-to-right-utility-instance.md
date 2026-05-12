---
title: (SOLVED) Application in engineyard not pointing to right utility instance
categories: devops 
directory: devops
excerpt: If background tasks are failing after you terminate your old utility instance serving redis or other such features, you should try restarting unicorn server.
tags: engineyard 
comments: true
share: true
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
date: "2016-02-18T13:58:49+05:45"
show_category_hero_image: false
---

Does this sound familiar?

Your fine working application hosted in engineyard suddenly starts showing some random errors! Even your mailers are not working and you have stopped receiving email from you application.

Chances are high that your background tasks are failing. They may be failing because they may not be pointing to right redis instance.

Recently, I encountered this problem. I got email from engineyard that my utility instance hosting redis server would be retired soon and I need to replace it as soon as possible.

I made a new utility instance for redis, terminated the old instance and started testing the app and realised that my app was failing at certain places. I realised my resque was not working properly either. I **redeployed and re-applied recipies** and tested again, but my app was still failing at those places.

I checked my error log file and it was throwing error like this:

```bash
Redis::CannotConnectError (Timed out connecting to Redis on ip-<old-ip>.us-west-2.compute.internal:6379)
```

I checked my `redis.yml` file and it looked like this:

```bash
production: 
host: ip-<new-ip>.us-west-2.compute.internal 
port: 6379
```

It was quite hard to understand why my application was pointing to old utility instance eventhough my redis config file had correct new ip. I contacted engineyard support team and they suggested I **restart unicorn server**.

Unicorn can be manually restarted as follow:

```bash
# first ssh to your engineyard app
$ ey ssh -e appname
# then reload
$ /engineyard/bin/app_myapp reload
```

And that was how one of the nightmares of playing around with production server ended for me. Hope it helps you too! If not, you should try getting help from engineyard support team. Their support system is great!

Happy Learning! :)
