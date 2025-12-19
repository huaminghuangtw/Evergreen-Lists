---
title: 📱 Shortcuts Dev Tip
description: Handy tips and techniques for developing Apple Shortcuts, gained through hands-on experience.
spreadsheetId: 1H0o1QxZfrUhuOyMZUY1Ey8D6jONob1es6K_qrLnUgG8
created: 2025-03-22T23:34:26
modified: 2025-12-19T16:42:43
---

# 💁‍♂️ Keyboard hotkeys (macOS)

* Cmd + ↑/↓ [^1]
* Cmd + D [^2]
* Cmd + Backspace [^3]
* Cmd + N [^4]
* Cmd + R [^5]
* Cmd + Shift + A [^6]
* Cmd + Shift + C [^7]
* Cmd + Shift + I [^8]
* Cmd + Shift + R [^9]
* Cmd + Shift + S [^10]

# 💁‍♂️ Tips & tricks to minimize # of actions used

* When using “Set Dictionary Value” to create a dictionary, you can leave the dictionary field blank on the right instead of adding a separate “Dictionary” action and referencing it.
* When handling nested dictionaries and arrays, use **Dot Notation** (e.g., `myDict.key1.key2` or `myArray.0.key`) to access values directly in one step—instead of chaining multiple “Get Value from Dictionary” actions. This approach makes complex data structures much easier to manage, especially when dealing with data from APIs or JSON.
* When formatting dates, wrap **literal characters**—such as punctuation, `'T'`, `'Z'`, or any static text—in **single quotes** to treat them as fixed text. This allows you to build custom date-time formats like `yyyy-MM-dd'T'HH:mm:ss'Z'` in a single step without chaining multiple **Format Date** actions. For example, use `yyyy'_Week_'ww` to combine the year and week number in a single action, rather than using 2 separate **Format Date** actions for `yyyy` and `ww`.

# 💁‍♂️ Things I wished I’d known earlier

* Using the ‘Match Text’ action with the regular anchor ^keyword provides more reliable results compared to using the built-in ‘Begins With’ condition.
* On macOS, you can instantly replace selected text in place—no need to copy and paste manually. Just select the text and trigger your shortcut with a keyboard shortcut. This is especially helpful for repetitive formatting tasks like slugifying or hyperlinking text.

# 💁‍♂️ Good practices

* Add a “Stop This Shortcut” action at the end of each shortcut to prevent unintended side effects, especially when dealing with conditional logic or automation.
	* **Why It’s a Good Practice:**
		* Prevents Unwanted Execution: Ensures that no additional actions run accidentally, especially if the shortcut is triggered by another shortcut or automation.
		* Improves Debugging: Clearly marks the endpoint, making it easier to understand where execution stops.
		* Avoids Redundant Processing: If a shortcut continues running unnecessarily, it can consume resources or cause unexpected behavior.
	* **When You Might Skip It:**
		* If a “Stop and Output” Action Exists: This already terminates the shortcut and returns a value, so an additional stop action isn’t needed.
		* For Simple Shortcuts: If your shortcut only has a few actions and no branching logic, it may not be necessary.
	* In general, if your shortcut has multiple conditions, loops, or external triggers, adding “Stop This Shortcut” at the end is a good habit.

# 💁‍♂️ Testing

* Use Siri to run a shortcut by simply saying its name. For example, say, ‘Hey Siri, Turn off Color Filters.’

# 💁‍♂️ Applications

* [You can rename Shortcuts dynamically to display quick information—like battery level, date, or weather—directly in the shortcut’s name. By using the “Rename Shortcut” action, you can update its title based on live data, making your Home Screen or widget area more informative at a glance. It’s a clever way to turn shortcuts into mini status indicators without needing to open an app.](https://www.reddit.com/r/shortcuts/comments/1k7jg8n/renaming_shortcuts_for_quick_info/?share_id=CCpdoTwK3HFT7Zj2Wuq_2)

[^1]: Move action up/down
[^2]: Duplicate a shortcut
[^3]: Delete a shortcut
[^4]: Create new shortcut
[^5]: Run a Shortcut
[^6]: Add action: “Ask for Input”
[^7]: Add action: “Comment”
[^8]: Add action: “If-Otherwise-End If”
[^9]: Add action: “Repeat”
[^10]: Add action: “Show Result”
