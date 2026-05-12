---
title: How to Sort an Array of Objects in JavaScript
categories:
  - javascript
  - entrepreneurial
directory: javascript
minute: 4
excerpt: How to Sort an Array of Objects in JavaScript
tags:
  - javascript
comments: true
classes: wide
share: true
date: "2020-03-26T07:51:29+05:45"
last_modified_at: "2020-03-26T12:30:29+05:45"
category: ['code-quality', 'entrepreneurial']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

## Using Lodash

<BlogDetailsNoticeWrapper class="notice--info block">
This article was written using `lodash` version `4.17.5`.
</BlogDetailsNoticeWrapper>

Here is the initial array I am trying to transform.
It is hand of a callbreak game, where user has 13 cards in hand.

```
//initial array
  var cards = [
    { suit: 'diamonds', rank: 8 },
    { suit: 'hearts', rank: 8 },
    { suit: 'spades', rank: 8 },
    { suit: 'clubs', rank: 11 },
    { suit: 'spades', rank: 3 },
    { suit: 'hearts', rank: 9 },
    { suit: 'clubs', rank: 12 },
    { suit: 'diamonds', rank: 4 },
    { suit: 'clubs', rank: 8 },
    { suit: 'hearts', rank: 7 },
    { suit: 'clubs', rank: 10 },
    { suit: 'hearts', rank: 4 },
    { suit: 'clubs', rank: 5 }
  ],
```

I would like to sort the cards in hand in descending order of `suit` and each suit ordered in descending order of `rank`.
You can do this by using following code:

```
_.orderBy(cards, ['suit', 'rank'], ['desc', 'desc']);
```

You need to pass the array of object you want to sort as first argument, followed by array of properties you would like to sort your array of objects, followed by the array of order(asc or desc) for each properties.

```
//result
[
  { suit: 'spades', rank: 8 },
  { suit: 'spades', rank: 3 },
  { suit: 'hearts', rank: 9 },
  { suit: 'hearts', rank: 8 },
  { suit: 'hearts', rank: 7 },
  { suit: 'hearts', rank: 4 },
  { suit: 'diamonds', rank: 8 },
  { suit: 'diamonds', rank: 4 },
  { suit: 'clubs', rank: 12 },
  { suit: 'clubs', rank: 11 },
  { suit: 'clubs', rank: 10 },
  { suit: 'clubs', rank: 8 },
  { suit: 'clubs', rank: 5 }
]
```

## Still here? Want some background story on how I ended up writing this article:

It is April 2020, Everyone is locked inside their home to avoid getting infected from Corona Virus. People are finding lots of ways to keep themselves busy and happy.
There are three common patterns on how people are passing time:

1. Binge watching movies, series in Netflix, Amazon Prime.
2. Cooking new delicacies;Thanks to youtube, it is easier to try new recipes watching the video tutorial
3. Playing online multiplayer games; Dota, Fifa for gaming enthusiasts while casual gamers are playing Facebook Instant games like Ludo, Card Games etc.

Being a software engineer and game development enthusiast, I really liked the potential of Instant Games. I like games that appeal to casual gamers, you can simply reach to large audience and games they like are also not to0 complicated to develop most of times.

So, I decided to develop a card game called Call Break for facebook. Call break has some nostalgia for me, back in my hostel days, most of my friends would waste a lot of time playing call break while all activities were banned and they were locked into dormitory to study for exam.

<BlogDetailsNoticeWrapper class="notice--success block">
Call Break is a variation of Spades game, usually played among 4 players.<br/> Players shuffle and distribute 13 cards each, and play 5 rounds to complete one game.<br/> Call Break, also known as 'call brake' is a relatively long-run game played with 52 cards deck between 4 players with 13 cards each.
</BlogDetailsNoticeWrapper>
