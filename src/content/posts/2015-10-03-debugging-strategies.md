---
layout: single
title: "Debugging Strategies"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-10-03-debugging-strategies.png"
thumb: "/images/blog/generated/thumbs/2015-10-03-debugging-strategies.png"
categories:
directory:
excerpt: Let's talk about debugging strategies with a bit of humour.
tags:
comments: true
share: true
date: "2015-10-03T10:34:42+05:45"
toc: true
use_featured_image: true
---

<p style="color:red">warning: contains lots of violence</p>

## Origin of bugs
Rear Admiral Dr. Grace Hopper, the inventer of COBOL, is credited with observing the first *computer bug*-literally, a moth caught in relay in an early computer system. When asked to explaiin why the machine wasn't behaving asintended, a technician reported that there was a "bug in the system", and dutifully taped it-wings and all-into the log book.

## Debugging Strategies


<BlogDetailsNoticeWrapper class="notice block">
<strong>way not to go:</strong> panic -> deny the bug's existence -> keep on denying -> ask proof -> realise the bug -> regret -> blame team member
</BlogDetailsNoticeWrapper>

Let's look at few strategies that work:

### Bug Reproduction
Everyone loves reproducing! what do you think is the cause of 7.3 billion population? Well, I just realised I was about to talk about different kind of reproduction.

Probably the best way to start bug fixing is to make it reproducible. We not only want to solve but also want to know if it is really fixed.

<BlogDetailsNoticeWrapper class="notice block">
<strong>way not to go:</strong> reproduce -> fix -> test -> announce the death</way>
</BlogDetailsNoticeWrapper>

Reproduction works well when you find the reporter and interview every possible fine details, like her address and phone number. Oh God! This topic is so distracting, let's move to another one.

### Tracing

#### Tracing your log file
Where do you go to find a criminal's record? Police station. Your log file is police station for your notorious bugs. Find those dumb bugs in log file and kill them. But some criminals never make it to police stations. Kill those politicians with the techniques just below.

#### Tracing your code
Visualize that piece of code that might be producing this bug and go through your code line by line. Put special messages and check where error is coming from. If you are lucky you will not be able to solve the error and get fired, but the chances are minimal.

### Rubber Ducking
This one is interesting! I wrote this whole blog post just for the pleasure of mentioning this term. I use this techniques often and finally know it by it's name.

**Technique is simple:** go and explain cause of problem to someone else. The other person should look over your shoulder at the screen and nod his or her head constantly (like a rubber duck bobbing up and down in a bathtub). They do not need to say a word; the simple act of explaing, step by step, what the code is supposed to do often causes the problem to leap off the screen and announce itself.

It sounds simple, but in explaining the problem to another person you must explicitly state things that you may take for granted when going through the code yourself. By having to verbalize some of these assumptions, you may suddenly gain new insight into the problem.

<BlogDetailsNoticeWrapper class="notice block">
<strong>history: </strong> An undergraduate at Imperial College in London, Dave did a lot of work work with research assistant named Greg Pugh. For several months Greg carried around a small yellow ruber duck, which he'd placed on his terminal while coding. It was a while before Dave had the courage to ask ...
</BlogDetailsNoticeWrapper>

But I have very sad experiences with *rubber ducking*, I have failed at it many times: I try to explain the problem to my friends and my smart enough friends immediately suggest solution. This has forbidden me to kill my precious time. I wonder what will I do with all those saved time!

Now it's time for both you and me to stop procastinating and go back to work. If you have some more time, feel free to comment. I will come back with <del> a </del> reply and we can procastinate together some day!
