---
title: 📱 Shortcuts Dev Tip
slug: shortcuts-dev-tip
description: Handy tips and techniques for developing Apple Shortcuts, gained through hands-on experience.
spreadsheetId: 1H0o1QxZfrUhuOyMZUY1Ey8D6jONob1es6K_qrLnUgG8
lastModified: 2025-04-04
---

## 💁‍♂️ Keyboard hotkeys (macOS)

* Cmd + ↑/↓ [^1]
* Cmd + D [^2]
* Cmd + N [^3]
* Cmd + R [^4]
* Cmd + Shift + A [^5]
* Cmd + Shift + C [^6]
* Cmd + Shift + I [^7]
* Cmd + Shift + R [^8]
* Cmd + Shift + S [^9]

## 💁‍♂️ Tricks to minimize # of actions used

* When using “Set Dictionary Value” to create a dictionary, you can leave the dictionary field blank on the right instead of adding a separate “Dictionary” action and referencing it.

## 💁‍♂️ Good practices

* Add a “Stop This Shortcut” action at the end of each shortcut to prevent unintended side effects, especially when dealing with conditional logic or automation.
	* **Why It’s a Good Practice:**
		* ✅ Prevents Unwanted Execution: Ensures that no additional actions run accidentally, especially if the shortcut is triggered by another shortcut or automation.
		* ✅ Improves Debugging: Clearly marks the endpoint, making it easier to understand where execution stops.
		* ✅ Avoids Redundant Processing: If a shortcut continues running unnecessarily, it can consume resources or cause unexpected behavior.
	* **When You Might Skip It:**
		* 🚫 If a “Stop and Output” Action Exists: This already terminates the shortcut and returns a value, so an additional stop action isn’t needed.
		* 🚫 For Simple Shortcuts: If your shortcut only has a few actions and no branching logic, it may not be necessary.
	* In general, if your shortcut has multiple conditions, loops, or external triggers, adding “Stop This Shortcut” at the end is a good habit.

[^1]: Move line up/down (re-ordering)
[^2]: Duplicate a Shortcut
[^3]: Create new Shortcut
[^4]: Run a Shortcut
[^5]: Add action: “Ask for Input”
[^6]: Add action: “Comment”
[^7]: Add action: “If-Otherwise-End If”
[^8]: Add action: “Repeat”
[^9]: Add action: “Show Result”
