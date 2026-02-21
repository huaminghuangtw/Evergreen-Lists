---
title: 📋 Cheat Sheet
description: Handy reference to quickly access terminal commands that I frequently use.
spreadsheetId: 1X9zuCMb30DiQba5VNjT-HDwwomA9u0Z-trmuqVmykYY
created: 2024-11-18T17:53:47
modified: 2026-02-21T08:28:22
---

# ◻️ Git

* Drop all stashed at once

	```bash
	git stash clear

	```

* Show the _files_ in the most recent stash

	```bash
	git stash show

	```

* Drop the most recent stash

	```bash
	git stash drop

	```

* List all stashes

	```bash
	git stash list

	```

* Show the _changes_ of the most recent stash

	```bash
	git stash show -p

	```

# ◻️ Raspberry Pi

* Show IP address

	```bash
	ifconfig wlan0 | grep ‘inet ’ | awk ‘{print $2}’

	```

* Sync system clock

	```bash
	sudo timedatectl set-ntp true && date

	```

* Check voltage

	```bash
	vcgencmd get_throttled | grep -q throttled=0x50005 && echo “Low voltage detected! Please use official power supply.” || echo “Power requirement satisfied.”

	```

# ◻️ SSH

* Print the public SSH key, which can be used for authentication on remote servers

	```bash
	cat ~/.ssh/id_rsa.pub

	```

* Validate SSH

	```bash
	ssh -T git@github.com

	```

* Generate SSH key

	```bash
	ssh-keygen

	```

# ◻️ Network Manager

* Connect to a WiFi network

	```bash
	nmcli dev wifi connect SSID password PASSWORD
	```

* Display a list of all saved network connections on the system

	```bash
	nmcli con show
	```

* List all available Wi-Fi networks detected by the system

	```bash
	nmcli dev wifi list

	```

* Show the status of all network interfaces, including their connection states

	```bash
	nmcli dev status
	```
