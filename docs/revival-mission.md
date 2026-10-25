# Progressive Overload — revival mission brief

**CORE PUBLISHED · INTENT-FIRST REDESIGN APPROVED · SILENT TIMER / CALENDAR · 25 October 2026**

The operator accepted the broader intent-first redesign, including user flows and a new data model where needed, then added a silent persistent rest timer with negative overtime and a simple recorded-training calendar with backfill. Running support is explicitly backlog. Preserve the familiar yellow, compact, boxy friends-tool character, offline use and recoverable history. Earlier presentation-only data/schema freezes describe completed waves, not a veto on this approved redesign. Current work remains local-trunk/private-preview only; no new publication, remote issue/PR mutation, or destructive user-data operation is authorized.

## 1. Purpose and audience

The operator's original intent was “housekeeping, upgrade stuff, revive the project.” The app is still used by the operator and close friends; “UX is bad.” The delivery instruction is “use a worktree, commit there. and merge to local trunk.”

**Mission:** make the existing local-first workout logger dependable, easier to use during a workout, and straightforward to maintain—without sacrificing anyone's accumulated history.

The primary audience is the current small group of lifters, especially returning users recording another effort from a phone. The operator explicitly selected iPhone and Android, with finding and repeating a previous lift as the leading UX outcome. A public launch, account system, growth programme, or general fitness platform is not assumed.

The unit of success is a real workout journey: find the previous effort, record what happened, verify the result, revisit it later, and recover it from a backup. More dependencies, screens, fields, or closed issues are not success measures.

## 2. Starting point: observed, completed, and still unknown

| State                          | Evidence and limitation                                                                                                                                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing product               | Local-first React PWA with workout create/edit/copy/delete, tags, search/date filtering, latest/history views, and raw JSON import/export. CSV export is incomplete as a backup.                                                                                                                           |
| Housekeeping completed locally | Commit `afbf1ec` updates the build/PWA/lint toolchain and compatible dependencies, fixes baseline lint failures, and documents data safety. It was committed in a task worktree and fast-forwarded into local `next`.                                                                                      |
| Checks exercised               | Frozen install, lint, and production build passed on Node 22.13. Disposable Chromium exercised old-to-new worker takeover with unchanged legacy storage, create/edit/copy, tags/filters/history, raw backup restoration, and offline logging. These are baseline proofs, not acceptance of future changes. |
| Security findings retained     | Recorded audit: zero high/critical entries; five moderate dependency paths across three advisories. Current applicability is qualified in `README.md`; this is not a zero-vulnerability claim.                                                                                                             |
| Backlog review completed       | The reviewed snapshot has 26 open issues and 14 open PRs. All PRs received intent/acceptance/disposition comments; titles and descriptions were preserved. No PR was closed or merged.                                                                                                                     |
| Production published           | The operator separately authorized publication. Vercel deployed `e52919a` to https://gains.odjhey.com; live old-client close/reopen preserved synthetic legacy data, and offline logging passed. The operator reported that the upgrade worked and backed up their data.                                   |
| Unknown                        | Comprehensive real-device/Safari, screen-reader and IME behavior, intended date/time policy, and optional feature-family semantics. Device priorities are now iPhone/Android; the approved UX priority is finding and repeating a previous lift.                                                           |

The product contract is in `README.md`. Historical requests remain in the [issue queue](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues) and [PR queue](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pulls); they are inputs, not an automatically approved release specification.

## 3. Non-negotiable boundaries

- **Preserve recoverable history.** In-place compatibility is not mandatory: the operator accepts a necessary manual Settings export → refreshed-app import. Existing storage keys/envelopes, name-plus-date identity, tag links, and dates may change deliberately with a tested legacy importer and explicit preservation mapping—not as unexplained cleanup.
- **Remain useful offline.** Routine workout recording must not acquire a login, backend, network, or analytics dependency. Do not silently add synchronization.
- **Preserve access to data.** Keep existing backups readable. Distinguish loading, importing, merging, replacing, and deleting; none is permission to perform another.
- **Do not assume storage follows an origin change.** Keep the existing production origin unless separately authorized. Manual export/import can bridge a chosen storage/schema transition, but this approval does not authorize a new hostname or a deployment.
- **Prefer repair to replacement.** A framework/state-management rewrite or CSS-major migration must solve an observed problem; it is not the initiative's goal.
- **Do not invent training semantics.** A personal record, overload, volume, difficulty, template, and completed workout are different concepts. New calculations or fields need agreed meaning.
- **No hidden expansion.** No GPS, social sharing, account/auth system, cloud sync, paid service, or collection of friends' data is implied by “revive.”

### Approved manual migration boundary

The old app uses `localforage`, which prefers IndexedDB and can fall back to WebSQL/localStorage. A disposable Chromium probe found an actual saved lift in IndexedDB database `localforage`, object store `keyvaluepairs`, not in `window.localStorage`. A particular friend's browser backend is not assumed; export through the app, not by scraping one storage API.

The accepted manual route is: obtain a complete backup from the old Settings before cutover → retain the old data and downloaded files → import the legacy export into the refreshed app → verify the restored workout history and associated data. The current raw JSON exporter creates one file per key; CSV alone omits units, notes, tags, and filters and is not an adequate migration backup.

