---
title: "The Homelab Music Recommendation Field Guide: Every Signal, Trade-off, and Winner"
date: "2026-08-12T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "A comprehensive reference for building Spotify-like music discovery at home: identity, metadata, sonic analysis, loudness, behaviour, collaboration, playlists, smart fades, household discovery, and how to choose between competing approaches."
tags:
  - homelab
  - music
  - recommendations
  - playlists
  - audio-analysis
  - musicbrainz
  - acoustid
  - navidrome
  - listenbrainz
use_featured_image: false
comments: true
share: true
---

There is no single “music recommendation algorithm”. A useful system is a
collection of evidence sources, candidate generators, policies, ranking rules,
and feedback loops. Each part answers a different question:

- **MusicBrainz:** what entity is this, and how is it related to other music?
- **AcoustID:** which recording is this file likely to contain?
- **Sonic analysis:** what does the audio sound like?
- **Loudness and dynamics:** how might it play beside another track?
- **Behaviour:** what does this listener actually choose, finish, replay, or
  reject?
- **Collaboration:** what do similar listeners enjoy?
- **Context:** what fits this session, device, room, and intent?
- **Smart fades:** how should an already-chosen set be sequenced?

This is a field guide for designing that system in a personal homelab. It is
intentionally broader than a recipe for one tool. The goal is to keep the
dimensions separate, combine them transparently, and know which approach should
win when their recommendations disagree.

## The architecture in one picture

```text
                          ┌──────────────────────────────┐
                          │ Shared library evidence       │
                          │ MusicBrainz, tags, AcoustID,  │
                          │ sonic vectors, loudness       │
                          └──────────────┬───────────────┘
                                         │
┌───────────────┐   plays, skips, saves  │  ┌────────────────────┐
│ Navidrome     │────────────────────────┼─►│ Per-user taste      │
│ playback      │                        │  │ and session state   │
└───────────────┘                        │  └─────────┬──────────┘
                                         │            │
                                         ▼            ▼
                          ┌────────────────────────────────┐
                          │ Candidate generators            │
                          │ sonic · metadata · behaviour    │
                          │ collaborative · discovery       │
                          └──────────────┬─────────────────┘
                                         ▼
                          ┌────────────────────────────────┐
                          │ Eligibility, ranking, diversity │
                          │ explanation, playlist objective │
                          └──────────────┬─────────────────┘
                                         ▼
                          ┌────────────────────────────────┐
                          │ Sequence and playback           │
                          │ energy · loudness · fades       │
                          │ album order · context           │
                          └────────────────────────────────┘

Missing music → approval queue → Lidarr acquisition → metadata review → library
```

The important boundary is this: recommendation output may propose a track or
album, but it must not silently mutate the library. A missing recommendation is
an approval item, not an automatic download.

## 1. First define what “recommendation” means

Different surfaces have different winners. Before choosing signals, name the
surface and its objective.

| Surface | The system is trying to… | Dominant dimensions |
| --- | --- | --- |
| Similar Song | Find nearby music for one seed | Sonic, work/artist relations, personal rejection |
| Song Radio | Sustain a coherent session | Sonic, behaviour, context, transitions |
| Daily Mix | Balance comfort and variety | Personal behaviour, recency, diversity |
| Discovery | Introduce unfamiliar music | Collaboration, novelty, sonic and metadata bridges |
| Continue Playlist | Preserve an existing intention | Playlist identity, context, sequence |
| Next in Queue | Choose one useful next track | Session behaviour, transition, duration, context |
| Album or Artist Radio | Expand a catalogue neighbourhood | Metadata, sonic similarity, collaboration |
| Missing Music | Find music worth requesting | Collaboration, external discovery, identity confidence |
| Smart Fade | Make chosen tracks play naturally | Loudness, dynamics, tempo, structure, gapless rules |

“Best recommendation” is incomplete without a surface. A quiet instrumental
track can be the best discovery candidate for an evening mix and the wrong next
track after a high-energy dance song. A loudness-compatible track can be an
excellent transition and a poor taste recommendation. A MusicBrainz relationship
can make a track worth investigating without making it sonically similar.

