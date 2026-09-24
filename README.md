# Trade Companion

Build a complete mobile-first offline trading utility app called Traders Fundamentals Tools.

The app is a simple practical toolbox for traders to plan trades, calculate position/risk parameters, journal trades, and review basic trading statistics.

IMPORTANT: Keep the implementation SIMPLE and EFFECTIVE. Do NOT over-engineer.

CORE TECHNICAL REQUIREMENTS

Build with React + TypeScript + Vite.

Mobile-first responsive UI.

Designed primarily for Android/Capacitor but also works in a browser.

Offline-first.

Use browser localStorage only for persistence.

NO backend.

NO Supabase.

NO authentication.

NO user accounts.

NO cloud database.

NO API calls.

NO AI.

NO live market data.

NO broker integration.

NO TradingView.

NO external financial data.

Do not add unnecessary libraries or complex architecture.

Keep calculations deterministic and local.

Use reusable components only where they actually reduce duplication.

Keep the codebase clean and straightforward.

The app must work completely without an internet connection after installation.

APP PURPOSE

The app helps traders:

Plan LONG and SHORT trades.

Calculate position size.

Calculate risk.

Calculate Risk/Reward.

Calculate potential P/L.

Calculate Stop Loss and Take Profit.

Calculate breakeven.

Calculate average entry.

Calculate partial exits.

Record and review trades.

Track simple trading statistics.

Use a trade checklist.

Save simple strategy templates.

Backup and restore local data.

This is a trading utility and journal, NOT a trading signal or financial advice app.

DESIGN

Create a professional, clean, modern trading-tool aesthetic.

Avoid excessive crypto-style neon colors or complicated charts.

Use:

Deep navy / charcoal

White / light gray

Blue as the primary accent

Green for profit

Red for loss

Amber for warnings

Suggested colors:

Primary: #2563EB
Dark: #0F172A
Light background: #F8FAFC
Profit: #16A34A
Loss: #DC2626
Warning: #F59E0B

Use rounded cards, clear spacing, readable typography, large touch-friendly controls, and compact information cards.

Support:

Light mode

Dark mode

System mode

Use icons where useful, but do not overdecorate.

MAIN NAVIGATION

Use a simple bottom navigation with 5 tabs:

Home

Plan

Journal

Tools

More

Keep navigation consistent across the application.

1. HOME / DASHBOARD

Create a useful dashboard.

Show:

App title: Traders Fundamentals Tools

Current selected trading account

Account balance

Today's P/L

Total trades

Win rate

Recent trades

Add prominent quick-action buttons:

New Trade

Position Size

Risk Calculator

Risk/Reward

Recent trade cards should show:

Instrument

LONG / SHORT

Entry

Exit

P/L

R Multiple

Date

If there are no trades, show a simple empty state with a button to create the first trade.

Do not create fake market data.

2. PLAN / TRADE PLANNER

This is one of the main features.

Create a Trade Planner with:

Direction

Two selectable buttons:

LONG
SHORT

Inputs

Instrument

Account

Account Balance

Entry Price

Stop Loss

Take Profit

Risk %

Position Size

Contract Multiplier

Default risk percentage should be 1%.

Calculate automatically:

Risk Amount

Stop Loss Distance

Take Profit Distance

Potential Loss

Potential Profit

Risk/Reward Ratio

Position Value

R Multiple

For LONG:

SL should normally be below Entry and TP above Entry.

For SHORT:

SL should normally be above Entry and TP below Entry.

Show clear validation messages when prices are invalid.

Example:

LONG:

Entry = 100
SL = 95
TP = 115
Risk = 1%

Display:

Risk Amount: $100
Potential Loss: $100
Potential Profit: $300
Risk/Reward: 1:3

The calculator must update immediately when inputs change.

Add:

Save Trade

This saves the planned trade to the journal.

3. JOURNAL

Create a local trade journal.

Users can:

Add trade

Edit trade

Delete trade

Close trade

View trade details

Trade fields:

Instrument

Account

Direction: LONG / SHORT

Entry Price

Stop Loss

Take Profit

Position Size

Contract Multiplier

Entry Date

Exit Price

Exit Date

Fees

Strategy

Setup

Emotion

Notes

Tags

Status: Open / Closed

When a trade is closed, calculate:

Gross P/L

Fees

Net P/L

