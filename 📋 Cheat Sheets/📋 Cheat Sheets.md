| Welcome to my evergreen list "📋 Cheat Sheets." <br> Feel free to download it in PDF, CSV, Microsoft Excel, or any other preferred format [here](https://docs.google.com/spreadsheets/d/1X9zuCMb30DiQba5VNjT-HDwwomA9u0Z-trmuqVmykYY)! |
| :---: |

> **Last Update:** 2024-10-01  
> Curated by [Hua-Ming Huang](https://github.com/huaminghuangtw) with ❤️  

# 📑 Table of Contents

- [◻️ Git](#️-git)
- [◻️ Raspberry Pi](#️-raspberry-pi)
- [◻️ SSH](#️-ssh)
- [◻️ Network Manager](#️-network-manager)

# ◻️ Git

| Memorize This | Note |
| --- | --- |
| `git stash list` | List all stashes |
| `git stash show` | Show the _files_ in the most recent stash |
| `git stash show -p` | Show the _changes_ of the most recent stash |
| `git stash drop` | Drop the most recent stash |
| `git stash clear` | Drop all stashed at once |

# ◻️ Raspberry Pi

| Memorize This | Note |
| --- | --- |
| `vcgencmd get_throttled | grep -q throttled=0x50005 && echo "Low voltage detected! Please use official power supply." || echo "Power requirement satisfied."` | Check voltage |
| `sudo timedatectl set-ntp true && date` | Sync system clock |
| `ifconfig wlan0 | grep 'inet ' | awk '{print $2}'` | Show IP address |

# ◻️ SSH

| Memorize This | Note |
| --- | --- |
| `ssh-keygen` | Generate SSH key |
| `ssh -T git@github.com` | Validate SSH |
| `cat ~/.ssh/id_rsa.pub` | Get SSH key |

# ◻️ Network Manager

| Memorize This | Note |
| --- | --- |
| `nmcli dev status` |  |
| `cat ~/.ssh/id_rsa.pub` |  |
| `nmcli con show` |  |
| `nmcli -t -f NAME connection show --active | tr '\n' ' ' | awk '{print $1}'` |  |
| `nmcli radio wifi on` |  |
| `nmcli dev wifi list` |  |
| `nmcli dev wifi connect SSID password PASSWORD` |  |
