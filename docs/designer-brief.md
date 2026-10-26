# Progressive Overload: designer brief

## Product intent

A small, local-first workout log used by the owner and close friends. Help people remember their previous training, record what they actually did, and notice which days they have recorded.

The central question is: "What did I do last time, and what am I doing today?"

This is a practical tool for people who already train. It is not a coaching product, a social network or a commercial fitness dashboard. Friends use their own logs; the app does not share their activity with each other.

## Current features and the needs they serve

| User need                              | Current behavior                                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remember my previous effort            | Latest shows the most recent entry per exercise. History shows all entries. Search and date/tag filters help find an older effort.                                                              |
| Record similar work without retyping   | Repeat opens a new draft with the chosen effort visible as a read-only reference. Adjust weight, unit, sets, reps, date and notes, then save a separate entry.                                  |
| Describe the work honestly and quickly | Record a uniform set group, such as 3 sets of 8 at 62.5 kg. Add groups when load or reps differ. Individual-set tapping is not required.                                                        |
| Correct and organize my log            | Edit or delete a saved entry. Give exercises tags. Explicit exercise renaming keeps their history and tags together.                                                                            |
| See whether I recorded training        | A simple month calendar marks days with saved entries or explicit attendance. Select a date to inspect it or add details later.                                                                 |
| Record training I did without my phone | Mark "Trained — details later" without making up weights or sets. Add remembered details to that day later.                                                                                     |
| Time rest without disturbing the gym   | An optional silent timer supports presets, custom duration, restart, extension and stop. It survives navigation and reopening and continues into negative overtime.                             |
| Keep control of my data                | The installable web app works offline and stores data in the browser. Settings offers JSON backup/import and reviewed migration of old history. There is no account or cross-device cloud sync. |

Quick logging does not require starting or finishing a whole workout session. A saved exercise entry and a day marked as trained are different things.

## Design direction

- Keep the existing yellow, white and dark-text palette. The current yellow is `#f9d72f`.
- Keep it boxy, plain and compact. Flat sections, square or minimally rounded controls, little decorative chrome.
- It should feel like an internal tool for friends. Avoid commercial SaaS styling, oversized cards, hero sections, pills, upsells and elaborate branding.
- Design for small phones first, including 320px-wide and short screens. Reduce scrolling on common tasks without shrinking useful training information.
- Make the previous load, unit, sets and reps easy to scan. Keep Repeat and Edit distinguishable.
- Use familiar icons for frequent actions, with accessible names and visible focus. Keep text where the meaning is consequential, especially Save, data replacement and destructive confirmations.
- Current secondary controls use roughly 32px minimum targets and Save uses 36px. Inputs retain 16px text. These are reference choices, not a pixel-perfect specification; improve density without making the app difficult to tap or read.
- Notes, filters and timer settings can be disclosed when needed. A running timer should remain a small utility, not dominate the logging screen.

The screenshots show the current implementation. Improve its hierarchy, layouts and clarity rather than copying it pixel for pixel.

## Behaviors to preserve

- Repeat creates a draft, not completed training. It must not overwrite the source or start a timer automatically.
- A blank calendar date means nothing recorded, not proof that the person rested. Avoid streak pressure, intensity scores or implying that people should train daily.
- Backfilling yesterday must mark yesterday. Keep the training date separate from when the record was entered.
- Removing an attendance confirmation must not erase detailed entries. Adding details to a confirmed day must not count the day twice.
- The timer makes no sounds, does not vibrate, requests no notification permission and shows no expiry popup. Negative time answers "How long since rest was up?" Do not clamp it to zero or turn it into a lock-screen alarm promise.
- Saving and recovery must be trustworthy. Keep entered values after errors, warn before discarding unfinished work, and make backup replacement explicit. Never disguise an unverified save as success.
- Keep old history recoverable. A reviewed manual export/import migration is acceptable; silent loss is not.

## Deferred or outside this brief

Running support is wanted later. Distance, duration and comparison needs still need definition; do not force runs into weight/reps fields.

Routines/plans, effort-rating scales and calculated progress metrics are not current features. Do not assume that a higher weight always means better training or add automatic progression recommendations. Accounts, social feeds, leaderboards and remote observation of friends are not part of this brief.

## Reference screens

1. `01-workouts.png`: recent efforts, search, filters and compact Repeat/Edit actions.
2. `02-repeat-source.png`: the selected previous effort and a separate new draft.
3. `03-log-form.png`: the same repeat form, scrolled to set-group editing, notes and Save.
4. `04-calendar.png`: recorded training days and the selected day's details.
5. `05-timer-overtime.png`: the compact running timer after its deadline.

Reference build: local preview `1cf68ab`, not the older public production release. Screenshots use synthetic data, not anyone's personal history. Each capture is a 320 × 568 CSS-pixel mobile viewport, exported at 2× as a 640 × 1136 PNG. They are responsive Chromium captures, not physical iPhone/Safari or Android acceptance evidence.
