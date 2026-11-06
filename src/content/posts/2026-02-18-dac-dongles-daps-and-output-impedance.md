---
title: "DACs, Music Players and Output Impedance"
date: "2026-02-18T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "A practical source guide covering output impedance, noise, power and connections, with a dated dongle price table."
tags:
  - audio
  - iem
  - dac
  - dap
  - spotify
series: pocket-hi-fi
seriesOrder: 6
cover: "/images/blog/audio/dac-dongles-daps-and-output-impedance.webp"
thumb: "/images/blog/audio/dac-dongles-daps-and-output-impedance.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-06T13:00:00+05:45"
---

A player needs to provide a compatible output, enough clean level and usable volume control for the headphones attached to it. Price and DAC branding do not establish those things.

This part covers that chain: what turns a file into sound, what to buy, and how a source's output impedance can change an IEM's tuning.

## What a DAC and an amp do

Music files are numbers. Earphones need a changing voltage. Two stages sit between them:

| Stage | Job | What goes wrong when it is poor |
|---|---|---|
| **DAC** (digital-to-analogue converter) | Turns the samples into an analogue signal | Noise, distortion; rarely audible in modern chips |
| **Amplifier** | Gives that signal enough voltage and current to drive the earphone | Hiss, clipping at volume, tuning changes from high output impedance |

<figure>
<img src="/images/blog/audio/pocket-hi-fi/signal-chain.svg" alt="The audio path runs from music file through player, DAC and amplifier to the IEM. The amplifier stage is where output impedance, noise and available power affect some pairings." loading="lazy" width="1000" height="350" />
<figcaption>The file is one part of the chain; the source and the IEM also have to work well together.</figcaption>
</figure>

With IEMs, the amplifier stage usually matters more than the DAC chip. Modern DAC chips measure well below audible limits. Output impedance, noise and power vary much more.

## Phones without jacks

Most flagship phones dropped the 3.5 mm jack years ago. You now have two options: Bluetooth, which moves the DAC and amp into the earphones, or a USB-C dongle.

Apple's USB-C to 3.5 mm adapter is a better starting point than its price suggests. Reference Audio Analyzer measured about 0.3 Ω output impedance and about 0.5 V RMS maximum output. That is low impedance and low power: fine for most IEMs, short of headroom for hard-to-drive headphones.

## Dongle DACs

The prices below are an October 26, 2026 snapshot retained in this November revision, not prices from the February placement date.

A dongle DAC is a small DAC and amp in a cable or stick. It plugs into the phone's USB-C port and powers itself from the phone.

| Option | Price | Outputs | Notes |
|---|---|---|---|
| Apple USB-C adapter | Low (Apple list price varies by region) | 3.5 mm | About 0.3 Ω, about 0.5 V RMS (measured) |
| FiiO KA11 | About $30 | 3.5 mm | Under 0.7 Ω output impedance (FiiO spec at 32 Ω) |
| Moondrop Dawn Pro | About $60 | 3.5 mm and 4.4 mm balanced | Output impedance not checked |

Dongles drain the phone battery faster. Some phones also resample all audio to 48 kHz before it reaches the dongle. Neither matters much for listening; both are worth knowing.

## Dedicated players (DAPs)

A digital audio player does one job. Its advantages are practical more than audible:

- **Battery:** music playback no longer drains your phone.
- **Storage:** a local FLAC library, no streaming or data needed.
- **Power and outputs:** more voltage, often a 4.4 mm balanced jack.
- **Focus:** no notifications in the middle of an album.

Sony's current high-end Walkmans show the range. The NW-ZX707 launched at a US suggested price of $899.99. The NW-WM1AM2 sells for about $1,400. An iPod Video 5.5G running Rockbox sits at the other end: a Wolfson WM8758 DAC, 16-bit/44.1 kHz, and a few ohms of output impedance. Later parts of this series cover that iPod in detail.

## The 1/8 output-impedance rule

