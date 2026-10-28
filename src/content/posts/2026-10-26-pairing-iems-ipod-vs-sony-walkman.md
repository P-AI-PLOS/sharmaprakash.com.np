---
title: "The iPod vs a $900 Sony: What You Actually Hear"
date: "2026-10-26T11:10:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Pairing IEMs with a Rockbox iPod Video 5.5G, and how it compares with Sony's NW-ZX707 and Signature Series Walkmans: output impedance, which IEMs suit which player, a buying order, and the settings that keep both honest."
tags:
  - audio
  - iem
  - ipod
  - rockbox
  - walkman
series: pocket-hi-fi
seriesOrder: 9
cover: "/images/blog/audio/pairing-iems-ipod-vs-sony-walkman.webp"
thumb: "/images/blog/audio/pairing-iems-ipod-vs-sony-walkman.webp"
use_featured_image: true
draft: false
comments: true
share: true
---

This is the last part of the series. The earlier posts covered what you can actually hear, sound signatures, graphs, IEMs, fit, sources, the iPod Video 5.5G with Rockbox, and building a FLAC library. This one puts them together: which IEMs to plug into the iPod, what a modern Sony Walkman changes, and how much of that difference you will hear.

The short answer: less than the price gap suggests. With a well-tuned single dynamic driver IEM and lossless files, most people struggle to tell a good old player from a good new one in a blind test. The gap opens up with certain IEMs, and that is what this post is about.

## The two players

The Sony side here means the current high-end Walkmans. The NW-ZX707 is the one most people consider; it lists around $900 at US retailers. The NW-WM1AM2 sells for roughly $900 to $1,000 now, after launching higher. The NW-WM1ZM2, the copper-chassis flagship, is about $3,700.

| | iPod Video 5.5G, Rockbox | Sony NW-ZX707 / WM1 series |
|---|---|---|
| Released | 2006 | 2021–2022 era models |
| DAC | Wolfson WM8758 | Modern DAC, Sony's own amp stage |
| Formats | 16-bit/44.1 kHz in practice | Hi-res PCM and DSD |
| Output impedance | Measured at roughly 3–11 Ω, varies with frequency | Not published by Sony; I have not found a bench measurement |
| Outputs | 3.5 mm | 3.5 mm and 4.4 mm balanced |
| Streaming | None | Android, Wi-Fi, streaming apps |
| Price | Second-hand plus a storage mod | About $900 to $3,700 |

The 16/44.1 limit matters less than it looks. CD quality already covers the range of human hearing; part 1 explained why a FLAC rip of a CD is the honest ceiling for most libraries. Hi-res files give you headroom for studio work, not an audible upgrade for most listening.

The row that matters is output impedance. For a category-by-category score of the two players, including battery, storage and value, see [A $900 Sony Walkman vs my modded 2006 iPod](/technical-notes/sony-walkman-vs-modded-ipod-video-scorecard/).

## Why output impedance decides the pairing

An IEM's impedance is not a single number. Its spec sheet quotes one figure, but the real impedance moves up and down with frequency, especially in multi-driver sets where a crossover splits the range between balanced armatures.

A player with high output impedance forms a voltage divider with that moving load. Where the IEM's impedance drops, the player delivers less; where it rises, more. The result is a frequency response the designer did not intend: bass can thin out, a treble peak can grow.

The usual rule of thumb is that the source should be under about one eighth of the IEM's impedance. Archimago measured a 5th-generation iPod at about 11 Ω at 1 kHz; Reference Audio Analyzer's 5.5G report shows lower figures, averaging a few ohms. Either way, by that rule the iPod is comfortable with IEMs that stay well above about 25–90 Ω across the range, and that rules out many multi-BA designs, which can dip into single digits.

A single dynamic driver has a much flatter impedance curve. Output impedance still shifts its level, but not its shape. That is why the iPod and a single-DD or small hybrid IEM get along.

On the Sony, I would expect a low output impedance from a current high-end player, but Sony does not publish the figure and I could not find a measurement, so treat that as an expectation rather than a fact.

## Which IEMs suit which player

These picks come from my own shortlist, sorted by signature (part 2) and by how forgiving they are of the source.

| Signature | Pick | Approx. price | Drivers | Best on |
|---|---|---|---|---|
| Neutral | Crinear Daybreak | $170 | 1 DD + 2 BA + 2 micro-planar | Both |
| Neutral | Softears RSV | $730 | Multi-BA | Sony |
| Bassy | Softears Volume S | $320 | Hybrid | Both |
| Bassy | Thieaudio Origin | $849 | Not checked | Both |
| Bright | Softears RS10 | $2,100 | 10, mostly BA | Sony |

The Daybreak is 20 Ω and 105 dB/mW, so the iPod drives it to loud levels without effort. Its impedance curve against frequency is not something I have seen measured, so I cannot say how much the iPod shifts its tuning; on a 20 Ω set, a few ohms of source impedance is enough to shift it a little. Listen before deciding it is a problem.

The pattern behind the table:

