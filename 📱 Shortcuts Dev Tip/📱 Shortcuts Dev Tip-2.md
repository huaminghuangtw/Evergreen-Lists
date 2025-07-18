---
title: 📱 Shortcuts Dev Tip
slug: shortcuts-dev-tip
description: Handy tips and techniques for developing Apple Shortcuts, gained through hands-on experience.
spreadsheetId: 1H0o1QxZfrUhuOyMZUY1Ey8D6jONob1es6K_qrLnUgG8
created: 2025-07-15T10:53:47
modified: 2025-07-15T18:32:19
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

## 💁‍♂️ Tips & tricks to minimize # of actions used

* When using “Set Dictionary Value” to create a dictionary, you can leave the dictionary field blank on the right instead of adding a separate “Dictionary” action and referencing it.
* When formatting dates, wrap **literal characters**—such as punctuation, `'T'`, `'Z'`, or any static text—in **single quotes** to treat them as fixed text. This allows you to build custom date-time formats like `yyyy-MM-dd'T'HH:mm:ss'Z'` in a single step without chaining multiple **Format Date** actions. For example, use `yyyy'_Week_'ww` to combine the year and week number in a single action, rather than using 2 separate **Format Date** actions for `yyyy` and `ww`.

## 💁‍♂️ Things I wished I'd known earlier

* Using the 'Match Text' action with the regular anchor ^keyword provides more reliable results compared to using the built-in 'Begins With ' condition.

## 💁‍♂️ Good practices

* Add a “Stop This Shortcut” action at the end of each shortcut to prevent unintended side effects, especially when dealing with conditional logic or automation.
	* **Why It's a Good Practice:**
		* ✅ Prevents Unwanted Execution: Ensures that no additional actions run accidentally, especially if the shortcut is triggered by another shortcut or automation.
		* ✅ Improves Debugging: Clearly marks the endpoint, making it easier to understand where execution stops.
		* ✅ Avoids Redundant Processing: If a shortcut continues running unnecessarily, it can consume resources or cause unexpected behavior.
	* **When You Might Skip It:**
		* 🚫 If a “Stop and Output” Action Exists: This already terminates the shortcut and returns a value, so an additional stop action isn't needed.
		* 🚫 For Simple Shortcuts: If your shortcut only has a few actions and no branching logic, it may not be necessary.
	* In general, if your shortcut has multiple conditions, loops, or external triggers, adding “Stop This Shortcut” at the end is a good habit.

## 💁‍♂️ Testing

* Use Siri to run a shortcut by simply saying its name. For example, say, 'Hey Siri, Turn off Color Filters.'

## 💁‍♂️ Applications

* [You can rename Shortcuts dynamically to display quick information—like battery level, date, or weather—directly in the shortcut’s name. By using the “Rename Shortcut” action, you can update its title based on live data, making your Home Screen or widget area more informative at a glance. It’s a clever way to turn shortcuts into mini status indicators without needing to open an app.](https://www.reddit.com/r/shortcuts/comments/1k7jg8n/renaming_shortcuts_for_quick_info/?share_id=CCpdoTwK3HFT7Zj2Wuq_2)

[^1]: Move line up/down (re-ordering)
[^2]: Duplicate a Shortcut
[^3]: Create new Shortcut
[^4]: Run a Shortcut
[^5]: Add action: “Ask for Input”
[^6]: Add action: “Comment”
[^7]: Add action: “If-Otherwise-End If”
[^8]: Add action: “Repeat”
[^9]: Add action: “Show Result”
