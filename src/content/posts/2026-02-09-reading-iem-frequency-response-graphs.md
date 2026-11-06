---
title: "Reading a Frequency-Response Graph: Targets, Ear Gain and Why Measurements Disagree"
date: "2026-02-09T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "How to read an IEM frequency-response graph: what target curves like Harman and diffuse field mean, why IEM graphs are never flat, which parts of the graph to trust, and how to use comparison sites without fooling yourself."
tags:
  - audio
  - iem
  - frequency-response
  - measurements
  - harman-target
series: pocket-hi-fi
seriesOrder: 3
cover: "/images/blog/audio/reading-iem-frequency-response-graphs.webp"
thumb: "/images/blog/audio/reading-iem-frequency-response-graphs.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-06T13:00:00+05:45"
---

The [part on sound signatures](/technical-notes/iem-sound-signatures-explained/) said to read graphs, not adjectives. This post is how. A frequency-response graph looks precise, but it only means something if you know what it was measured on, what it is being compared against, and which parts of it are reliable.

## What the axes mean

| Axis | Shows | Notes |
|---|---|---|
| Horizontal | Frequency, 20 Hz to 20 kHz | Logarithmic: each octave gets the same width |
| Vertical | Loudness in dB | Usually normalised so curves line up near 500 Hz or 1 kHz |

A few dB matters. A broad level change may be easier to notice than a narrow one. A narrow 3 dB spike is often less obvious. Broad trends matter more than small wiggles.

Most graphs are normalised to the same level at one frequency. That makes two IEMs comparable, but it also means "more bass" on a graph is always relative to the midrange, not absolute.

## Why an IEM graph is never flat

Sound in a room reaches your eardrum after passing your head, outer ear and ear canal. Those shapes boost the upper midrange. The open ear canal resonates, and the result is a broad lift centred roughly in the 2–5 kHz region. Reviewers call this **ear gain**.

You hear that boost all the time and your brain treats it as normal. An IEM sits inside the canal and bypasses part of it, so the IEM has to put some of that lift back. Measured on an ear simulator, a good IEM therefore shows a hump around 2–5 kHz. A flat line on that graph would sound thin and recessed.

This is why raw graphs are judged against a **target**, not against a flat line.

## Targets

A target curve is the response a reviewer or researcher thinks an IEM should have on a given measurement rig.

| Target | Idea | Shape on the graph |
|---|---|---|
| **Diffuse field (DF)** | Sound arriving equally from all directions in a reverberant room | Ear-gain hump, flat bass, no bass shelf |
| **Free field** | Sound from one speaker straight ahead in an anechoic room | Similar idea, different upper-mid detail |
| **Harman in-ear** | Built from blind listening tests run by Harman's research group | Ear-gain hump, a sub-bass shelf, gentle treble |
| **Reviewer variants** | Personal or community tweaks of DF or Harman | Usually less bass than Harman, or less upper midrange |

Harman's in-ear work, led by Sean Olive with Todd Welti and Omid Khonsaripour, measured how listeners rated many IEMs and modelled their preferences. Later analysis split listeners into groups. As reported, the largest group liked the target as it is, a smaller group preferred less bass, and another preferred more. A target is a statement about the average listener, not about you.

### The sub-bass shelf

The Harman in-ear target raises the low end below roughly 200 Hz, flattening out in the sub-bass. That shelf is the "weight" people describe. A purist who sometimes wants more bass should look closely here: an IEM that tracks diffuse field below 200 Hz will sound lean next to one that follows Harman. Neither is wrong. They are different answers to the same question.

## Which parts of the graph to trust

| Region | Trust level | Why |
|---|---|---|
| Bass, 20–500 Hz | High, if the seal is good | Easy to measure; mostly depends on seal |
| Mids, 500 Hz–5 kHz | High | Where couplers are designed to be accurate |
| Lower treble, 5–8 kHz | Medium | Peaks depend on insertion depth and ear shape |
| Upper treble, above ~8 kHz | Low | Standing-wave effects and coupler limits dominate |

Above about 8 kHz, small changes in how deep the IEM sits move peaks and dips around. Your own ear canal is a different length from the coupler's, so a sharp dip at 8 kHz on a graph may be a peak, or nothing, in your ear. Read treble as "more or less energy overall", not as the exact shape of each spike.

The bass region has its own trap: a measurement with a leaky seal shows less bass than the IEM really makes. The same is true in your ear, which is the subject of the fit post later in the series.

## Comparing measurements

Compare results from the same rig and measurement procedure where possible. Couplers, insertion depth, seal and normalisation can all change the curve. A target needs to match the measurement system; a curve from one rig should not be treated as interchangeable with one from another.

Treble peaks are especially sensitive to fit and the rig. Avoid deciding on an earphone from one narrow peak or dip.

## Using comparison sites

Sites built on the open-source "squig.link" graph tool let you overlay many IEMs measured by the same reviewer. They are useful for comparisons within a consistent dataset.

1. **Pick one database and stay in it.** Each site is one reviewer and one rig.
2. **Load a target first.** Choose the target the site was built around, then add IEMs.
3. **Add something you own and know.** Compare candidates against an IEM you have already heard. That calibrates the graph to your own ears better than any target.
4. **Normalise the same way.** Most sites let you align at a frequency or by average level. Keep it constant.
5. **Look at the broad shape.** Bass shelf height, ear-gain height, overall treble energy. Ignore single spikes above 8 kHz.
6. **Check for a "compensated" view.** Some sites show the IEM minus the target. A flat line there means "matches the target", not "flat sound".

## Use the graph as a comparison

Start with an earphone you know. Compare broad bass, midrange and treble differences, then check whether listening supports the difference you expected. A graph does not measure comfort or tell you which tuning you will prefer.

The [driver guide](/technical-notes/iem-drivers-impedance-and-choosing/) keeps the buying shortlist; [fit and eartips](/technical-notes/iem-fit-eartips-and-cables/) covers the part you can adjust without replacing the earphone.

## Sources

- [Testing Headphones and Earphones, audioXpress](https://audioxpress.com/article/testing-headphones-and-earphones)
- [The Shape of IEMs To Come, headphones.com](https://headphones.com/blogs/features/the-shape-of-iems-to-come)
- [GRAS: are the RA0401/RA0402 high-frequency ear simulators fulfilling IEC 60318-4 (PDF)](https://grasacoustics.com/fileadmin-gras/FAQ/Ear_Simulators/Are_the_RA0401_and_RA0402_High_Frequency_Ear_Simulators_fulfilling_the_IEC_60318-4.pdf)
- [A Deep Dive Into Harman Curves, Part 3, Headphonesty](https://www.headphonesty.com/2020/04/harman-target-curves-part-3/)
- [Harman research targets the B&K 5128, SoundGuys](https://www.soundguys.com/harman-research-targets-the-bruel-kjaer-5128-112247)
- [Talking With Dr. Sean Olive, PS Audio Copper](https://www.psaudio.com/blogs/copper/engaging-and-enthralling-music-for-all-talking-with-dr-sean-olive-of-harman-international-part-one)
