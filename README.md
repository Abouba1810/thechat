# THE CH4T

[![Status](https://img.shields.io/badge/status-no%20cap-brightgreen)](https://github.com) [![Vibe](https://img.shields.io/badge/vibe-immaculate-ff69b4)](https://github.com) [![Security](https://img.shields.io/badge/security-encrypted%20af-red)](https://github.com)

## whats this sht about?

- host your own server (like a huhhh idk man)
- chat with your crew in REALTIME
- everything's encrypted (fbi cant touch this... side eye in a bad way)
- pur terminal aestetic (no cringe ui)

its basicaly if matrix and discord had a baby but cooler...

## feature that hits different

- **terminal ui**: pure black n green
- **real time chat**: message faster than your ex leaving you on read...
- **self hosted**: your server your rules periodt
- **cross platform (sideeye)**: works on windows, mac, linux (i dont discriminate)

### security goes brrrr
- **AES-256-GCM**: your messages locked tighter than zone 51 (side eye)
- **custom password key**: only your squad can decrypte
- **EndtoEnd**: even the server cant read your tea (side eye)

## quick starts (no cap)

### step 1 : Get The Goods
```bash
git clone https://github.com/illruinyourlife/thechat.git
cd hacker-terminal-chat
npm install
```

### step 2 : launch the electron app Terminal
```bash
npm start
```

### step 3 : start Your Server (optionnal)
open another terminal:
```bash
npm run server
```

### step 4 : connect
in the electron app terminal:
```bash
connect localhost:3883 your_username your_password
```

## making your Server Public

### option one : port forwarding (big brainn move... dont even try this bro)
1. open port 3883 on your router
2. give friends your public IP
3. they connect with: `connect YOURPUBLIC_IP:3883 username password`

### Option 2: tunnel service (eaz Mode)
```bash
# use localtunel
npx localtunnel --port 3883

# or use ngrok  
ngrok tcp 3883
```
**not a pro tip**: use the same password as your friends or youll see `[ENCRPTED MESSAGE BLABLA - WONG KEY]`

##  not a screenshot

```
▄▄▄█████▓ ██░ ██ ▓█████     ▄████▄   ██░ ██  ▄▄▄     ▄▄▄█████▓
▓  ██▒ ▓▒▓██░ ██▒▓█   ▀    ▒██▀ ▀█  ▓██░ ██▒▒████▄   ▓  ██▒ ▓▒
▒ ▓██░ ▒░▒██▀▀██░▒███      ▒▓█    ▄ ▒██▀▀██░▒██  ▀█▄ ▒ ▓██░ ▒░
░ ▓██▓ ░ ░▓█ ░██ ▒▓█  ▄    ▒▓▓▄ ▄██▒░▓█ ░██ ░██▄▄▄▄██░ ▓██▓ ░ 
  ▒██▒ ░ ░▓█▒░██▓░▒████▒   ▒ ▓███▀ ░░▓█▒░██▓ ▓█   ▓██▒ ▒██▒ ░ 
  ▒ ░░    ▒ ░░▒░▒░░ ▒░ ░   ░ ░▒ ▒  ░ ▒ ░░▒░▒ ▒▒   ▓▒█░ ▒ ░░   
    ░     ▒ ░▒░ ░ ░ ░  ░     ░  ▒    ▒ ░▒░ ░  ▒   ▒▒ ░   ░    
  ░       ░  ░░ ░   ░      ░         ░  ░░ ░  ░   ▒    ░      
          ░  ░  ░   ░  ░   ░ ░       ░  ░  ░      ░  ░        
                           ░                                  

[SYSTEM] THE CHAT v2.0 - ENCRYTED INFILTRATION
[SYSTEM] AES-256-GCM ENCRYPTION ENABLED
[illruinyou@defautip-home.local]$> yo anyone online?
[trinity] > always watching
[morpheus] > bruhhh...
```

## contributing (be the change)

found a bug? wants to add feature? 
1. fork this repo
2. make it better
3. submit PR
4. get eternal glory...

## disclaimer

this is for educational purpose (side eye) and having fun with friends (side eye). dont use it for anything sus (side eye)... were not responsible if you get in trouble with your schools IT department (no side eye)

## socials & support

- **issues**: open a gitHub issue (i actually read them (side eye))
- **feature requests**: same place different label
- **flexing**: Tag me when you show this off

## hall of fameee

shoutout to everyone who:
- star this repo
- report bugs  
- suggest features
- use this with their mate

### quick commands cheat sheet

| commands | what it does | examples |
|---------|-------------|---------|
| `connect` | join a server | `connect 192.168.1.100:3883 mounir thepass or nothing` |
| `/nick` | change username | `/nick anonym_user` |
| `/key` | change encryp key | `/key new_password` |
| `/clear` | clear screen | `/clear` |
| `/quit` | exit like a ghost... not really but hey | `/quit` |
| `help` | when youre lost | `help` |
| `server` | server hosting info | `server` |

### tips

1. **use a fukUng strong passwords** - "password1234u" aint it chief...
2. **share the same key** - or youll be talking to encrypted walls lmao
3. **port forward properly** - your router manual is your friend
4. **dont even check here** - i dont drop fixes reglarly (side eye)
5. **have fun** - its not that deep just vibe

---

*and remember... with great terminal power come great responsability*