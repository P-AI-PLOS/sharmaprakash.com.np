---
layout: single
title: "Estimating as a Programmer"
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-10-04-estimating-as-a-programmer.png"
thumb: "/images/blog/generated/thumbs/2015-10-04-estimating-as-a-programmer.png"
categories:
directory:
excerpt: A must read if you have doubt about your estimating skills.
tags:
comments: true
share: true
date: "2015-10-04T18:19:42+05:45"
toc: true
use_featured_image: true
---

Time estimation might be every developer's nightmare but it need not be your problem too. Here I try to talk about my latest learnings regarding time estimation.

## Selecting right unit to express estimation

One of the interesting things about estimating is that the units you use make a difference in the intepretation of the result.

If you say something will take 130 working days, then people may expect you to have finished it by 131<sup>th</sup> day and maximum tolerance time may be one week(they may even expect you to finish one week earlier!) but if you say it may take six months, people will look for it any time between five and seven months from now. Though both mean same time, later one seems to be a better option.

Below is the time estimate scale table as recommended in a book <a href="http://www.amazon.com/gp/product/020161622X?ie=UTF8&camp=1789&creativeASIN=020161622X&linkCode=xm2&tag=journey0a-20" rel="nofollow" target="_blank">The Pragmatic Programmer</a>

| Duration		| Quote estimate in 					|
|:------------- |:------------------------------------- |
| 1-15 days		| days   								|
| 3-8 weeks		| weeks   								|
| 8-30 weeks	| months								|
| 30+ weeks		| think hard before giving an estimate 	|

Presenting estimation with right unit is number one skill of time estimation but there are other steps too that can be followed for more accurate estimations.

## Steps to follow for better estimation

1. **Understand the requirements clearly:** This is the most important thing, if you want to reach any closer to accurate estimation. Without properly understanding the requirements, any estimation is nothing more than a random guess. Our team used to skip estimation for stories that were not clear, get clear about it and then estimate. If your product owner is in hurry to know estimation, he should be quick enough to make you understand the requirement.

2. **Break the story into subtasks:** Breaking down a big task into smaller chunks is another very crucial step.

	If you are estimating a large story without breaking it down, chances are high that you have not understood the problem properly and are unwilling to talk about it's details. Go back to step 1, clear confusions and proceed with breaking down.Sometimes it may not be unnecessary to break down and that's completely fine.

	Breaking down story into small chunks and estimating those chunks individually and summing up will significantly contribute in accurate estimations.

3. **Estimate for each chunk:** Topic itself speaks loud and clear. No discussion here :)

4. **Calculate the answers:** It's time to sum up the estimates and this is where you need to do a bit of extra work if you are estimating with your team instead of individually. While estimating in a team, there is high probability that different team members might have been proposing different estimation for each task and through some mechanism you might have reached a common estimate.

	In a team, different people can do different tasks more efficiently than their team members. Estimates might have been effected by such people. For eg: someone with past experience in some library might have said they can integrate that library in 15 minutes which might take 1 hr for any other team member. Just imagine this guy keeps this story until end of sprint and falls sick on last day! Things may go worse than 1 hr!

	It is very important to have some error time included in individual story's estimate.

	Having some error time included saves some time in sprint which can always be used to improve quality. This error inclusion is much recommended for beginners but don't start getting lazy and underestimating. That's even worse habit.

5. **Keep track of your estimating Prowess:** As I mentioned previously, estimating with inclusion of errors may bring you down to lazy habit of underestimating. So it is very important to keep track of your estimates. Accurate estimates increases your confidence and estimates that turn out wrong can teach you a lot. Just keep learning and your intution will start improving. Your estimates can only get better.

You may also want to see if you need to add seperate time for qa/bug-fixes.

## Dealing with requirement change

Despite following all those things there is one more factor which effects estimation: *change in requirement*. Every time you find change in requirements it is most advisable to honestly say, that is not how you saw the story. Then make a list of extra task you need to do, estimate for those task and ask for additional time.

Requirement changes generally come from managers or product owners who might not be from technical background like you, so it might be good idea to just talk about additional time needed rather than precisely listing extra tasks in front of them.

<BlogDetailsNoticeWrapper class="notice block">
This post is mixture of learning from book and my own personal experience. Chances are high that you might have different opinions. I would love to hear your opinions and improvement in this article.
</BlogDetailsNoticeWrapper>
