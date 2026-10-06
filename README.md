# ROADY

**RACE. THINK. DISCOVER.**

> **Race through the world.**

Roady is a lightweight browser racing game where driving and learning are part of the same loop.

## Core loop

**Race → Encounter a challenge → Answer → Get a speed/score effect → Keep racing → Earn XP & coins → Upgrade → Race again**

Every challenge has a **30-second timer**.

## Current features

- Browser-first racing gameplay
- Three-lane road with steering controls
- Speed, distance, score and boost systems
- Road obstacles, stage-scaled hazards and collision penalties
- Stage-aware race HUD and visual pressure cues
- Lightweight route-aware roadside scenery
- Knowledge challenges with explanations
- 30-second challenge timer
- Correct-answer speed boosts
- Wrong-answer and timeout penalties
- XP and coin progression with stage-scaled finish rewards
- Five-stage progression
- Garage with Street, Sprint and Nitro
- Mechanically distinct unlockable rides
- Route-based knowledge: West Africa, Ghana, Blockchain
- Local progress with no account or login
- Sound and reduced-motion settings (reduced motion changes visual roadside movement without changing gameplay speed)
- Responsive mobile/desktop UI
- Keyboard controls for lane switching, boost and challenges
- Clean distinction between completed races and manually ended runs

## Philosophy

Roady is intentionally small and direct. It is **not** a social network, SaaS dashboard or online account system. The first version focuses on a simple browser experience: drive, think, learn, progress.

The educational crypto content is informational gameplay content, not investment advice.

## Tech stack

- React
- TypeScript
- Vite
- HTML Canvas
- CSS
- Browser `localStorage` for progression

The playable app lives in `web/`.

## Local development

From the `web/` directory:

    npm install
    npm run dev

Build for production:

    npm run build

## Controls

### Racing
- **← / →** or **A / D** — change lane
- **BOOST** — consume boost and increase speed
- **Space / B** — activate boost (ride-dependent power)
- **CHALLENGE** — trigger a knowledge challenge
- **C** — trigger a challenge while racing
- **END RUN** — leave the race without a completion reward

### Progression
Correct answers can increase speed, boost, score, XP, coins and answer streak.

Completing the race distance awards the completed stage reward and advances the stage up to Stage 5. Later stages extend the race distance and increase hazard pressure. Manually ending a run does not award a completion reward. Challenge answer order is randomized each time.

## Routes

| Route | Focus |
|---|---|
| West Africa | African history, geography and knowledge |
| Ghana | Ghanaian history, geography and local knowledge |
| Blockchain | Blockchain and digital-technology fundamentals |

More regions, cultures, knowledge categories and roads can be added without changing the core racing loop. Stage labels and challenge messaging now make progression more visible while preserving the fixed 30-second challenge timer.

## Progress storage

Roady stores gameplay progress locally in the browser under the `roady-v1` namespace. No Roady account is required for the current version.

## Project structure

    Roady/
    └── web/
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        └── src/
            ├── App.tsx
            ├── main.tsx
            └── styles.css

## Development direction

1. Stabilize the racing loop and production build.
2. Improve challenge variety and question quality.
3. Make route/stage progression more meaningful with harder later stages.
4. Expand the garage and player progression with meaningful vehicle differences.
5. Add richer road environments and visual feedback.
6. Expand world knowledge without turning the game into a quiz app.
7. Add more game settings and accessibility polish.
8. Keep the game lightweight and browser-friendly.

## Status

Roady is an active experimental game project under development.

**Name:** Roady  
**Tagline:** Race. Think. Discover.