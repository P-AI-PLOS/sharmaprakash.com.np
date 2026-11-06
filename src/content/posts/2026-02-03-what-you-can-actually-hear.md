---
title: "What You Can Actually Hear: Sample Rate, Bit Depth and Bitrate"
date: "2026-02-03T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Sample rate, bit depth, bitrate and file formats: what the numbers mean and what they do not establish."
tags:
  - audio
  - flac
  - hi-res
  - bluetooth
  - ipod
series: pocket-hi-fi
seriesOrder: 1
cover: "/images/blog/audio/what-you-can-actually-hear.webp"
thumb: "/images/blog/audio/what-you-can-actually-hear.webp"
use_featured_image: true
draft: false
comments: true
share: true
last_modified_at: "2026-11-06T13:00:00+05:45"
---

Before IEMs, players and libraries, one question decides how much of the rest matters: what can a human ear actually hear? Most of the numbers printed on audio gear (44.1 kHz, 24-bit, 192 kHz, 990 kbps) answer a different question. This post sorts them out, so the rest of the series can spend money where it makes a difference.

## What the numbers describe

Sample rate, bit depth and bitrate describe different properties of a file. None is a score for the performance, recording or mastering.

## Sample rate: how often the sound is measured

A digital recording measures the sound wave many times a second. Each measurement is a **sample**; how many you take per second is the **sample rate**, written in kHz.

| Sample rate | Where you find it |
|---|---|
| 44.1 kHz | CDs, most music downloads and streams |
| 48 kHz | Video, phones, many streaming services |
| 96 kHz | Hi-res downloads |
| 192 kHz | Hi-res downloads, studio masters |

A sample rate of 44.1 kHz means 44,100 measurements of the waveform every second. That raises the obvious question: why does a CD at 44.1 kHz store sound only up to about 22 kHz?

### Why the highest pitch is half the sample rate

A band-limited signal can be reconstructed when the sample rate is greater than twice its highest frequency. Filtering is needed to prevent higher frequencies being mistaken for lower ones. Half the sample rate is the boundary, not a promise that a practical system passes every frequency up to it. This is the **Nyquist limit**, from the sampling theorem.

| Sample rate | Highest frequency stored | Audible? |
|---|---|---|
| 44.1 kHz | About 22 kHz | Covers the whole range of human hearing |
| 96 kHz | About 48 kHz | The extra range is ultrasound |
| 192 kHz | About 96 kHz | Bat territory |

That is why the CD's 44.1 kHz is not an arbitrary number. It is just over twice the top of human hearing, with a little room left for the filter that removes everything above the limit.

<figure>
<img src="/images/blog/audio/pocket-hi-fi/sample-rate-bandwidth.svg" alt="Frequency ranges on one scale: human hearing reaches about 20 kHz, 44.1 kHz audio has a 22.05 kHz Nyquist limit, and 96 kHz audio has a 48 kHz limit." loading="lazy" width="960" height="330" />
<figcaption>CD audio reaches just beyond the usual upper limit of human hearing.</figcaption>
</figure>

## Bit depth: how precisely each sample is stored

Each sample is a number. **Bit depth** is how many bits that number has, which sets how finely the loudness of each sample can be described. More bits mean a lower noise floor and a wider **dynamic range**: the gap between the loudest sound the format can hold and its own background noise.

| Bit depth | Dynamic range | Compared with listening |
|---|---|---|
| 16-bit (CD) | About 96 dB, more with dither | From a quiet room's background to louder than you should ever listen |
| 24-bit | About 144 dB | More than any playback chain or ear can use |

Sixteen bits already put the format's noise floor below the background noise of a quiet room at any sane volume. **Dither**, a tiny amount of added noise, pushes the useful range of 16-bit audio further still, and makes the reduction from 24-bit to 16-bit clean.

## Bitrate: how much data per second

**Bitrate**, in kbps, is not a measure of resolution. It is how much data the file uses per second of music, after compression.

- For **uncompressed** audio it is simple arithmetic: 44,100 samples × 16 bits × 2 channels is 1,411 kbps, the CD's bitrate.
- For **lossless** formats such as FLAC it is whatever the compression achieves. A CD-quality FLAC usually lands between about 700 and 1,100 kbps depending on the music. It tells you nothing about quality, only about how compressible the recording was.
- For **lossy** formats such as MP3 and AAC, bitrate is the quality knob. The encoder throws away detail it judges inaudible, and the lower the bitrate, the more it throws away.