Return %

R Multiple

Win / Loss / Breakeven

P/L formulas:

LONG:

(Exit Price - Entry Price) × Position Size × Contract Multiplier

SHORT:

(Entry Price - Exit Price) × Position Size × Contract Multiplier

Net P/L:

Gross P/L - Fees

R Multiple:

Net P/L / Maximum Risk

Display positive P/L in green and negative P/L in red.

4. JOURNAL LIST

Create a clean trade history.

Each trade card:

Instrument
LONG / SHORT
Entry → Exit
P/L
R Multiple
Date
Status

Add simple filters:

All

Open

Closed

Winners

Losers

LONG

SHORT

Allow search by instrument.

Do not build a complicated data table.

5. TRADING STATISTICS

Inside the Journal section, add a Statistics view.

Calculate locally from closed trades:

Total Trades

Winning Trades

Losing Trades

Breakeven Trades

Win Rate

Total Net P/L

Average Win

Average Loss

Largest Win

Largest Loss

Average R

Profit Factor

Winning Streak

Losing Streak

Do not use external analytics.

If there are no closed trades, show an empty state.

6. TOOLS

Create a Tools screen containing simple calculator cards.

Tools:

Position Size Calculator

Inputs:

Account Balance

Risk %

Entry Price

Stop Loss

Contract Multiplier

Calculate:

Risk Amount
Stop Distance
Position Size

Use:

Risk Amount = Account Balance × Risk %

Position Size = Risk Amount / (Price Distance × Contract Multiplier)

Risk Calculator

Inputs:

Account Balance

Risk %

Position Size

Entry

Stop Loss

Contract Multiplier

Calculate:

Risk Amount

Maximum Loss

Risk %

Risk/Reward Calculator

Inputs:

Direction

Entry

Stop Loss

Take Profit

Calculate:

Risk Distance

Reward Distance

R:R

For LONG:

Risk = Entry - SL
Reward = TP - Entry

For SHORT:

Risk = SL - Entry
Reward = Entry - TP

P/L Calculator

Inputs:

Direction

Entry

Exit

Position Size

Contract Multiplier

Fees

Calculate:

Gross P/L

Fees

Net P/L

Return %

Stop Loss Calculator

Inputs:

Direction

Entry

Stop Distance %

Calculate Stop Loss.

LONG:

SL = Entry × (1 - percentage)

SHORT:

SL = Entry × (1 + percentage)

Take Profit Calculator

Inputs:

Direction

Entry

Stop Loss

Desired R:R

Calculate TP.

LONG:

TP = Entry + (Risk Distance × Reward Ratio)

SHORT:

TP = Entry - (Risk Distance × Reward Ratio)

Breakeven Calculator

Inputs:

Direction

Entry

Position Size

Fees

Calculate approximate breakeven price including fees.

Keep the calculation simple and transparent.

Average Entry Calculator

Allow users to add multiple entries:

Price
Quantity

Calculate weighted average entry price.

Formula:

Sum(Price × Quantity) / Sum(Quantity)

Allow adding/removing entry rows.

Partial Exit Calculator

Inputs:

Position Size

Multiple exit prices

Percentage sold at each exit

Calculate:

Quantity sold

Remaining quantity

Weighted average exit price

Estimated total P/L

Keep the interface simple.

Percentage Change Calculator

Inputs:

Starting Price

Ending Price

Calculate percentage change.

R-Multiple Calculator

Inputs:

Entry

Exit

Direction

Maximum Risk

Calculate actual P/L and R Multiple.

7. TRADE CHECKLIST

Add a simple checklist accessible from Plan or Tools.

Default checklist:

Direction confirmed

Entry defined

Stop Loss defined

Take Profit defined

Risk calculated

Position size calculated

Risk/Reward checked

Setup identified

Trade thesis written

Risk acceptable

Users can check/uncheck items.

Allow adding custom checklist items.

Persist checklist locally.

8. STRATEGY TEMPLATES

Under More, create Strategy Templates.

Users can:

Create

Edit

Delete

Use template

Fields:

Strategy Name

Entry Rules

Stop Loss Rules

Take Profit Rules

Risk %

Default R:R

Notes

Example:

Breakout
Entry: Breakout above resistance
Stop: Below breakout level
Target: 2R
Risk: 1%

Templates are only documentation tools. Do not generate trading signals.

