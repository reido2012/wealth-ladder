## Net Worth Planner

A comprehensive financial planning tool that helps you climb the **wealth ladder** through systematic tracking, planning, and behavioral insights.

### 🎯 Why Use This Tool?

**The Wealth Ladder Concept**

Building wealth follows a predictable ladder where each level requires fundamentally different strategies. The majority of people worldwide fall between Level 1 and Level 2, making it exponentially harder to reach each successive level.

*This framework is based on "The Wealth Ladder" by Nick Maggiulli. Learn more about his data-driven approach to personal finance at [Of Dollars And Data](https://ofdollarsanddata.com/).*

**Complete Wealth Ladder:**

- **Level 1** (<$10k): Hourly jobs; $10-$100 opportunities
- **Level 2** ($10k-$100k): High-skilled work; $100-$1,000 opportunities  
- **Level 3** ($100k-$1M): Career advancement; side hustles; small investments: $1,000-$10k opportunities
- **Level 4** ($1M-$10M): Career pivots; start a business; medium investments: $10k-$100k opportunities
- **Level 5** ($10M-$100M): Grow a business; large investments: $100k-$1M opportunities
- **Level 6** ($100M+): Build an enterprise; significant investments: $1M+ opportunities

**Key Wealth Principles:**

**Enjoyment of Wealth**
- Enjoyment increases in factors of 10 because each level creates meaningful lifestyle changes
- Each level unlocks fundamentally different possibilities and freedoms

**The 1% Rule**
- *"If a particular income opportunity can increase your net worth by at least 1 percent, then you should do it"*
- Level 2 is about building skills to get paid more per hour going forward
- Income opportunities scale with your wealth level

**The 0.01% Rule (Trivial Spending)**
- 0.01% of your net worth is a trivial amount of money for you
- This tool calculates your trivial spending threshold automatically
- Use this to make spending decisions without overthinking small amounts

**Spending Philosophy**
- **Spend based on wealth, not income**
- **Income pays for necessities, wealth pays for upgrades**
- Your spending capacity should reflect your accumulated wealth, not just monthly earnings

This tool adapts its advice and calculations based on where you are on your wealth journey, because the strategy to get from Level 1 to Level 2 is fundamentally different from Level 5 to Level 6.

### 🧠 Core Philosophy: Behavioral Finance Meets Planning

**Why Most Financial Apps Fail:**
- They focus on budgeting (restrictive, negative psychology)
- They ignore the psychological aspects of money decisions
- They don't help you understand *why* you make financial choices

**Our Approach:**
- **Plan vs. Actual Tracking**: See your intentions versus reality without judgment
- **Anti-Spending Log**: Transform spending impulses into conscious savings wins
- **Guilt-Free Spending**: Budget for joy while staying on track
- **Strict Net Worth**: Separate liquid wealth from total assets for clearer decision-making

### 🚀 How to Use This Tool Effectively

**1. Start with Honest Assessment**
- Enter all your assets and liabilities (the tool handles multiple currencies)
- Categorize items (especially separate "Housing" from liquid assets)
- Set up your fixed monthly costs

**2. Plan Your Climb**
- Use the scenarios feature to model different savings rates
- See exactly how long it takes to reach the next wealth level
- Adjust your targets based on what's actually feasible

**3. Track Reality vs. Plans**
- Take monthly "snapshots" of your actual progress
- Compare planned savings vs. actual savings
- Learn from the gaps without self-judgment

**4. Optimize Your Psychology**
- Use the Anti-Spending tab to redirect impulse purchases into savings wins
- Set up guilt-free spending budgets for sustainable progress
- Celebrate milestones (the app literally celebrates with you!)

**5. Persist with Data**
- Export your data to CSV files for long-term tracking
- Link a local folder to automatically save your progress
- Build a historical record of your wealth-building journey

### 💡 Key Insights This Tool Provides

- **Strict Net Worth**: Your liquid wealth excluding housing (more actionable for decisions)
- **Feasibility Reality Check**: See if your savings goals match your actual income
- **Behavioral Patterns**: Understand your spending triggers and redirect them
- **Compound Growth Visualization**: See how small changes create massive long-term differences
- **Milestone Clarity**: Know exactly where you are on the wealth ladder

---

## Getting Started

### 📥 Download Desktop App (Recommended)

The easiest way to use this tool is to download the pre-built desktop application:

1. Go to the [Releases page](../../releases)
2. Download the latest version for your operating system:
   - **Linux**: `.AppImage` file
   - **Windows**: `.exe` installer  
   - **macOS**: `.dmg` file
3. Install and run the application

The desktop app provides:
- **Local file storage** - your data stays on your computer
- **Offline functionality** - works without internet connection
- **Automatic folder sync** - easily backup your financial data
- **Native performance** - faster than web browsers

### 🌐 Web Version Alternative

You can also run the web version locally if you prefer browser-based usage or want to contribute to development.

## Technical Setup

A React + Vite app with optional Electron shell for a desktop experience.

### Prerequisites

- **Node.js**: 20.x LTS or newer
- **npm**: 9+ (ships with Node 20)

If you use `nvm`:

```bash
nvm install 20
nvm use 20
```

### Install dependencies

```bash
npm install
```

### Run the web app (Vite dev server)

```bash
npm run dev
```

- Default dev server: `http://localhost:5173`
- Vite will hot-reload on changes.

### Run the desktop app (Electron, development)

This starts Vite and then launches Electron once the dev server is ready.

```bash
npm run electron-dev
```

Notes:
- This script waits on `http://localhost:5173`. Ensure port 5173 is free.
- If 5173 is busy and Vite prompts to use another port, Electron will not launch. Either free 5173 or explicitly start Vite on 5173:

```bash
npm run dev -- --port 5173
# in another terminal
npm run electron
```

### Build the web app (production)

```bash
npm run build
```

Artifacts are emitted to `dist/`. To locally preview the production build:

```bash
npm run preview
```

### Package the desktop app (Electron)

Builds the web assets and packages a desktop app using `electron-builder`.

```bash
# No publish; outputs installers/binaries locally
npm run dist

# Or build for all supported platforms from this host (if tooling present)
npm run dist-all
```

Common outputs:
- Staging web assets: `dist/`
- Packaged app artifacts: `release/` (e.g., AppImage on Linux)

If you need only a local runnable Electron app folder (unpacked):

```bash
npm run pack
```

### Troubleshooting

- **Electron window stays blank**: Verify the Vite dev server is running on `http://localhost:5173` before `npm run electron-dev` launches. Free port 5173 or force Vite to use it with `--port 5173`.
- **Build fails on fresh machine**: Ensure Node 20+. After `npm install`, the postinstall step installs Electron native deps automatically.

### Scripts reference

- `npm run dev`: Start Vite dev server
- `npm run build`: Build production web assets
- `npm run preview`: Preview built web assets
- `npm run electron`: Launch Electron pointing at local files (expects running dev server or packaged files depending on context)
- `npm run electron-dev`: Start Vite, wait for `http://localhost:5173`, then launch Electron
- `npm run dist`: Build web assets and package app for current OS (no publish)
- `npm run dist-all`: Build for macOS, Windows, Linux (from a properly configured host/CI)
- `npm run pack`: Build web assets and create an unpacked app directory

## 🚀 Automated Releases

This project uses GitHub Actions for automated builds and releases. The system follows Google's engineering best practices with separation of concerns, automated testing, and multi-platform builds.

### 📦 Creating a Release

**Method 1: Using the Helper Script (Recommended)**

```bash
# Run the interactive release script
./scripts/release.sh
```

The script will:
1. Check your working directory is clean
2. Ask what type of version bump you want (patch/minor/major/custom)
3. Update `package.json` with the new version
4. Commit the change and create a git tag
5. Push to GitHub, triggering the automated build

**Method 2: Manual Tag Creation**

```bash
# Update version in package.json manually, then:
git add package.json
git commit -m "chore: bump version to X.Y.Z"
git tag "vX.Y.Z"
git push origin main
git push origin "vX.Y.Z"
```

**Method 3: GitHub UI (For Version Bumps Only)**

1. Go to Actions → "Update Version" workflow
2. Click "Run workflow"
3. Choose patch/minor/major or enter a custom version
4. The workflow will update the version and create the tag automatically

### 🔄 What Happens Automatically

When you push a version tag (e.g., `v0.0.7`), GitHub Actions will:

1. **Create a GitHub Release** with auto-generated release notes
2. **Build for all platforms** in parallel:
   - **Linux**: AppImage (x64)
   - **Windows**: NSIS installer + portable executable (x64, x86)
   - **macOS**: DMG + ZIP files (Intel x64 + Apple Silicon arm64)
3. **Upload all artifacts** to the GitHub release automatically
4. **Notify** when the release is ready

### 🧪 Continuous Integration

The project includes two additional workflows:

- **Build Test** (`build-test.yml`): Tests builds on every PR and main branch push
- **Multi-platform Test**: Full build verification on main branch (Ubuntu, Windows, macOS)

### 🔒 Security

- Workflows use minimal required permissions
- Builds are isolated and reproducible
- No secrets required for basic releases (uses `GITHUB_TOKEN`)

### 📋 Release Checklist

Before creating a release:

- [ ] All changes committed and pushed to main
- [ ] Working directory is clean (`git status`)
- [ ] Tests pass locally (`npm run build`)
- [ ] Version number follows semantic versioning
- [ ] Consider updating release notes after automated creation