## 2. The dimensions of a music recommender

The following dimensions cover most of the useful design space. They should not
all be collapsed into one model. Some are evidence, some generate candidates,
some enforce constraints, and some only order playback.

### 2.1 Entity and identity

Identity answers: **what exactly is this?**

The useful entities are different:

| Entity | Meaning |
| --- | --- |
| Artist | A credited performer or creator |
| Recording | A particular recorded performance |
| Release group | The logical album, EP, or single |
| Release | A particular edition, country, label, or format |
| Work | The underlying composition |
| Track file | The local encoded file being played |

This distinction prevents common recommendation errors. A remaster may belong
to the same release group but contain different audio. A live version may be a
different recording of the same work. A deluxe edition may add tracks without
being a new album concept. A compilation track may appear under a different
release while remaining the same recording.

Use stable identifiers for joins. Names are not reliable keys because artists
change punctuation, recordings have alternate titles, and releases contain
editions, transliterations, and featured credits.

[MusicBrainz documents its database entities](https://musicbrainz.org/doc/MusicBrainz_Database),
including artists, recordings, release groups, releases, works, labels, and
relationships. MusicBrainz is an identity and relationship source, not a
personal taste model.

### 2.2 Editorial metadata and graph relationships

Metadata can provide useful candidate paths:

- same artist, producer, composer, performer, or remixer;
- same work or cover relationship;
- related release group, label, scene, or series;
- genre, era, country, language, and format;
- soundtrack, compilation, live, remix, or studio classification;
- credits for instruments and vocals;
- curated tags and community relationships.

This is the explainable graph layer. It can say “related because the same
producer worked on both recordings” or “another performance of the same work”.
It is especially useful when a track has no audio embedding.

Its limitation is important: a relationship is not proof of listening
compatibility. Shared genre tags can be broad. Shared labels can be commercial
rather than musical. Metadata coverage can be inconsistent. Treat metadata as a
candidate generator and explanation source, with confidence and provenance.

### 2.3 Acoustic fingerprint identity

AcoustID/Chromaprint-style fingerprints answer: **is this file likely to be a
known recording?** They are useful for:

- recovering identity from poor filenames or tags;
- detecting duplicate files and alternate encodings;
- mapping a local file to a recording identifier;
- sending uncertain files to a review queue.

AcoustID is not a taste or similarity engine. Two files with the same recording
may have very different encodings but match the fingerprint. Two tracks that
sound musically similar may have unrelated fingerprints. [The AcoustID web
service](https://acoustid.org/webservice) describes lookup by Chromaprint
fingerprint and duration.

Never let an ambiguous fingerprint match silently replace a reviewed identity.
Identity errors poison every downstream dimension: artist affinity, album
diversity, play history, and collaborative similarity.

### 2.4 Low-level acoustic features

Traditional signal analysis exposes measurable audio properties:

- tempo, beat positions, and onset density;
- estimated key and chroma/harmonic profile;
- spectral centroid or perceived brightness;
- spectral contrast and timbral texture;
- zero-crossing rate and noise-like content;
- energy envelope and dynamic movement;
- vocal probability and instrumental probability;
- silence, intro, outro, and section boundaries;
- duration and structural repetition.

These features are interpretable and useful for filters and transitions. They
can identify “instrumental, low-energy, long-form tracks” or “high onset density
with a stable beat”. Their weaknesses are estimation error, genre bias, and
feature correlation. Tempo and key estimates can be unreliable on live,
percussive, or rhythmically ambiguous recordings.

### 2.5 Learned sonic embeddings

An embedding represents a track as a point in a high-dimensional space. Nearby
points are candidates for sonic similarity. A learned embedding can capture
relationships that hand-designed features miss: timbre, arrangement, vocal
texture, production style, and broad mood.

Embeddings support:

- similar songs;
- song radio;
- mood and energy clusters;
- bridges between genres or eras;
- “more like this, but calmer/faster/more acoustic” exploration.

An embedding does not automatically know what one household listener wants. It
describes the audio neighbourhood; behaviour decides how much that neighbourhood
should matter. Store the model version and analysis timestamp because changing
the model can move every track in the space.

### 2.6 Loudness, dynamics, and mastering

Loudness is often useful for playback and dangerous for taste ranking. A louder
master can win a naive engagement comparison even when the listener does not
prefer it.

Measure separately:

- integrated programme loudness;
- short-term and momentary loudness;
- true peak and clipping risk;
- dynamic range or crest factor;
- silence at the beginning and end;
- energy trajectory across the track.

These measurements answer:

- Will one track jump out beside another?
- Will a crossfade hide a hard cut or create mud?
- Does the mix need normalization?
- Is the user selecting a mastering style, or simply receiving a louder file?

Use loudness mainly as a playback and transition dimension. It can be a small
context feature, but it should not overrule explicit dislike, personal affinity,
or sonic relevance.

### 2.7 Musical structure and arrangement

Two tracks can have similar average features but behave differently as music.
Structure analysis can estimate:

- intro length and whether the song begins immediately;
- verse, chorus, bridge, drop, solo, and outro regions;
- repetition and section similarity;
- instrumental breaks and spoken sections;
- live applause or abrupt ending;
- whether the recording is part of a continuous album sequence.

Structure matters for radio and fades. A long ambient intro may be perfect for a
slow mix and poor for a short queue. A skit should not be treated like a normal
track. A gapless album should preserve its intended order.

### 2.8 Lyrics, language, and semantic meaning

Lyrics add dimensions that audio alone may miss:

- language and transliteration;
- themes and topics;
- explicitness and content warnings;
- emotional tone of the words;
- narrative or seasonal context;
- user preference for vocal, instrumental, or lyric-heavy music.

Lyrics can improve a “songs about…” or mood request, but they introduce privacy,
copyright, language, and transcription-error concerns. Treat lyric-derived
features as confidence-scored and avoid presenting an inferred theme as fact.

### 2.9 Personal behaviour

Behaviour answers: **what does this person actually accept?**

Useful events include:

| Event | Default interpretation |
| --- | --- |
| Deliberate play | Positive evidence |
| Completion | Positive, but weaker than explicit feedback |
| Replay | Stronger active-interest evidence |
| Early skip | Negative or context-dependent |
| Favourite/rating | Explicit preference |
| Playlist addition | Deliberate intent |
| Search without play | Interest, not satisfaction |
| Queue removal | Negative session evidence |
| Dismissal | Strong negative constraint |
| Long inactivity | Rediscovery opportunity, not dislike |

Add context to every event. A track played from someone else’s party playlist,
through a sleep timer, or while testing a new client is weaker preference
evidence than a search and replay. A skip at three seconds means something
different from a skip after the final chorus.

Do not treat “never played” as dislike. The track may never have been surfaced,
may have been hidden by bad metadata, or may have arrived after the user’s
history window.

### 2.10 Recency, repetition, and novelty tolerance

Two listeners with the same favourites may want different repetition rates. One
wants familiar music; another wants new discovery.

Model:

- recency decay by track, artist, and sonic cluster;
- repeat rate after a recommendation;
- time since last play;
- artist and album saturation;
- discovery acceptance after first play;
- explicit familiarity/novelty preference;
- tolerance for reusing a favourite in multiple playlists.

Recency should decay behaviour, not identity. A favourite can remain a favourite
even when it has not been played for a year.

### 2.11 Collaborative and household taste

Collaborative filtering answers: **what do similar listeners enjoy that this
listener has not tried?**

For a small home, use sparse taste vectors over artists, release groups, sonic
clusters, eras, moods, and languages. A simple weighted cosine similarity is
enough to begin:

```text
taste(user, feature) = Σ event_weight × recency_decay × confidence
similarity(A, B) = cosine(taste_vector_A, taste_vector_B)
```

For user A, retrieve tracks that similar user B explicitly liked or repeatedly
completed, then remove tracks A dismissed or has already exhausted.

Protect privacy:

- require household opt-in for cross-user discovery;
- do not expose raw histories by default;
- require a minimum evidence threshold before sharing a track;
- use “popular among similar listeners” rather than naming a person unless they
  chose attribution;
- keep private playlists and sensitive listening categories private;
- report sparse evidence as low confidence.

A track played once during a shared party session should not become a household
truth. A strong favourite or repeated independent acceptance is better evidence.

### 2.12 Global popularity and external discovery

Popularity can help cold-start a user or surface a missing release, but it is a
weak substitute for personal fit. It creates a rich-get-richer loop and can make
the same popular artists crowd out the long tail.

External services such as ListenBrainz can provide collaborative history and
generated discovery. Treat external recommendations as candidates. Match them
back to local recordings by stable identifiers where possible, and mark misses
as unavailable or requestable rather than silently dropping them or claiming an
empty result.

### 2.13 Context and session state

Context answers: **what fits right now?** Useful, low-intrusion context includes:

- time of day and day of week;
- requested mood or energy;
- current session length;
- device type and speaker setup;
- whether transitions are audible;
- recent tracks in this session;
- familiar versus discovery intent;
- explicit activity chosen by the listener.

Avoid silently inferring sensitive activities when a simple user control will do.
“Calm”, “focused”, or “discover” is often enough.

### 2.14 Catalogue state and playability

Catalogue state is mostly an eligibility dimension:

- local readable file exists;
- metadata is complete enough to display correctly;
- recording is not duplicated in the queue;
- file is not quarantined or awaiting review;
- content and language rules are satisfied;
- the release is not a malformed compilation;
- missing albums are clearly distinguished from disliked albums.

Do not assign a negative preference score to unavailable music. Route it to a
review or acquisition queue.

### 2.15 Playlist intent and set-level constraints

A playlist is not just a sorted list of independently good tracks. It has:

- coherence;
- familiarity and novelty balance;
- artist and album diversity;
- theme or mood continuity;
- a duration or track-count target;
- a narrative or energy arc;
- coverage of the library;
- a policy for explicit and missing content.

These constraints belong to playlist construction, not only track ranking.

### 2.16 Transition and smart-fade compatibility

Smart fades answer: **given two eligible tracks, can they follow naturally?**

Consider:

- outgoing and incoming loudness;
- energy trajectory;
- tempo and beat stability;
- key or harmonic fit, when confidence is high;
- silence and intro/outro structure;
- live, spoken, skit, or album-sequenced status;
- gapless playback and user crossfade settings.

This is pairwise or sequence-level scoring, not a taste score. A recommended
track can be a poor immediate successor. Conversely, a transition-friendly
track is not automatically worth recommending.

Do not optimize smoothness blindly. Intentional contrast is sometimes the point.

### 2.17 Confidence, uncertainty, and data quality

Every signal should carry confidence and provenance:

- Was the MusicBrainz match reviewed or inferred?
- Was the fingerprint unique or ambiguous?
- Which sonic model and version produced the vector?
- How many events support the behavioural score?
- Is the collaborative similarity based on 20 shared features or two?
- Is the tempo/key estimate reliable for this recording?

Low confidence should reduce influence or route to review. It should not become a
confident-looking recommendation with an invented explanation.

### 2.18 Privacy, control, and fairness

Personalization is a product feature and a governance decision. Provide:

- separate accounts and history;
- clear opt-in for household correlation;
- explicit block, dismiss, and “less like this” actions;
- adjustable discovery level;
- transparent recommendation reasons;
- retention and deletion rules for event history;
- no hidden authority for recommendations to acquire or delete files.

The system should fail closed when identity, consent, or provider data is
unavailable.

## 3. What each approach can and cannot do

| Approach | Generates candidates? | Primary job | Common misuse |
| --- | ---: | --- | --- |
| MusicBrainz | Sometimes | Identity and relationships | Treating tags as taste |
| AcoustID | Usually no | Fingerprint-assisted identity | Treating identity as similarity |
| Sonic embedding | Yes | Audio-neighbour search | Ignoring user rejection |
| Low-level audio | Sometimes | Filters and measurable structure | Believing every estimate |
| Loudness analysis | Rarely | Normalization and transitions | Ranking loudness as preference |
| Lyrics/semantic analysis | Yes | Themes, language, meaning | Treating inferred themes as certain |
| Behaviour model | Yes | Personal affinity | Recommending only familiar music |
| Collaborative model | Yes | New discovery | Replacing personal taste with popularity |
| Popularity | Yes | Cold start and trend context | Rich-get-richer bias |
| Smart fades | No, normally | Order an eligible set | Making every mix smooth and bland |
| Human approval | No | Decide what enters the library | Assuming automation is authorization |

## 4. The recommendation pipeline

### Step 1: name the surface and intent

Ask whether this is Similar Song, Discovery, Daily Mix, Queue Next, or Smart
Fade. Choose the objective before choosing the weights.

### Step 2: generate candidates independently

Let several generators contribute small sets:

- sonic nearest neighbours;
- personal favourites and accepted clusters;
- MusicBrainz artist/work/relationship neighbours;
- household or external collaborative candidates;
- missing-release discovery;
- context and transition candidates.

Record the source, raw score, model version, and reason for every candidate.

### Step 3: apply hard eligibility filters

Hard rules cannot be overcome by a high score:

- explicit dismissal or block;
- unavailable file for a local-playback surface;
- duplicate recording or edition;
- content, language, or access restriction;
- artist/release cap explicitly requested by the user;
- malformed or unreviewed library entry.

Keep filters separate from penalties. “Never play this” is not a small negative
number.

### Step 4: normalize evidence

Sonic similarity, graph support, play affinity, and collaborative support have
different scales. Convert them to comparable bounded scores and retain confidence:

```text
effective_score = normalized_score × confidence × freshness
```

Do not allow a generator to win because its raw numeric range is larger.

### Step 5: rank for the surface

A transparent starting model might be:

```text
rank(track, user, surface, context) =
    0.30 × personal_affinity
  + 0.20 × sonic_fit
  + 0.15 × collaborative_support
  + 0.10 × metadata_relation
  + 0.10 × context_fit
  + 0.10 × novelty
  + 0.05 × transition_fit
  - repetition_penalty
  - negative_feedback_penalty
```

These weights are placeholders. They should change by surface:

- Similar Song raises sonic fit and lowers novelty.
- Discovery raises collaboration and novelty.
- Daily Mix raises personal affinity while enforcing diversity.
- Queue Next raises context and transition fit.
- Missing Music raises identity confidence and approval relevance.

### Step 6: re-rank for diversity and set quality

Select a playlist one item at a time, rewarding relevance while subtracting
similarity to tracks already selected:

```text
next = argmax(candidate) {
  relevance(candidate)
  - λ × similarity_to_selected(candidate)
  + μ × exploration_bonus(candidate)
}
```

This prevents one high-scoring artist or sonic cluster from taking over. Add
artist, album, release-group, and version caps. Keep enough familiar tracks to
earn attention while reserving a controlled share for discovery.

A simple 20-track discovery mix might start with:

```text
8 familiar or recently accepted tracks
5 personal sonic neighbours
4 collaborative discoveries
2 metadata or era bridges
1 deliberate exploration pick
```

The exact quotas are less important than making the trade-off visible.

### Step 7: sequence the chosen set

After selecting the set, order it using a transition score:

```text
transition(a, b) =
    0.35 × energy_continuity
  + 0.20 × loudness_compatibility
  + 0.15 × tempo_or_beat_fit
  + 0.15 × harmonic_fit
  + 0.15 × intentional_contrast
```

Preserve album order and gapless behaviour where the user asked for an album.
For a generated radio mix, allow more transition influence. For a new-release
surface, recency and identity should beat fade smoothness.

### Step 8: explain and measure

Every surfaced track should have a concise explanation based on actual evidence:

> Sonically close to your recent acoustic favourites; recommended by two
> listeners with similar taste; not played by you in the last year.

Do not claim “because you liked X” if X was only inherited from a household
playlist. Do not claim an album is unavailable when the lookup simply failed.

## 5. How to decide a winner when approaches disagree

Suppose MusicBrainz, a sonic model, loudness analysis, AcoustID, and smart fades
all produce different outputs. They are not five equal voters.

The decision order is:

1. **Surface objective:** what are we trying to produce?
2. **Hard policy:** is the candidate allowed and playable?
3. **Identity confidence:** do we know what the candidate actually is?
4. **Personal evidence:** has this listener accepted or rejected related music?
5. **Surface-weighted relevance:** which candidate best fits the objective?
6. **Set quality:** does it add useful diversity without breaking coherence?
7. **Sequence quality:** can it follow the previous track naturally?
8. **Exploration policy:** is some uncertainty worth accepting here?

The approach “wins” only within the question it is qualified to answer:

| Conflict | Correct decision |
| --- | --- |
| MusicBrainz relation vs sonic similarity | Use the surface: graph for editorial/artist discovery, sonic for Similar Song |
| AcoustID vs tags | Use the high-confidence identity match, otherwise review |
| Loudness vs preference | Normalize loudness; do not let mastering decide taste |
| Sonic similarity vs explicit dislike | Explicit dislike wins |
| Personal history vs household popularity | Personal history wins unless the surface is Discovery |
| Smooth fade vs album order | Album order wins for album playback |
| Familiarity vs novelty | Use the surface quota and the user’s discovery setting |
| Local track vs missing recommendation | Playable track wins for playback; missing item enters approval |

The winner is not the model with the highest raw score. It is the candidate that
survives policy, has sufficient identity confidence, best satisfies the current
objective, and still improves the playlist as a whole.

## 6. Why recommendation makes a playlist

A playlist is more than a bag of highly ranked tracks. It creates a session with
limited attention. The system has to manage competing goals:

- **relevance:** the user should recognize why a track is present;
- **coherence:** there should be a musical or editorial thread;
- **familiarity:** enough known material should build trust;
- **novelty:** discovery should add value rather than repeat history;
- **diversity:** one artist or album should not dominate;
- **pacing:** energy and duration should fit the request;
- **coverage:** the system should explore more of the library over time;
- **sequence:** the order should feel intentional.

That is why “top 20 recommendations” and “a good 20-track playlist” are
different products. The former can contain twenty independently strong tracks
that feel repetitive, exhausting, or incoherent when played together.

## 7. Household discovery: one user based on others

Keep three types of state separate:

### Shared library state

Identity, tags, fingerprints, sonic vectors, loudness, duration, and file
availability describe the music or local file and can be shared.

### Private user state

Plays, skips, favourites, ratings, private playlists, searches, dismissals, and
sessions belong to one user.

### Shared discovery state

Only the bounded output should cross the boundary: “a household favourite”, “a
track accepted by similar listeners”, or “a recommended album you have not
tried”.

For user A, retrieve tracks from similar consenting users B when:

1. B has strong evidence for the track;
2. A has not dismissed it;
3. A has not exhausted it;
4. it fits the current surface and diversity rules;
5. it is local or clearly marked as missing.

Use privacy-preserving explanations unless users opt into attribution:

- “Popular among listeners with similar taste in this home.”
- “A household favourite you have not tried yet.”
- “Added from the home discovery pool.”

Do not infer a full taste profile from a short setup session. Do not turn a party
playlist into a permanent household preference. Require minimum evidence, and
report sparse evidence as low confidence.

## 8. Smart fades and playback-aware recommendations

Smart fades should happen after recommendation and playlist selection. Their job
is to improve playback, not decide taste.

Use:

- loudness normalization;
- true-peak safety;
- intro/outro silence detection;
- energy and tempo trajectories;
- beat or bar alignment when confidence is high;
- harmonic compatibility as a soft preference;
- gapless album and user crossfade rules;
- manual override for intentional contrast.

For an album, preserve album order and gapless semantics. For a radio surface,
let transitions influence ordering. For a discovery list, do not reject an
important new track merely because it is hard to fade into the previous one.

The smoothest playlist is not automatically the best playlist. Contrast can be
the bridge that makes a discovery memorable.

## 9. Homelab component boundaries

Keep each service’s authority narrow:

| Component | Responsibility |
| --- | --- |
| Navidrome | Playback, accounts, interactions, local history |
| MusicBrainz / Beets / Picard | Identity and reviewed metadata |
| AcoustID | Fingerprint-assisted recording identification |
| AudioMuse-AI | Shared sonic analysis and similarity |
| ListenBrainz | Per-user scrobbling and external collaborative discovery |
| Smart playlists | Declarative local views of user activity |
| Recommendation layer | Candidate ranking and explanations |
| Aurral or discovery UI | Review and approval of missing music |
| Lidarr | Approved artist/album acquisition |

Navidrome supports scrobbling to ListenBrainz and maintains native listen
history; its smart playlists are useful for declarative, user-specific views
but are not a complete ranking engine. See the [Navidrome scrobbling
documentation](https://www.navidrome.org/docs/usage/features/scrobbling/) and
[smart playlist documentation](https://www.navidrome.org/docs/usage/features/smart-playlists/).

The system should remain useful when one dependency is unavailable:

- Navidrome downtime should not destroy analysis state.
- Audio analysis downtime should not prevent ordinary playback.
- ListenBrainz downtime should not erase local history.
- A failed external recommendation lookup is unavailable, not zero results.
- A recommendation service must not gain implicit acquisition or deletion power.

## 10. Feedback loops and evaluation

Record a small event stream per surface:

```text
candidate_generated
candidate_shown
candidate_started
candidate_completed
candidate_skipped(position)
candidate_favourited
candidate_added_to_playlist
candidate_dismissed(reason)
transition_accepted
transition_replaced
```

The distinction between shown, started, and completed tells you where the
problem is. No starts suggests poor placement or trust. Early skips suggest
ranking or identity problems. Completions with no return may indicate a useful
but unmemorable playlist. Repeated manual queue edits indicate a sequence
problem.

Evaluate each surface separately:

- completion and early-skip rate;
- replay and favourite rate;
- novel-artist acceptance;
- repeated-artist concentration;
- library and sonic-cluster coverage;
- missing recommendations routed correctly;
- queue edits and transition replacement;
- explanation accuracy;
- confidence calibration;
- cold-start performance.

With a small household, weekly human review is valuable. Inspect a fixed sample
of recommendations and ask:

- Was the identity correct?
- Was the explanation truthful?
- Was the track genuinely new for this person?
- Did a metadata or mastering feature dominate unfairly?
- Was the household evidence strong enough to share?
- Would the playlist still make sense as a set?

Do not optimize one metric alone. Low skip rate can mean the system is too safe.
High novelty can mean the system is exciting but poorly liked. Report a small
scorecard rather than declaring one universal winner.

## Final reference table

| Question | Primary dimension | Secondary dimensions |
| --- | --- | --- |
| What recording is this? | MusicBrainz + fingerprint identity | Tags, duration, review confidence |
| What sounds like it? | Sonic embedding | Low-level features, metadata |
| What does this person like? | Behaviour | Explicit feedback, recency, context |
| What should they discover? | Collaboration and novelty | Sonic bridges, metadata, popularity |
| What fits this session? | Context | Recent queue, duration, energy |
| Why this playlist? | Surface objective and quotas | Personal score, diversity, novelty |
| What should play next? | Sequence and transition | Loudness, tempo, structure, contrast |
| Can it enter the library? | Identity and approval | Availability, metadata, acquisition policy |
| Did it work? | Surface-specific evaluation | Human review, confidence, coverage |

The design rule is simple: **identity describes what the music is; sonic analysis
describes how it sounds; behaviour describes the listener; collaboration expands
discovery; context defines the moment; playlist logic balances the set; smart
fades order the chosen tracks; human approval controls the library.**

When those boundaries remain visible, a homelab can provide a genuinely rich,
Spotify-like discovery experience without pretending that every tool is a
recommender or giving automation uncontrolled authority over personal data and
music files.

<p class="not-prose"><a href="/tools/scrobble-stats/" class="link-underline">Explore your own listening history with the client-side Scrobble Listening Stats visualizer →</a></p>
