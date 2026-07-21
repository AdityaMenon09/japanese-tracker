# Japanese Tracker

A simple, self-contained web app to track daily Japanese study, built around one habit: do the flashcards every day, no matter what.

**[Open the tracker →](index.html)** (or enable GitHub Pages — see below — for a live link)

## What it does

- **Daily check-in** — log the four daily activities (flashcards, grammar, kanji, listening).
- **Streak counter** — flashcards alone keep the streak alive, so a lazy day never breaks the chain.
- **Progress stats** — current streak, best streak, days studied, and total hours logged.
- **12-week heatmap** — a contribution-style grid that fills in as you study.
- **Milestones** — the full roadmap from kana refresh through the N5 → N4 → N3 levels, as a checklist.
- **Free study links** — every free resource used in the plan, grouped by category.

Progress is stored in the browser using `localStorage`. It stays on the device and browser you use, so bookmark the page and return to the same one.

## The study plan

The full one-hour-a-day plan this tracker is built around is in [PLAN.md](PLAN.md), with a printable version in [japanese-learning-plan.pdf](japanese-learning-plan.pdf).

## Run it

No build step and no dependencies. Open `index.html` in any browser, or serve the folder:

```bash
python -m http.server
```

## Put it online with GitHub Pages

1. Push this repository to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, and save.
4. After a minute the tracker is live at `https://<your-username>.github.io/<repo-name>/`.

## Files

| File | What it is |
|------|------------|
| `index.html` | The tracker app (self-contained HTML, CSS, and JavaScript) |
| `PLAN.md` | The one-hour-a-day study plan and resource list |
| `japanese-learning-plan.pdf` | Printable version of the plan |
