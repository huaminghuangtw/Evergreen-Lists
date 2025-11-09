---
title: 👨‍💻 Tech Pro Tip
slug: tech-pro-tip
description: Expert tips to streamline workflows and troubleshoot issues in tech.
spreadsheetId: 1o3HcHxZKbOK178Zswo7Xp4MNM7AgrA6_xaZMEhrdFYM
created: 2024-11-18T17:58:47
modified: 2025-11-08T16:53:50
---

# 💡 Miscellaneous

* How to read through any article on the web with a paywall?
	* Method I: The easiest way to bypass paywalls is to just disable JavaScript for the site.
		* Steps
			1. Disable JavaScript (Or even better: Have a dedicated browser with JavaScript always disabled)
			2. Reload the page
			3. Read the article
			4. Re-enable JavaScript
	* Method II: Toggle Reader View
	* Method III: Use tools like <https://12ft.io> or <https://removepaywalls.com>
* Use the `Shift` key to type capital letters instead of relying on `Caps Lock`. It’s more efficient and helps prevent accidental ALL CAPS typing.
* If you’re curious about how a font looks in action, just Google its name — for popular fonts like _Comic Sans_, _Roboto_, or _Courier_, Google will sometimes render the search results page in that font. It’s a clever [Easter egg](https://en.wikipedia.org/wiki/List_of_Google_Easter_eggs) that lets you preview the font in real-time. Great for designers or anyone picking fonts quickly. Note: it works best in Chrome and may not appear if you’re using certain browser extensions.
* You can create a link that highlights specific text fragment on a page by adding `#:~:text=your%20text%20here` to the end of the URL — it’ll auto-scroll and highlight the exact phrase in Chrome or Edge. For example, linking to “climate change” on Wikipedia looks like this: <https://en.wikipedia.org/wiki/Climate_change>#:~:text=climate%20change.
* [If you’re on a computer, right-click on the YouTube video at the exact time you want to share, then select “Copy video URL at current time” to get a link that starts at the specific timestamp.](https://www.reddit.com/r/YouShouldKnow/comments/vkj797/comment/idphs20)
* Apple Maps nearly for navigation. Google Maps for business overview.
* In most web browsers, holding **Alt** (Windows/Linux) or **Option** (Mac) while clicking a link triggers a quick **download** of the linked file or page instead of opening it. This browser shortcut is the same as right-click \\> “Save Link As”, making it useful for instantly saving PDFs, images, or other resources without right-clicking.

# 💡 macOS

* How to add Trash to the Finder window sidebar? Open the Trash \> Go to the File menu \> Click “Add to Sidebar”
* Use the keyboard shortcut `Shift` + `Cmd` + `/` to show the menu bar _search_, which reveals the menu bar with the added benefit of putting the cursor in the search field, so that you can quickly type the command you want and hit `Enter`
* [Batch rename multiple files](https://stackoverflow.com/a/53321208)
* Select multiple contiguous files at once in Finder
	* Method 1: `Cmd`+`2` (List View) → Shift click for your selection → `Cmd`+`1` (Icon View)
	* Method 2: Drag a rectangle around files
* Right-click a folder in Finder on macOS, you will get an “Import from iPhone/iPad” option. Click that and your iPhone/iPad will open a scanner app which lets you “Take Photo”, “Scan Documents”, and “Add Sketch.”
* Move (i.e., cut \& paste) files\&folders in Finder
	* Method 1: First `Cmd` + `C`, then `Opt` + `Cmd` + `V` → will paste the file and remove it from original location
	* Method 2: Install Sindre Sorhus’s [Command X](https://sindresorhus.com/command-x) app for more intuitive keyboard shortcuts
* How to do forward-delete on a MacBook? Hold down the `Fn` button and then press `Backspace`
* How to View a GIF with animated frames on macOS?
	1. Open Finder and locate the GIF file.
	2. Select the GIF (without opening it) and press `Spacebar` to preview it.
	3. Alternatively, press `Cmd` + `Y` to open Quick Look.
	4. You can only preview one GIF at a time, but you can use `Tab` to cycle through files.
	5. Press `ESC` to close the preview.
* [You can access the audio files of system sounds like ringtones, alerts, and notifications via `/System/Library/PrivateFrameworks/ToneLibrary.framework/Versions/A/Resources/Ringtones/` \& `/System/Library/Sounds/`. Files here are typically in `.m4r`, `.caf`, or `.aiff` format. This directory is read-only under normal user conditions, and modifying it requires elevated permissions.](https://apple.stackexchange.com/questions/467536/on-mac-where-to-find-the-audio-files-of-the-sounds-in-the-native-clock-app)
* Enable “Speak selection” in System Settings \> Accessibility \> Spoken Content to have any selected text read aloud. The default keyboard shortcut is `Option` + `Esc`. Great for proofreading, learning, or resting your eyes. [^1]
* Use Clamshell Mode on a MacBook by connecting an external (1) monitor, (2) keyboard, and (3) mouse (via Bluetooth or USB), then plugging in the (4) power adapter. Once connected, close the MacBook lid—the external display should become the main screen. Wake the system using the external keyboard or mouse. Adjust **screen mirroring** or **extended display** settings under **System Settings \> Displays**. Great for saving desk space and focusing on a larger monitor.
* To dictate text on macOS using an external microphone, plug it in and select the mic under **System Settings \> Sound \> Input**. Then enable **Dictation** under **Keyboard** settings and assign a shortcut key like `Fn` or `Control`. Double-press the shortcut (no need to hold it), wait for the **mic icon**, and start speaking. If the external mic stops working, open **Terminal** and run [`killall corespeechd`](https://www.reddit.com/r/MacOS/comments/1b84wrz/macos_dication_doesnt_work_with_external/) to reset the speech recognition service.

# 💡 iOS

* [Instead of using the traditional copy-and-paste approach to move text/images/files/urls/etc. between apps, use the hidden drag-and-drop feature.](https://www.youtube.com/watch?v=DhwRv1YLhRg)
* [Move multiple Home Screen apps at once](https://ios.gadgethacks.com/how-to/move-multiple-home-screen-apps-once-0177985): Tap and hold on one app, then tap more apps to add them to your stack
* Good phone charging habits to maximize battery lifespan
	1. **Keep battery between 20–80%**
		 Charge once daily (~1 hr) when below 20%, instead of multiple short charges.
	2. **Avoid overnight charging**
		 Unless _Optimized Battery Charging_ is enabled (default on most modern phones).
	3. **Use certified chargers**
		 Stick to original or **MFi-certified** accessories to protect your device.
* 在 iPhone 輸入中文時，可以先輸入每個字的首個注音符號，待所有字母輸入完畢後，再依照建議詞彙或上下文選字。這種方式有助於提高輸入速度，特別是在熟悉鍵盤佈局後，可減少中斷思考的時間。
* Saying “Remind me” to Siri can create a reminder in the default list.

# 💡 Apple Ecosystem

* [Use Universal Clipboard to copy and paste between your Apple devices](https://support.apple.com/en-us/102430)
* How to create clickable links to Apple Notes (`applenotes:note/…`)? In Apple Notes, select (or double-tap) a word or symbol, press `Cmd + K` (or tap **Add Link**), and type part of the target note title. Then right-click (on macOS) or tap and hold (on iOS) the link, and choose **Copy Link** (macOS) or **Copy** (iOS). Paste the resulting `applenotes:` link into any rich text app — it’ll work just like a regular hyperlink, e.g., `applenotes:note/xxxx-xxxx-xxxx`.

# 💡Developer Productivity

* When browsing a GitHub repository, simply press the `.` key or replace **`.com` with `.dev`** in the URL to launch the repository in the *_[VS Code for the Web](https://code.visualstudio.com/docs/setup/vscode-web)_ —a full-featured, browser-based code editor. Example: \<https://github.com/user/repo>\> → \<https://github.dev/user/repo>\>. This is perfect for quick edits, reviews, or exploring code without cloning locally.
* You can **quickly launch tools and code sandboxes** using special `.new` URLs, a domain originally created by Google to streamline content creation. Typing `react.new` or `vue.new` in your browser instantly opens a ready-to-code sandbox for **React** or **Vue.js**, without needing a local setup. URLs like `docs.new`, `sheets.new`, and `slides.new` create new Google Docs, Sheets, or Slides with one click. Other services, like YouTube or Spotify, use URLs such as `playlist.new` for fast playlist creation.

[^1]: Alternatively, if you’re using Microsoft Edge, you can press `F9` to open **Immersive Reader** for a cleaner reading view (press `F9` again to exit it), then press `Cmd` + `Shift` + `U` to activate **Read Aloud**. It works well on most webpages and supports multiple voices and adjustable reading speeds.