9. ACCOUNTS

Under More, create simple local trading accounts.

Users can create:

Account Name

Currency

Starting Balance

Current Balance

Default Risk %

Examples:

Crypto
USD
$5,000

Forex
USD
$10,000

Stocks
IDR
Rp50,000,000

Allow:

Add account

Edit account

Delete account

Set default account

No live balance synchronization. Account balance should be manually editable.

Supported common currencies:

USD
EUR
GBP
IDR
JPY
AUD
CAD
SGD

Also allow a custom currency code.

10. DATA BACKUP

Under More > Data:

Export Backup

Export all local app data as JSON.

Filename:

traders-fundamentals-backup.json

Import Backup

Allow users to select a JSON backup and restore it.

Validate the JSON before replacing existing data.

Ask for confirmation before replacing data.

Export CSV

Export closed/open trades to CSV.

Filename:

trades.csv

This is important because the application uses localStorage.

11. SETTINGS

Create a simple settings screen.

Settings:

Theme: Light / Dark / System

Default account

Default currency

Default risk %

Default R:R

Decimal precision

Clear all data

Before clearing all data, require confirmation.

Persist settings in localStorage.

12. LOCAL STORAGE

Use a very simple localStorage data structure.

Store:

settings

accounts

trades

strategies

checklist

Use JSON serialization.

Create a small storage utility to safely:

get data

save data

update data

remove data

Do not create a complicated state-management system.

React state + localStorage is sufficient.

13. CALCULATION RULES

Create simple reusable calculation functions for:

position size

risk amount

P/L

R:R

R multiple

average entry

stop loss

take profit

percentage change

partial exits

Handle:

zero values

empty inputs

invalid numbers

negative prices

invalid LONG/SHORT relationships

division by zero

Never display NaN or Infinity to the user.

Format numbers cleanly according to the selected decimal precision.

14. VALIDATION

Examples:

LONG:

Entry must be greater than SL.
TP should normally be greater than Entry.

SHORT:

Entry must be lower than SL.
TP should normally be lower than Entry.

However, do not prevent users from saving incomplete journal entries if they are simply recording historical trades.

Calculator screens should show validation messages rather than crashing.

15. RESPONSIVE MOBILE UI

Prioritize mobile screens.

Use:

Bottom navigation

Large buttons

Numeric input fields for prices and quantities

Compact cards

Sticky action button where appropriate

Easy scrolling

No unnecessarily wide tables

The app should look like a polished Android utility application.

Desktop browser support can simply expand the mobile layout into a centered responsive container.

16. EMPTY STATES

Create useful empty states.

Examples:

"No trades yet"

"Create your first trade to start building your journal."

"No strategy templates yet"

"Create a strategy template to document your trading process."

"No statistics available"

"Close some trades to see your performance statistics."

Do not use fake data.

17. DISCLAIMER

Add a small disclaimer under Settings/About:

"This app is a trading calculation and journaling tool. It does not provide financial advice, trading signals, predictions, or guarantees of profit. Users are responsible for their own trading decisions."

Keep it unobtrusive.

18. IMPORTANT UX PRINCIPLE

The app should feel like:

Plan → Calculate → Execute externally → Journal → Review

The app does NOT execute trades.

Do not add buy/sell buttons that imply broker execution.

19. CODE QUALITY

Keep implementation practical.

Do not create:

unnecessary services

repositories

dependency injection

complex state machines

backend abstractions

API layers

excessive custom hooks

unnecessary context providers

complicated folder structures

Prefer a small number of clear components and utility functions.

Use TypeScript types/interfaces for:

Account

Trade

Strategy

ChecklistItem

Settings

Make calculations reusable but simple.

20. FINAL REQUIREMENT

Build the actual working application, not a mockup.

All buttons must work.

All calculators must calculate real results.

All forms must save data.

Journal data must persist after refresh/restart.

Settings must persist.

Dark/light mode must work.

Export/import must work.

CSV export must work.

No placeholder buttons.

No fake market data.

No login screen.

No onboarding carousel.

No unnecessary splash/loading screen.

Keep the final application compact, fast, offline-first, and easy to use.

The final product should feel like a polished trader's pocket toolbox, not a full trading platform.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://trade-pocket-tools.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/11d776d2-daa9-4d77-a187-4b3edb56ec1f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