So a FLAC file's bitrate is trivia, while an MP3's bitrate is the most important number about it.

## Lossy versus lossless

**Lossless** formats (FLAC, ALAC, WAV) give back exactly the samples that went in. **Lossy** formats (MP3, AAC, Opus, Ogg Vorbis) discard information to save space.

Lossy encoding removes information. Whether the difference is audible depends on the encoder, settings, recording and listener. Converting a lossy file to FLAC does not recover what was removed; repeated lossy encoding can introduce further artefacts.

Lossless matters most as a **master copy**. You can make any lossy version from it later, at any bitrate, without stacking losses.

## Higher-resolution files

Extra precision is useful during recording and processing. For playback, compare the actual release and master rather than assuming a higher-resolution version sounds better. Keep an original file if you want it for your archive; make a compatible copy when a player needs one.

The [library guide](/technical-notes/beyond-spotify-building-a-flac-library/) covers formats and tagging. [Xiph’s Digital Show & Tell](https://xiph.org/video/vid2.shtml) demonstrates sampling, quantisation and dither.

## The player decides what you get anyway

A file can only be as good as the device that plays it.

- **No iPod has ever played above CD quality natively.** The iPod Video's Wolfson codec runs at 44.1 kHz. Rockbox plays 96 kHz and 192 kHz FLAC, but resamples them to 44.1 kHz in software, which costs battery. The iPod part of this series covers that player.
- **Phone DACs are fine.** A modern phone's converter measures well. The problems are the missing headphone jack and the habit of listening over Bluetooth.
- **Dedicated hi-res players** do output hi-res, and differ from older players in power, output impedance and noise rather than in anything you would hear from the sample rate. The sources part of this series covers that.

## Bluetooth: compressed again, whatever the file

Bluetooth earphones receive audio over a radio link with limited bandwidth, so the phone encodes the music again with a Bluetooth **codec** before sending it. Even a lossless file arrives at your ears as a lossy stream.

| Earphones | Codec on an iPhone | Codec on Android | What reaches your ears |
|---|---|---|---|
| AirPods Pro (1st generation) | AAC, about 256 kbps | AAC | Lossy. Apple's own lossless catalogue is converted to AAC for AirPods |
| Sony WH-1000XM4 | AAC | LDAC, up to 990 kbps | Lossy on iPhone; close to CD quality on Android at 990 kbps, which often falls back to 660 or 330 kbps in busy radio areas |

Both also apply their own processing: noise cancelling, equalisation and the tuning of the drivers. That changes the sound far more than the source file's resolution does.

None of this makes Bluetooth bad. On a bus or a street, good AAC is hard to tell from wired. For quiet, careful listening, a wired chain removes one more variable.

## What this means for the rest of the series

- **CD-quality lossless** is a sound default for a listening library. Buy or rip at CD quality; choose hi-res when it gives you a master you prefer, not just a larger number.
- **Avoid low-bitrate lossy files** and anything converted from one lossy format to another. That is where real, audible damage lives.
- **Spend on the parts you can hear:** the signature of your earphones, their fit, and a source that suits them. Those are the next parts of this series.

## Sources

- [Hearing range (Wikipedia)](https://en.wikipedia.org/wiki/Hearing_range)
- [Nyquist–Shannon sampling theorem (Wikipedia)](https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem)
- [Audio bit depth (Wikipedia)](https://en.wikipedia.org/wiki/Audio_bit_depth)
- [Meyer and Moran, "Audibility of a CD-Standard A/D/A Loop Inserted into High-Resolution Audio Playback", JAES 2007](https://aes2.org/publications/elibrary-page/?id=14195)
- [Reiss, "A Meta-Analysis of High Resolution Audio Perceptual Evaluation", JAES 2016](https://aes2.org/publications/elibrary-page/?id=18296)
- [Apple: About lossless audio in Apple Music](https://support.apple.com/en-us/118295)
- [Sony: LDAC](https://www.sony.net/Products/LDAC/)
- [Bluetooth codecs, Audioengine](https://audioengine.com/explore/complete-guide-to-bluetooth-codecs-what-is-the-difference-aptx-vs-aptx-hd-aptx-adaptive-aac-ldac-lossless-bluetooth-5-2/)
