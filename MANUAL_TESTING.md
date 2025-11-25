# Manual Testing - Quick Reference

**🎯 Goal:** Launch 3 browsers with auto-login for fast manual testing

---

## ⚡ Quick Start

```bash
# First time only: Install dependencies
npm install

# Make sure backend & frontend are running, then:
npm run test:manual

# OR use batch script (Windows):
test\manual-testing\setup-and-launch.bat
```

**Result:** 3 Chrome browsers open automatically:
1. **Game Master** - Dashboard
2. **Player 1** - Arcane Huckster (all offensive/utility powers)
3. **Player 2** - Divine Blessed (all healing/defensive powers)

---

## 🎮 Test Characters

| Character | Username | Powers | PP | Chips |
|-----------|----------|--------|----|----|
| **GM** | gamemaster | N/A | N/A | N/A |
| **Huckster** | testplayer1 | Bolt, Blast, Stun, Dispel, etc. | 20/20 | 5 |
| **Blessed** | testplayer2 | Healing, Armor, Bolt, Blast, etc. | 20/20 | 5 |

**Password for all:** `password`

---

## 📂 Files

```
test/manual-testing/
├── README.md                      # Full documentation
├── QUICK_START.md                # Quick reference
├── setup-test-characters.sql     # Database seed
├── launch-test-scenario.js       # Browser launcher
├── setup-and-launch.bat         # All-in-one script
└── launch.bat                    # Quick launch only
```

---

## 🔧 Troubleshooting

**Backend not running:**
```bash
cd backend && mvnw.cmd spring-boot:run
```

**Frontend not running:**
```bash
cd frontend && npm run dev
```

**Characters not found:**
```bash
psql -U deadlands -d deadlands -f test/manual-testing/setup-test-characters.sql
```

---

## 💡 Time Saved

- **Without automation:** ~2.5 minutes per test run
- **With automation:** ~20 seconds per test run
- **Savings:** 80% time reduction! 🚀

---

See [test/manual-testing/README.md](test/manual-testing/README.md) for complete documentation.