A refreshed importer must accept the legacy exports and preserve lifts, dates, units, reps/sets, notes, tags, and saved filters, with any intentional transformation explained. Check representative values and associations, not just row counts. Invalid or interrupted import must leave the source backup usable and must not silently replace an existing destination. Keep a recovery path until the restored result is verified; do not make clearing storage or uninstalling the PWA the prerequisite.

This relaxes an automatic/in-place migration requirement, not the no-data-loss obligation. No schema rewrite, cross-user merge, change of production origin, or deletion of the source is required or authorized merely because manual migration is allowed. The local refresh now previews and validates legacy category restores, requires replacement acknowledgment, preserves unrelated keys, and verifies read-back. It keeps the existing schema; it is not an automatic schema-conversion or multi-key transaction system.

## 4. Approved core outcome

A returning lifter should be able to:

1. Understand where they are and identify the relevant previous workout, including which filters are active.
2. Create a new record or copy a previous effort; change the intended weight, unit, reps, sets, date, and notes without accidentally editing a different historical record.
3. Save and receive truthful feedback. Failure must not look like success or quietly discard the attempted entry.
4. Find the saved record immediately, then switch between latest and history without unexplained missing results.
5. Add/remove relevant tags without losing the workout or confusing the selected lift.
6. Back up complete data and restore the intended dataset without silently overwriting something else.
7. Repeat the journey offline and after an application update on the devices selected for acceptance.

**Usability target:** clear labels, understandable actions, readable mobile layout, usable touch/keyboard controls, and no need to know internal database keys for the ordinary logging journey. Establish the current interaction baseline first; do not invent a seconds/taps target or promise a visual redesign before observing the pain.

## 5. Whole-initiative delivery map

This is an outcome map, not a fixed implementation stack. Each wave should contain small end-to-end changes. Observation may reorder work; data-loss risk takes precedence over cosmetic improvement.

| Wave                                                 | Observable outcome                                                                                                                                                                                                                                                                                   | Status / scope                                                                                                                                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Recover a maintainable baseline                  | A reproducible, reviewed local build that preserves existing storage and offline operation; old PR intent is understandable.                                                                                                                                                                         | **COMPLETED LOCALLY** in `afbf1ec`; 14 review comments published.                                                                                                                     |
| 1 — Observe the real daily workflow                  | A representative populated workout journey is observed, friction is ranked, and operator device/task priorities are explicit. Include code-blind UX observation rather than only implementation opinion.                                                                                             | **AGENT OBSERVATION COMPLETE.** Baseline and guided acceptance/retest retained. Human/device acceptance remains separate.                                                             |
| 2 — Repair daily logging                             | Search/clear, create vs edit/copy, saved-record visibility, tags, and numeric entry behave coherently. Include any reproduced save/data-loss defect in the affected path rather than postponing it for polish.                                                                                       | **IMPLEMENTED LOCALLY.** Composed Chromium success/failure and independent source review completed.                                                                                   |
| 3 — Make recovery and lifecycle behavior trustworthy | Backup/restore and any necessary manual migration are understandable and complete; failure/cancel preserves recoverability. Offline reload, update takeover, and in-progress entry behavior are explicit and exercised. Refine accessibility and actual-device behavior across the repaired journey. | **IMPLEMENTED / LOCAL PROOF COMPLETE.** Actual legacy JSON migration, offline logging, and per-tab update consent exercised; physical-device/first-production rollout checks remain.  |
| 4 — Select extensions deliberately                   | Each historical feature family is accepted with semantics, deferred with rationale, or retired as obsolete. Only selected extensions are implemented.                                                                                                                                                | **DECISION NEEDED.** Not a promise to ship the whole backlog.                                                                                                                         |
| 5 — Accept and release safely                        | The composed daily journey meets the acceptance envelope; the operator accepts it. A separately authorized release reaches the existing origin and is checked for update/data compatibility.                                                                                                         | **FIRST CORE RELEASE COMPLETE** at `e52919a`; operator reported success. Subsequent UX work needs its own review and release authorization; broad device acceptance remains separate. |

Maintenance follows the same small worktree/review/smoke pattern after release. Keep setup and verification instructions usable; agree a lightweight dependency-review cadence with the operator rather than creating a maintenance service or another tracking system.

### First useful slice

Observe, then repair this populated-data scenario: **find a previous lift → copy it into a distinct session → adjust and save → clear the search/tag filter → see both the new result and the original history.**

This directly addresses search/clear consistency and create/edit/copy confusion. Verify form state, persisted values, and visible results—not merely a successful button click. The new-entry delete affordance belongs in this slice if it contributes to that confusion. Keep existing identity while it suffices; if changing it becomes necessary, use an explicit mapping and the approved migration path rather than quietly rewriting history.

## 6. Every open issue has a place

“Core candidate” means investigate against the journey and retain the demonstrated gap, not implement the issue title verbatim. “Later” keeps the original intent visible without committing to it.