Output impedance matters most when an IEM's impedance changes across frequencies, as it often does in multi-driver designs.

Every source has an output impedance. It sits in series with the earphone, so the earphone and the source form a voltage divider. If the earphone's impedance changes across frequency, as multi-driver IEMs do, the divider changes the tuning. The part on IEM drivers explains why.

The rule of thumb, popularised by the audio engineer and blogger NwAvGuy:

> Keep the source's output impedance below one eighth of the earphone's impedance.

| Earphone impedance | Maximum source output impedance |
|---|---|
| 32 Ω | 4 Ω |
| 16 Ω | 2 Ω |
| 8 Ω | 1 Ω |

The ratio is a screening guideline, not a universal audibility threshold. It is a rule of thumb, not a law. A single dynamic driver with a flat impedance curve tolerates far more. A multi-BA set with a curve that dips to a few ohms needs a source well under 1 Ω to sound as tuned.

Use the lowest point on the IEM's impedance curve, not the single figure on the box, when you apply it.

## Power and sensitivity

IEMs need very little power. A high-sensitivity IEM reaches loud levels with a fraction of a milliwatt. For IEMs, two things matter more than raw power:

- **Noise floor.** A sensitive IEM makes a noisy source hiss between tracks.
- **Volume steps.** Some sources jump too far between steps at low volume.

Power matters for big over-ear headphones and some planar IEMs. If your IEM gets loud enough with volume to spare, more power will not improve it.

## Balanced 4.4 mm

A balanced output drives each earpiece with two amplifier channels instead of one, and does not share a ground between left and right. The 4.4 mm Pentaconn plug is the common connector on DAPs and dongles.

In practice, balanced outputs often give more voltage and slightly better channel separation. On many devices the balanced side also has a different output impedance, sometimes higher. Check the spec for the output you will actually use.

Balanced is useful, not essential. Many IEMs ship with swappable 3.5 mm and 4.4 mm plugs, which makes trying both cheap.

## File formats

The [sample rate and bit depth guide](/technical-notes/what-you-can-actually-hear/) explains the format numbers. A larger number on a file does not establish that a player will sound better.

## Wired or wireless

A wired output and Bluetooth use different playback paths. Check the codec supported by both wireless devices and the mode actually negotiated. I use a cable with the iPod; [my Rockbox setup](/technical-notes/ipod-video-5-5g-rockbox-purist-player/) covers that device.

## What to buy

- **Phone only, IEMs under about $200:** a low-impedance dongle such as the Apple adapter or the FiiO KA11. Check that it supplies the level and connectors you need.
- **Multi-BA or tribrid IEMs:** confirm the source is well under 1 Ω on the output you use.
- **You want a separate device and an offline library:** a DAP. The next parts cover the iPod as a purist player and building a FLAC library you own.

## Sources

- [Spotify lossless launch, Stereophile](https://stereophile.com/content/spotify-premium-finally-gets-lossless-audio)
- [Spotify 24-bit lossless, audioXpress](https://audioxpress.com/news/spotify-finally-launches-24-bit-lossless-streaming)
- [Apple USB-C adapter measurements, Reference Audio Analyzer](https://reference-audio-analyzer.pro/en/report/amp/apple-usb-c.php)
- [FiiO KA11, Apos Audio](https://apos.audio/products/fiio-ka11)
- [Moondrop Dawn Pro, Frieve audio review](https://audioreview.frieve.com/products/en/moondrop-dawn-pro/)
- [The 1/8 rule, audioreviews.org](https://www.audioreviews.org/1-8-rule-and-apogee-groove/)
- [Sony Walkman prices, SlashGear](https://www.slashgear.com/1347620/new-sony-walkman-cost-price)
- [Bluetooth codecs, Audioengine](https://audioengine.com/explore/complete-guide-to-bluetooth-codecs-what-is-the-difference-aptx-vs-aptx-hd-aptx-adaptive-aac-ldac-lossless-bluetooth-5-2/)
