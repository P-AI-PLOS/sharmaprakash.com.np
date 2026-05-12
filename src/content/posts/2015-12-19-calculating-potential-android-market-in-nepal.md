---
title: Calculating Potential Android Market in Kathmandu Valley
categories:
directory:
excerpt: some calculations on android users
tags: []
comments: true
share: true
date: "2015-12-19T10:10:39+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Forget about getting accurate data, even getting data in nepal is really difficult. This is an attempt to get rough figure on how many potential android customers can I get aged 15-35. This data might contains lots of error hence you are warned in the beginning if you are about to use this data.

## Population of Nepal
**Total Population**: [30,986,975 (July 2014 est.)][indexmundi] <br>
**Population of Kathmandu District**: 1,744,240 (2011,Central Bureau of Statistics)<br>
**Population of Kathmandu Valley**: [2,510,788][wiki-ktm-v-popn]<br>
Population of Nepal was 27.16 million in 2011 which means around 6.4% of total population resides inside Kathmandu district only.<br>
8.1% of total population resides inside Kathmandu Valley if referencing all data from 2011.


## GSM Mobile users [(data source: himalayan times)][tht]<br>
**Total NTC Users**: 10.08 million <br>
**Total Ncell Users**: 12.15 million <br>
Total GSM users in nepal seem to be 22.23 million. But we all know many of them have dual sims. This estimates about 71% of total population use GSM.

## Total mobile users using NTC and NCELL: <br>
There are 0.84 million cdma users to be added to above data of gsm users. Including them total mobile users seem to be 23.07 million which will amount to 74% of total population.

## Android and IOS phone users worldwide [(data source: idc.com)][idc-mobile-share]<br>
**Android**: 82.8% <br>
**IOS**: 13.9% <br>

## Android users in nepal
As there is no exact data for nepal, let's extract data with worldwide reference. 82.8% of 23.07 will be 19.1 million. It might be safe to asume there are 19.1 million android users.

### Android users inside ktm valley:
8.1% of 19.1 million = 1.55 million <br>
I know, I might have left some aspects in calculation and would like to hear your suggestions. But at this point let's assume there are 1.55 million android phone users inside ktm valley.

### 15-35 aged group

Phew!! It is already getting boring. The fact that, the end data won't be accurate makes this even more boring.

Let's see the data we have: [(data source: indexmundi.com)][indexmundi]

0-14 years: 31.6% (male 4,989,268/female 4,805,381) <br>
15-24 years: 22.6% (male 3,521,421/female 3,484,203) <br>
25-54 years: 35.7% (male 5,273,079/female 5,775,404) <br>

I couldn't find statistics report online so making rough calculations for % of population per age group, using formula: %population per age = (population in % / age_difference)

for 25-54: <br>
%population per age = 35.7/(54-25) = 1.23103448276

we need %population for 25-35 hence<br>
1.23103448276*(35-25) = 12.3103448276

so, %population for 15-35 = (%popn for 15-24) + (%popn for 25-35) = 12.31 + 22.6 = 34.91%

#### 15-35 aged group android users in nepal
34.91% of 19.1 million android users in nepal = 6.67 million.

#### 15-35 aged group android users in kathmandu

34.91% of 1.55 million android users from ktm = 0.54 million

Seems like, any android developer can target 5,40,000 android users aged 15-35 inside kathmandu valley.

## Every 1 in 6 mobile phone users in nepal use smartphone.
Recently, I came to know that, out of 12.15 million users of ncell only 1.5 - 2 million users are using smartphone. Seems like every 1 in 6 mobile phone users in nepal use smartphone.

So for further safety we can assume ktm has 0.09 million and whole nepal has 1.11 million android users aged 15-35.

Most popular android app that is used within nepal only must be [Nepal Loadshedding Schedule][loadshedding-android-app] with 500,000 - 1,000,000 installs. Total app installs came pretty close to our estimation of probable android customers that can be targeted by app developer in nepal assuming 15-35 is the most active user group for mobile apps.

## Potential market for internet based games

Most popular game in this category would be Clash of Clans. Clash of Clans doesn't reveal about number of users it has but one who really wants to know will somehow know. Let's reference to [clash of clan nepal's facebook page][coc-nepal] which has 29,102 likes when accessed on 2:30 pm, 19th december,2015.

Though everyone playing the game might not have liked the page, it gives us some idea about how many nepali users clash of clans currently has.

## Potential spenders in Nepal

Spending money in game in nepal is really tough thing to do. We cannot even use popular payment gateways like paypal.

Despite all the difficulties, people really spend money on games. I did a survey with 10 of my friends who were excessively playing games and found out that 3 of them had spend money on games. They shared their stories about how they had spent on Steam.

If this ratio of 0.3 is to be followed, out of 29,102 users, 8,730 might be actually spending money. 8,730 people out of 30 million might be really small and hard to find population. The probability of you meeting any nepali guy who spends money in games is 0.028%. No wonder, no-one believes that nepali users really spend money on games.

## How much is each in-app purchase worth?
You can probably have 8,730 spenders and if you just price one item for Rs. 10. You might earn Rs. 87,300 for every in app purchase you release. In-app purchase model would have done much greater if payment system was any easy.

References:

1. [http://www.indexmundi.com/nepal/demographics_profile.html][indexmundi]
2. [http://thehimalayantimes.com/business/nt-top-telecom-service-provider/][tht]
3. [http://www.idc.com/prodserv/smartphone-os-market-share.jsp][idc-mobile-share]
4. [https://en.wikipedia.org/wiki/Kathmandu][wiki-ktm-v-popn]
5. [https://play.google.com/store/apps/details?id=com.cms.xml&hl=en][loadshedding-android-app]
6. [https://www.facebook.com/clashclannepal/][coc-nepal]


[indexmundi]: http://www.indexmundi.com/nepal/demographics_profile.html
[tht]: http://thehimalayantimes.com/business/nt-top-telecom-service-provider/
[idc-mobile-share]: http://www.idc.com/prodserv/smartphone-os-market-share.jsp
[wiki-ktm-v-popn]: https://en.wikipedia.org/wiki/Kathmandu
[coc-nepal]: https://www.facebook.com/clashclannepal/
[loadshedding-android-app]: https://play.google.com/store/apps/details?id=com.cms.xml&hl=en
