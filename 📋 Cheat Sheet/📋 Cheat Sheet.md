| Welcome to my evergreen list “📋 Cheat Sheet.” <br> Feel free to download it in PDF, CSV, Microsoft Excel, or any other preferred format [here](https://docs.google.com/spreadsheets/d/1X9zuCMb30DiQba5VNjT-HDwwomA9u0Z-trmuqVmykYY)! |
| :---: |

> [!NOTE]  
> _Last Update: 2025-02-25_  
>
> _Curated by [Hua-Ming Huang](https://github.com/huaminghuangtw) with ❤️_  

---

# 📑 Table of Contents

* [◻️ Git](#️-git)
* [◻️ Raspberry Pi](#️-raspberry-pi)
* [◻️ SSH](#️-ssh)
* [◻️ Network Manager](#️-network-manager)

---

# ◻️ Git

| Memorize This | Note |
| --- | --- |
| <code>git stash clear</code> | Drop all stashed at once |
| <code>git stash show</code> | Show the _files_ in the most recent stash |
| <code>git stash drop</code> | Drop the most recent stash |
| <code>git stash list</code> | List all stashes |
| <code>git stash show -p</code> | Show the _changes_ of the most recent stash |

# ◻️ Raspberry Pi

| Memorize This | Note |
| --- | --- |
| <code>ifconfig wlan0 \| grep 'inet ' \| awk '{print $2}'</code> | Show IP address |
| <code>sudo timedatectl set-ntp true && date</code> | Sync system clock |
| <code>vcgencmd get_throttled \| grep -q throttled=0x50005 && echo “Low voltage detected! Please use official power supply.” \|\| echo “Power requirement satisfied.”</code> | Check voltage |

# ◻️ Ssh

| Memorize This | Note |
| --- | --- |
| <code>cat ~/.ssh/id_rsa.pub</code> | Get SSH key |
| <code>ssh -T git@github.com</code> | Validate SSH |
| <code>ssh-keygen</code> | Generate SSH key |

# ◻️ Network Manager

| Memorize This | Note |
| --- | --- |
| <code>nmcli dev wifi connect SSID password PASSWORD</code> |  |
| <code>nmcli con show</code> |  |
| <code>cat ~/.ssh/id_rsa.pub</code> |  |
| <code>nmcli dev wifi list</code> |  |
| <code>nmcli dev status</code> |  |