| Family                        | Existing issues                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Proposed treatment                                                                                                                                                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Daily logging and findability | [#1](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/1), [#7](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/7), [#14](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/14), [#18](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/18), [#24](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/24), [#42](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/42), [#63](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/63) | **Core candidates.** Search/clear, two-decimal input, create/delete affordances, tag workflows, and understandable today/history filtering. Untagging already exists; multi-tag and inline-create requests are only partly covered. Confirm exact remaining behavior before closure. |
| Query boundary correctness    | [#69](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/69)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Supporting engineering.** Protect edit/copy/query payload behavior where it affects users. Housekeeping removed explicit `any` uses but did not establish runtime URL validation; do not claim this issue fully solved.                                                            |
| Portable data                 | [#54](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/54)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Later extension to core recovery.** CSV import needs agreed column/unit/date mapping and merge vs replacement semantics. Raw JSON restore already exists; it is not CSV import.                                                                                                    |
| Existing dataset loading      | [#70](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/70), [#71](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/71)                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Decision needed.** Preview vs active dataset switching, supported versions, and whether tags/filters travel together. A raw-key dropdown is not a user-profile or migration design.                                                                                                |
| Perceived difficulty          | [#57](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/57), [#73](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/73)                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Decision needed.** Existing request is optional, 1–5; historical absence stays unrated. Define scale wording/direction and copy behavior. No automatic training advice follows from collecting it.                                                                                 |
| Progress and overload insight | [#21](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/21), [#44](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/44), [#46](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/46), [#47](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/47), [#49](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/49), [#80](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/80)                                                                                      | **Later discovery.** Define comparable lifts/units, PR, overload, volume, increments, and time window before selecting a display or formula. A heavier weight and greater session volume are not interchangeable achievements.                                                       |
| Plans and templates           | [#25](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/25), [#43](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/43)                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Later.** Separate intended work from completed records. A plan must not fabricate workout history. Issue #18's today filtering is related, not the same capability.                                                                                                                |
| Other activity models         | [#3](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/3), [#38](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/38)                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **Later.** Bodyweight, holds, and skills require meaningful units/progression models; do not force them into weighted-rep assumptions.                                                                                                                                               |
| Sharing and location          | [#4](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/4), [#5](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/5)                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **Outside proposed core.** Revisit only for a concrete user need with explicit privacy and sharing scope.                                                                                                                                                                            |
| Architecture                  | [#55](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/issues/55)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Not a core prerequisite.** Preserve useful goals; predecessor MST work landed on `v2-mst`, not current `next`. Choose architecture from demonstrated needs, not checklist history.                                                                                                 |

## 7. PR disposition is separate from feature intent

- **Ten dependency PRs:** #81–#85 and #87–#91. The local baseline refresh covers their maintenance/security objectives without blindly merging old lockfiles or requiring a CSS-major migration. A closure decision must state whether the replacement is local-only, published, or deployed; none of these states implies the others.
- **[PR #72](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pull/72#issuecomment-6392530367):** tooling-only, current content no-op. Proposed closure unless an actual missing automation requirement remains.
- **[PR #74](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pull/74#issuecomment-6392530592):** retain optional difficulty intent; rework required-field/fallback-to-1 behavior. Rejection of this patch is not rejection of its useful goal.
- **[PR #75](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pull/75#issuecomment-6392530855):** retain read/load intent; current patch overwrites the chosen key and contains broken hook code. Do not merge it unchanged.
- **[PR #86](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pull/86#issuecomment-6392532407):** explicit app-core/persistence experiment, undocumented workout-user outcome. Park, isolate an experiment, or adapt one real lift flow only after that choice is made. A rewrite is neither automatically approved nor automatically rejected.

Close, consolidate, or rework only after the chosen disposition is authorized. Preserve issue context and link replacement work; no mass closure merely to tidy counts.

## 8. Acceptance envelope: what “revived” means

| Claim                                 | Required observation before calling it complete                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing users can keep their history | Prove the selected route with populated legacy data: either upgrade in place at the same origin or export through old Settings and import those legacy files into a fresh refreshed-app store. Verify representative workout fields, tags/associations, and filters; explain intentional transformations and retain source/backups until restoration is verified. |
| Daily logging is coherent             | Run find → create/copy → adjust → save → confirm → revisit. Editing affects the intended record; copying creates the intended distinct session; search/clear and history reveal the expected records.                                                                                                                                                             |
| Success and failure are truthful      | Exercise a real successful save and a controlled failure/cancel for the changed path. A failure is visible and preserves the user's opportunity to recover the attempted work; it is not reported as saved.                                                                                                                                                       |
| Recovery works                        | A complete backup restores into a disposable empty store and matches expected values, including notes/units/tags/filters. Legacy per-key exports remain importable even if the new internal schema changes. Invalid, canceled, or interrupted recovery must preserve the source backup and not silently destroy destination data.                                 |
| Offline and updates remain safe       | Exercise cached offline logging/reload and old-worker-to-new-worker takeover. Test an in-progress form during update; preserve it or provide an operator-accepted explicit recovery behavior.                                                                                                                                                                     |
| UX is improved, not just different    | Observe the representative tasks on agreed devices with populated data, clear navigation/actions, and usable input/focus/touch behavior. Compare the concrete friction found in wave 1; operator acceptance is based on the journey, not screenshots alone.                                                                                                       |
| Maintenance is sustainable            | A fresh checkout installs reproducibly and passes the affected checks; setup, smoke procedure, known advisories, and accepted limitations are discoverable. No unnecessary second architecture or tooling stack is retained.                                                                                                                                      |
| A live revival actually reached users | After separate release authorization, publish/deploy the selected candidate to the existing origin, exercise the installed-PWA update path, and record the result. A local merge alone satisfies only local readiness.                                                                                                                                            |

No fabricated performance target, automatic training recommendation, all-browser guarantee, or “all vulnerabilities fixed” claim is part of acceptance. Known failures remain visible; accepted limitations are recorded rather than hidden by weaker checks. Invite friends to review when useful and available, without presuming their participation or collecting their data.

### Exercised repairs and remaining risks

- Rejected save/delete/tag writes no longer invoke success callbacks or discard the mounted form; controlled failures and successful retries were exercised. Whole-snapshot concurrent editing across separate tabs remains a known limitation, not a sync feature.
- Editing supplies the original name/date identity; date/name changes replace that session and collisions are rejected. Name-based tag groups are not silently migrated; orphan assignments remain removable.
- UTC/local date semantics are unchanged. **[INFERENCE]** day-boundary expectations may still differ from the current policy; establish examples before changing stored timestamps.
- Baseline auto-update draft loss was reproduced. New clients now defer reload with explicit per-tab consent, including external worker takeover. Already-running legacy clients retain their old code, so the first rollout needs saved work/backups and installed-PWA verification.
- JSON validation/preview, complete category downloads, overwrite acknowledgment and keyboard-focus clearance were exercised. Recovery is one category per operation, not an atomic multi-key restore; its snapshot check cannot eliminate all concurrent-writer races.

## 9. Decisions for the operator

The operator selected iPhone/Android, finding and repeating a previous lift, and the compact original yellow/boxy character. They have now accepted the broader redesign direction and the silent signed rest timer/calendar requirements in section 18. Running remains backlog. Difficulty-scale wording, detailed progress formulas, and multi-dataset semantics still need their specific definitions before those features are implemented.

| Decision                                  | Recommended starting position                                                                                                   | Alternative / tradeoff                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Who and what to optimize first?           | Current users; repeat-workout logging, finding prior records, and recovering mistakes on their actual phones.                   | Prioritize another concrete task/device if it causes more pain. No public-launch scope is assumed.                                        |
| What counts as the first revival release? | Trustworthy existing daily logging plus safe recovery; optional fields/charts are not prerequisites.                            | Include one named extension because it is essential to this group; specify its outcome and accept the additional semantic/migration work. |
| Difficulty meaning and copies             | Keep rating optional and old records unrated; decide labels/direction and whether a copied effort resets before implementation. | Defer difficulty. Do not silently score old or copied work.                                                                               |
| Dataset loading                           | Start from the actual need: inspect an old backup/version, or switch active lifter datasets? Define the dataset boundary first. | Defer it if safe backup/restore resolves the real problem. No assumed multi-user isolation.                                               |
| Progress insight                          | Begin with one question and examples of correct results; define comparison/unit/time rules before charts.                       | Defer metrics rather than inventing a universal overload formula.                                                                         |
| App-core experiment                       | Keep it outside core revival unless one measured maintainability problem justifies a bounded experiment.                        | Select one existing lift flow to migrate and prove; do not expand directly to auth/backend/todos.                                         |
| Publication and rollout                   | Remain local-trunk-only until the operator chooses the candidate, origin, and release action.                                   | Authorize a specific push/release wave later; that is not granted by approving this brief.                                                |

## 10. Coordination and delivery contract

**Coordinator:** maintain the mission, current bounded wave, shared decisions, proof pointers, and unresolved risks. Delegate substantial independent slices with clear ownership, prevent overlapping edits, integrate reviewed work, and reassess against the root outcome. Do not outsource product semantics to implementers.

**Contributors:** work in task worktrees under `.worktrees/`, reuse existing patterns, preserve the data contract, and return concrete diffs plus affected-path evidence. Keep the main checkout on local `next`; commit in worktrees and integrate verified increments locally. Git owns commits, GitHub owns issues/PR discussion; this brief is not a duplicate completion tracker.

**Review:** use independent code/safety review and actual-surface observation where they answer different questions. An author smoke, passing lint, or attractive screenshot does not by itself establish acceptance. UI changes get before/after evidence; data changes get compatibility/failure-path proof.

**Authority now:** advance the approved intent-first redesign, including user-flow and model changes where needed for section 18, in task worktrees; preserve recoverable history/offline operation, commit and integrate verified increments into local `next`, and provide a private tailnet preview. This approval supersedes earlier presentation-only schema/identity freezes, not data safety. The prior core publication grant was fulfilled and is not standing release permission. Running implementation, unrelated backlog features or issue/PR closure/rewrites, remote merges, pushes/deployment, production-origin changes, destructive user-data operations and paid/external service adoption remain separate decisions. Manual migration is permitted with an explicit, proven preservation mapping.

## 11. Stopping conditions and next step

The **core** initiative is locally ready when its agreed daily journeys and recovery behavior satisfy section 8, affected checks/reviews pass, and limitations are explicit. The **live** initiative is complete only after an authorized rollout and observed acceptance on the selected devices. Optional backlog families may remain deliberately deferred; that is not incomplete core work when the operator has agreed the boundary.

At each wave, continue, reshape, or stop from evidence. If a required capability or authority is missing, name the exact missing prerequisite and continue independent authorized work; do not relabel a partial build as complete.

**Next:** review the local section 19 calendar/timer slice on the selected phones, then make a separate publication decision. Progress/rating rules, routine machinery and running remain deferred rather than being inferred from this delivery.

## 12. Core wave receipt — local readiness, not deployment

Code candidate `614e929` composes the persistence (`c28e09a`), logging (`f9bf72f`), and recovery (`f9229f9`) author lanes plus reviewed integration/update corrections. The final source passed lint and production build on Node 22.13; production asset `index-BVRTF5nw.js` identifies the final update-policy proof.

The coordinator exercised these actual browser paths with synthetic data:

- Populated find/copy/save/clear/history with literal `+`, Unicode, decimals, mixed units, optional notes, and legacy extra fields.
- Quota-failed save/delete/tag operations retained prior storage and attempted inputs; retries succeeded. Initial history-read failure prevented saving into unknown data. Edit identity changes preserved record count and colliding edits left history unchanged.
- Save and tag persisted before navigation. Keep editing retained the draft; explicit discard reset the new form. A delayed storage-completion probe verified that Home remount waited for queued Clear. Orphan tag removal remained available.
- All three actual old Settings JSON exports restored into a fresh destination and matched the source values/associations, preserving an unrelated key. Malformed/wrong-shape files and canceled restores made no writes; replacement needed acknowledgment and offered the previous destination's JSON.
- A rejected restore did not report success. A successful write followed by controlled read-back failure reported an unverified outcome, retained the source, and did not claim rollback. Legacy tag-envelope metadata and absent optional notes were preserved.
- Cached offline reload/create/save/reload succeeded. The legacy baseline-to-new-worker transition preserved seeded data. With two new controlled tabs, one deferred/canceled updating while another activated a real worker: its unfinished form survived; a later consented update reloaded and retained saved work.
- Keyboard Notes → Tab → Save stayed above fixed navigation at a 390px viewport. A 320px layout had no document overflow. Before/after screenshots and independent agent observations are retained in local session evidence, outside product commits.

Independent source reviewers accepted the persistence/update, recovery, and logging corrections after reported findings were resolved. Fresh code-blind agent acceptance completed the daily journey and one-category restore; a separate retest confirmed the unsaved-navigation repair. These are not human, screen-reader, physical-phone, Safari, all-storage-driver, or cross-device acceptance claims.

At the local core-wave handoff, no push, deployment, production data operation, optional feature implementation, or GitHub issue/PR closure had occurred. The subsequently authorized first publication is recorded below; the original 14 reviewed PRs remain separate from release-correction PR #92.

## 13. First production publication

The operator authorized “publish”. Vercel deployed the core and a hosting correction to the existing https://gains.odjhey.com origin at `e52919aa02727cc7f85627e6b04c84e7e9be0320`. Live verification found direct `/new` navigation returned 404 without a worker cache. [PR #92](https://github.com/odjhey/progressive-overload-is-the-name-of-the-game/pull/92) added the documented Vercel SPA fallback; `/new`, `/tags`, and `/about` then returned 200 and rendered correctly with the service worker bypassed, while JS/CSS and PWA files retained their actual content types.

In an isolated owned browser, closing old clients and reopening activated the new worker without clearing storage and preserved all synthetic workouts, tags, filters, legacy extras, and an unrelated key. Live offline create/save/reload and final stored-field assertions passed; browser error logs were empty. This does not establish every user's storage driver or device behavior. For the first update, save work/back up, close all app tabs/PWA, and reopen; do not clear storage or uninstall.

The operator then reported “worked. i backed up my stuff. i think safe to do a UX rework now”. This is human confirmation of their upgrade, not permission to discard history or assume the next UX is already accepted.

## 14. Previous UX wave — find and repeat

**Operator choices:** iPhone and Android; lead with finding and repeating a previous lift. Scope owner is the coordinator, with delegated UI implementation and independent UX observation; the operator retains product/release acceptance.

**Observable outcome:** a returning lifter sees useful previous efforts before advanced filters, finds the intended lift, chooses **Repeat**, sees the chosen source effort while adjusting the new one, saves a distinct record, and can verify both new and original history. Edit remains explicitly different from Repeat. Search, tags, dates, latest/history, custom units, notes, and recovery remain available.

**Design direction — amended by the operator:** keep the original bumblebee yellow/white/black feel of an internal tool for friends. Minimal, compact layouts for smaller phones, flat rectangular controls/sections, ordinary-sized type and numbers, little rounding, no shadows or decorative branding. Search and lift records lead; less frequent filtering can remain disclosed with active filters visible. Preserve usable labels/touch targets/keyboard focus, and reuse the existing stack. The earlier green/warm-paper notebook direction is superseded, not a requirement.

**Boundaries of that completed presentation wave:** existing hooks, schemas, name/date identity, tag meaning, date policy, backup validation and restore lifecycle were retained. The broader redesign in section 18 now permits deliberate model changes with proven migration. No account/sync feature, invented progress formula, automatic load recommendation or publication is implied by either wave.

**Local acceptance:** exercise a populated find → Repeat → inspect previous values → adjust → save → revisit/history flow; original records and legacy extras survive. Preserve truthful failure/retry, dirty navigation, save-and-tag, recovery, and offline use. Capture matched before/after views and check 320px reflow, phone-sized keyboard/focus clearance and a wider layout. Independent agent evidence is distinct from physical iPhone/Safari/Android and human acceptance.

## 15. First UX candidate — functional proof, visual direction rejected

Code candidate `15ebeb8` composes the UI author commits `af73b5c` / `2451515`, formatted scope commit `9921f3e`, and the independently observed History-return correction. Node 22.13 lint and TypeScript/Vite/PWA build passed; final runtime fingerprints are `index-5F2HiI8L.js` and `index-BUEScfn3.css`. There are no new dependencies, storage hooks, persistence formats, or recovery implementations.

A fresh code-blind agent completed find → repeat 62.5 kg at 63.75 kg / 3 × 8 → save → history, preserving the original, and verified that selecting the older 60 kg effort retained that source after entry-page reload. Its initial report found that canceling an older-record entry returned Latest and could hide the record under an older date filter. The correction carries only the UI view separately in the query; independent source delta review and a separate guided observer retest confirmed Back/Home, Keep/Discard, and Edit cancellation retain History and the original date/tag filters. Original observations remain unchanged.

Source-informed composed browser proof exercised failed-save retention and successful retry, seven original records/extras preserved after Repeat, source reference absent from saved records, newest-first history, identity-changing edit, collision refusal, dirty Keep/Discard, and save-and-tag. A later final-runtime save-and-tag → Home check retained History/date context and did not persist query context. Offline create/save/reload preserved decimal weight, arbitrary custom unit, and Unicode notes; recovery preview required acknowledgment, cancel wrote nothing, the generated JSON download payload matched stored workouts, and legacy workout restore matched the source envelope while leaving other categories and an unrelated key unchanged. Browser disk download capture was unavailable in this coordinator pass; the JSON blob payload, not a saved file location, was verified.

Matched before/after Home, Repeat, Settings, narrow and wide views were captured against the same synthetic fixture. Chromium reflow checks covered 320 px, 200% root text, and a 390 × 450 short viewport. Keyboard Notes → Tab focused Save above the fixed navigation in both normal and short viewports; final browser error log was empty. Evidence is retained outside product commits and has not been uploaded to a remote PR in this local-only wave.

This is responsive Chromium and agent/source evidence, not physical iPhone/Safari/Android, software-keyboard, screen-reader or human design acceptance. Existing date policy and concurrent-editor/restore limitations remain. Review the private tailnet candidate; production stays at `e52919a` until a separate release is authorized.

## 16. Authorized visual correction — compact friends' tool

Operator feedback: “we want the old feel and color. like an internal tool for friends. not a saas looking commercial one”; “keep it minimal but improve the layouts, keep it compact, assume it will be used by smaller phones”; “keep the boxy feeling”.

The coordinator's previous neutral/green notebook styling was an assumption, not an operator preference. Restore the exact original bumblebee palette and plain yellow navigation/header, remove the monogram/tagline/hero treatment, use compact rows/forms and minimally rounded or square boxes, and delete obsolete bespoke style scaffolding rather than layering another theme over it. Judge the layout on 320px-wide, short phones as well as larger views.

Retain the independently verified find/repeat, selected-source reference, newest-first/history-context, dirty/error, recovery and offline behavior. This is a presentation correction, not a data-model rewrite or permission to weaken interaction safety. Work in task worktrees, integrate verified commits locally and refresh the private tailnet preview; no push/deployment or remote issue/PR mutation is authorized. Physical-device and human visual acceptance remain separate from agent checks.

## 17. Compact correction receipt — local, not published

Code candidate `bdad39a` retains the find/repeat behavior and restores the original bumblebee presentation. Markup `a9ba499`, style simplification `a440347`, composed scope/formatting `cac072a`, and reference refinements `1b722ff` / `bdad39a` remove the rejected brand/hero/card treatment. Original theme variables and actual header/footer colors were compared with the live original and matched exactly. Inputs/buttons have 2px corners, ordinary-sized numbers and flat styling; no data hooks, schemas, dependencies or recovery implementations changed.

Node 22.13 lint and TypeScript/Vite/PWA builds passed. Final runtime fingerprints are `index-B7xkgSus.js` and `index-Br-SV32s.css`. Independent source review found no material changes to callbacks, fields, query context or safety behavior. A fresh code-blind agent completed the populated repeat/save/history and dirty-cancel flow at 320 × 568, and observed the restored plain yellow/boxy direction without claiming human aesthetic approval.

That observer and the coordinator identified that the previous-effort reference still occupied most of the initial entry screen. The source date/time now shares its heading, previous notes remain available in a native disclosure, and the copy instruction is shorter. On the coordinator's typical 320 × 568 fixture the complete Weight input was visible above the fixed navigation; this is not a guarantee for every name, locale, text size or device. A separate guided observer retest verified that disclosed source notes and copied editable notes remained intact, and separate saves/History and dirty cancellation still worked.

Composed browser proof also exercised failed-save value/storage retention and retry, unchanged original records/extras, History/date return context, recovery-preview acknowledgment and no-write Cancel, offline save/reload, 320px reflow and enlarged text, and short-viewport keyboard Save clearance. Final-runtime reference reload, note expansion, separate save/reload/History and browser error checks passed. Evidence and original reports remain outside product commits.

The private tailnet preview is the review surface. Production remains `e52919a`; no push, publication or remote issue/PR mutation occurred. This proof is responsive Chromium/agent evidence, not physical iPhone/Android, software-keyboard, screen-reader or human visual acceptance.

## 18. Accepted intent-first redesign

### Intent and retained character

The operator clarified that redesign includes the data model and user flows where needed, and said “agree, with your design proposals.” The goal is to remember previous training, record actual work without unnecessary re-entry, inspect meaningful history, organize exercises/workouts, and own/recover the data. Preserve the compact bumblebee yellow/white/black, boxy internal-tool-for-friends character on small iPhone/Android screens. Do not turn this into coaching, a social network, a dashboard product or a mandatory set-by-set workflow.

This accepted direction preceded implementation. Section 19 records the first local delivery through calendar and timer; it does not claim the entire optional backlog or a new production release.

### Model and recording flows

- **Exercise:** stable identity, name and tags. Renaming should not split history or orphan tags; labels are not identifiers. Migration must not silently merge different legacy names/variants.
- **Entry:** an actual performance with stable identity, training date, recorded-at time, notes and optionally reported effort. Recording time is not the performance's primary key. Old absence of a rating remains unrated; repeating does not copy an effort rating as a new observation.
- **Set group:** compactly records repeated work with its actual count, reps, load and unit. Different groups can capture different values. A legacy aggregate remains a group; do not manufacture separately observed per-set records or force a tap for every identical set.
- **Workout:** optional grouping of entries, with explicit attendance-only confirmation when someone trained but will add details later. Quick logging does not require starting/finishing a workout. An empty started draft is not confirmed training.
- **Tags:** classify exercises through their stable identities, not name-string relationships.
- **Draft versus actual:** Repeat/routine reuse prefills a draft, never completed history. Save records actual work. Routines describe intended work and stay separate from performances; do not add a second logging system or implement speculative routine machinery before the recording flow proves useful.
- **Progress:** begin with comparable history and explicit changes in recorded values. Do not equate a heavier load with better training or silently compare incompatible units. Define any metric and rating scale before shipping it.
- **Migration/recovery:** retain complete original exports, timestamps, units, notes, associations and unrecognized metadata through an explicit mapping. Do not invent old workout boundaries, ratings or precise individual-set details. A complete versioned backup must restore the redesigned data; manual migration is permitted, silent loss is not.

### Silent persistent rest timer

Operator requirement: “don't make sounds. thats not a requirement. we don't want to be intrusive”; show negative time to answer how long it has been since the rest period ended.

- One optional active rest timer persists locally across routes/reload and recovers elapsed time after backgrounding or reopening. Calculate signed remaining time from its saved deadline rather than decrementing a counter as though background callbacks were reliable.
- Continue below zero, for example `−00:35`; do not clamp to zero, stop automatically at expiry, or mistake expiry for readiness to lift.
- No sound, vibration, notification permission, push service, flashing expiry, automatic modal or completion nag. This is display-only rest assistance, not a lock-screen alarm guarantee.
- Manual start works without individual-set logging. Duration choice, extension, restart and stop remain explicit. Optional start after an explicit set-completion action must not start a timer merely because history was edited or an entry copied/saved.
- Timer state is transient local utility state, separate from training history. Starting/expiring it never creates a set or fills a calendar day. Restoring a history backup must not resurrect an old running countdown.
- No timer use is required to log training. Keep its persistent display compact rather than allowing it to consume the small-phone working area.

### Simple calendar and backfill

Operator requirement: a simple “did I workout?” calendar; seeing an unfilled date helps people notice training they did without the phone and enter it later.

- Show a simple month calendar with a binary recorded-training marker. Use accessible non-color-only day states. No fabricated intensity scale, streak pressure, leaderboard or implied requirement to train every day.
- Empty means **nothing recorded**, not proof that no training occurred. A marker comes from saved actual performance or an explicit “Trained — details later” confirmation, not a plan, draft, opened workout or running timer.
- Tap a date to see its recorded work and add/backfill a workout or entry with that training date preselected. Allow truthful attendance-only confirmation without inventing exercises, weights or sets; detailed entries can be added later without counting the day twice.
- Distinguish the selected civil **training date** from **recordedAt**, the instant the record was created. Logging an old workout today must fill the chosen old day, not today. Keep date-only attendance date-only; do not invent its exact performance time.
- Do not silently shift an already selected training day when the device timezone changes. Preserve legacy timestamp text and make import date interpretation reviewable rather than silently re-bucketing old history.
- Deletion/correction recomputes markers from remaining actual records and explicit attendance confirmations. An automatically derived marker is not a second editable source of truth; explicit attendance can be corrected/removed independently.
- The calendar represents this user's local training record. The mention of friends does not authorize shared accounts, remote observation of friends, telemetry or social comparison.

### Running — backlog, not this implementation

Operator: “we need to support runners as well (but this will be in the backlog, some of my friends started running).”

Retain the intent to log/review running appropriately later, rather than forcing distance/duration into weight/reps. Keep calendar presence activity-independent so future running records can contribute. Do not build running fields/screens, reserved placeholder models, GPS/location tracking, routes, live tracking, coaching or integrations now. Define the runner's actual recording/comparison needs when this backlog item is selected.

### Composed acceptance and first delivery slice

Prove legacy history remains recoverable under the selected model; then a user can find/repeat a prior effort, save actual work with originals intact, see its correct calendar day, notice an empty past day, backfill actual work/attendance without fabricated numbers, and revisit both history and calendar after offline reload. A silent timer must survive navigation/reload/background return, display signed overtime, and never trigger alerts or create training records. Backup/restore preserves the relationships and selected dates without restoring transient timer state.

Begin with the smallest populated quick-log → calendar → backfill → revisit path and its model/import contract; progress comparisons/routines follow only their defined user need. Implement the independent timer against its explicit state contract without turning it into a required recording step. Running stays deferred. Preserve meaningful failure/retry and draft recovery, inspect 320px/short-phone input/focus behavior, and separate agent/browser evidence from real-device and human acceptance. No new push/deployment follows from approving this brief.

## 19. Calendar and silent timer — local delivery receipt

The operator selected “go, work until the timer and calendar.” Runtime candidate
`bf41e61` implements that slice from `f4bff14`, retaining the original bumblebee
yellow/white/dark, flat boxy friends' tool. Final application fingerprints are
`index-DpSRXfDz.js` and `index-D4M7iLkE.css`. This is local-only work; the prior
publication grant is not reused.

### Delivered behavior

- Stable exercise/entry/group/workout identities, civil training dates separate
  from recording times, multiple aggregate set groups, ID-based Repeat/Edit,
  explicit global exercise rename and identity-linked tags. New entry URLs
  carry IDs and bounded view/date context, not complete private records.
- A reviewed version 2 cutover under new storage keys. Every original legacy
  key stays untouched; written/local date interpretation is explicit. Duplicate
  old name/date rows, exact names, notes, units, tag associations and unknown source
  metadata remain recoverable; old creation times remain unknown. A legacy aggregate
  is not expanded into invented individual sets or sessions.
- One complete training/preferences JSON backup and reviewed replacement restore,
  plus staged import of the three original per-key exports. Invalid/canceled
  previews do not write. Unverified and partially verified outcomes stay visible;
  malformed destinations are not silently treated as empty. Raw export remains
  available, including for unreadable current history.
- A binary month calendar from actual saved entries or explicit attendance.
  Choosing a day exposes its details/backfill actions. “Trained — details later”
  does not invent exercise data; later details count the day once. Removing that
  confirmation preserves actual entries, and deleting the final actual entry
  clears the day when no confirmation remains.
- An optional manually operated, locally persisted deadline timer with presets
  and custom seconds, extension/restart/stop, and signed negative overtime.
  No sound, vibration, notification permission, push, flashing expiry or popup.
  It never starts on save, records training, fills a calendar day or enters a
  history backup.

### Exercised evidence

Node 22.13 / Yarn 1.22 lint and TypeScript/Vite/PWA production build passed on
`bf41e61`. Independent model/recovery review found no material defect; source
flow review's saved-entry return finding was corrected and delta-reviewed.
Source reviews and fresh code-blind observation are separate from author proof.
Original reports and before/after screenshots remain in local session evidence,
not product assets or an unauthorized remote PR.

The composed browser proof used synthetic data only:

- Actual default-store migration preserved all seven original rows and their
  associations/extras. Downloaded original JSON matched source values; preview
  and Cancel wrote nothing; committed IDs matched the reviewed preview.
- Actual three-file manual migration into an empty origin, then generated
  complete-backup restoration into a second empty origin, preserved stable IDs,
  relationships, source metadata and preferences. The source's running timer was
  excluded; the destination acquired no timer.
- Repeat/reload, variable groups, durable Save and tag, retained-filter saved-entry
  visibility, explicit rename/tags, entry-only exercise moves and creation-time
  preservation worked. Quota failure retained form/storage; an accepted write
  with failed read-back stayed unverified, and retry reconciled the same entry
  with exactly one write rather than duplicating it.
- Attendance/backfill kept the chosen old training day while recording the real
  new creation time. Confirmation removal retained detail; deleting its final
  entry returned the day to blank. Selected dates stayed fixed in Adak and
  Kiritimati timezones. Cached offline reload, new-entry save and another reload
  retained the result.
- Timer duration choice did not restart it; cross-tab extension moved the saved
  deadline by 30 seconds. Navigation/reload, closing the owned app tabs and
  reopening, and native Chromium freeze/resume recovered negative overtime.
  Intrusive API counters remained zero and training/preferences stayed unchanged.
  Failed timer writes and corrupt timer JSON reported failure; explicit timer-only
  recovery did not change history.

A fresh code-blind phone pass completed logging/repeat, attendance/backfill,
confirmation removal, overtime and backup/restore. It found narrow recovery-result
overflow; a separate guided retest confirmed the corrected action fits, recording
time is distinguished from training time, scrolled-record entry opens at the top,
and selected-day returns are understandable. It did not establish human preference
or physical-device acceptance.

Final responsive proof covered 320 × 568, a 320 × 480 short viewport, 390 × 844,
a wider desktop, and enlarged root text. Original computed palette/header/footer
colors matched exactly. In the ordinary tagged fixture, Repeat/Edit fit above
fixed navigation; the six-row month fit with 44px-high days. Notes → Tab focused
Save above navigation on the short viewport. A cold calendar reload restored its
saved scroll position after history hydration. Larger text, long content,
expanded filters/timer controls or shorter screens still require normal scrolling;
these measurements are not a universal no-scroll promise.

### Retained boundaries

No running fields/screens, routine system, effort scale, invented progress metric,
account/sync service or remote observation of friends was added. No issue/PR was
closed or rewritten, and no push/deployment or real-user data operation occurred.
Physical iPhone/Safari/Android, real software-keyboard, screen-reader and human
acceptance remain separate.

Snapshot/revision checks are not cross-tab CAS; history and preference restore
are not cross-key atomic. Invalid current version 2 data is raw-exportable but
deliberately not overwrite-repaired by this API. Browser eviction and device-clock
changes remain real risks. The old production build cannot read new-format
records after a code rollback; keep complete backups and use a forward-capable
build for recovery. Publication still needs separate operator authorization.