- **On the iPod:** one dynamic driver or a small hybrid. Fewer crossover points, a flatter impedance curve, and the tuning arrives mostly intact.
- **On the Sony:** anything, including large multi-BA sets like the RSV and RS10. This is where the newer player earns its price; it lets you use IEMs the iPod would colour.

More drivers does not mean better sound. It gives the designer more control, but the result is only as good as the tuning. Choose by signature first, then by source.

## A buying order

For a purist who sometimes wants bass, at both ends of the budget:

1. **Crinear Daybreak** first. Neutral, works on both players, and the cheapest way to hear what your library sounds like without colour.
2. **Eartips** before anything else expensive. Part 5 covered why; a seal problem costs more sound than any player upgrade.
3. **Softears Volume S** when you want bass. It keeps a reasonable midrange while adding weight, and it is a safer pairing with the iPod than a big BA set.
4. **Thieaudio Origin** instead of the Volume S if quality matters more than price.
5. **A Sony Walkman** only once you want a multi-BA IEM like the RSV, 4.4 mm balanced, or streaming. Buy the player for the IEM, not the other way round.

Notice that the expensive player comes last. The Daybreak on a Rockbox iPod is already a complete, honest setup.

## Settings on both players

The purist goal is the same on both: let the file and the IEM speak, and switch off anything that reshapes the sound.

| Setting | iPod, Rockbox | Sony Walkman |
|---|---|---|
| Equaliser | Off | Off |
| Tone controls | Bass and treble at 0 | Off |
| Enhancement | Crossfeed off | DSEE and ClearAudio+ off |
| Bypass mode | Not applicable | Direct Source on, which skips the processing |
| Dithering | On, for sources above 16-bit | Not applicable |
| Volume | Keep digital volume below clipping | Keep it in the normal range; use high gain only if needed |

Crossfeed is a reasonable exception if old hard-panned stereo recordings tire you; it is a comfort feature, not a fix. The same goes for a small EQ bass shelf on a neutral IEM when you want weight for one album. The point of turning everything off is to know what the neutral starting point sounds like, not to forbid changes.

## What you actually hear

Be honest with yourself about this part. Level-matched blind tests are the only fair way to compare players, because a louder one almost always sounds "better". I have not run a proper blind test of these two players, so I am not going to claim a difference I have not measured.

Where a difference is likely:

- **Multi-BA IEMs with low impedance dips.** The iPod's output impedance can change their tuning. A low-impedance source avoids that.
- **Very demanding IEMs or headphones.** More power and a balanced output help.
- **Lossy or poorly mastered files.** Neither player fixes them. A FLAC rip of a good CD does more than any upgrade here.

Where a difference is unlikely: a good single-DD IEM, lossless files, matched volume. Most of the $900 goes into features (streaming, storage, a screen, balanced output) and into the chance to use IEMs the iPod handles badly, not into a cleaner sound with an easy IEM.

## The series in one paragraph

Know what you can actually hear (part 1), so the numbers on a box stop deciding for you. Pick a signature you like (part 2) and confirm it on a graph (part 3). Buy one well-tuned IEM (part 4) and make it fit (part 5). Use a source with low output impedance for complex IEMs (part 6), or a Rockbox iPod for simple ones (part 7). Feed either with lossless files you own (part 8). Then stop shopping and listen.

## Sources

- [Archimago: Retro-measure, 2006 Apple iPod Classic and 5th gen](https://archimago.blogspot.com/2016/09/retro-measure-2006-apple-ipod-classic.html)
- [Reference Audio Analyzer: Apple iPod 5.5 Gen](https://reference-audio-analyzer.pro/en//report/amp/apple-ipod-5.php)
- [Moon Audio: Sony NW-ZX707](https://moon-audio.com/sony-walkman-nw-zx707-music-player.html)
- [ShopSavvy: Sony NW-WM1AM2 retailer prices](https://shopsavvy.com/products/sony-nw-wm1am2-walkman.md)
- [Funkykit: Sony launches NW-WM1ZM2 and NW-WM1AM2](https://www.funkykit.com/news/audio-visual/sony-electronics-debuts-two-new-premium-music-players/)
- [What Hi-Fi: Sony NW-WM1ZM2 review](https://www.whathifi.com/reviews/sony-nw-wm1zm2)
- [Worldwide Stereo: Sony NW-WM1ZM2](https://www.worldwidestereo.com/products/sony-nw-wm1zm2-256gb-signature-series-premium-digital-music-player)
- [Crinear Daybreak, headphones.com](https://headphones.com/products/crinear-daybreak-in-ear-headphones)
- [Softears RSV vs Thieaudio Origin, IEM Ranking](https://www.iemranking.com/compare/softears-rsv--vs--thieaudio-origin)
- [Softears RSV vs Volume S, IEM Ranking](https://www.iemranking.com/compare/softears-rsv--vs--softears-volume-s)
- [Softears RS10, Audio Essence](https://audioessence.ch/products/softears-rs10-reference-iems)
