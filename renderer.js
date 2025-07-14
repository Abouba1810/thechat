const WebSocket = require('ws');
const crypto = require('crypto');

class HackerTerminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.prompt = document.getElementById('prompt');
        
        this.socket = null;
        this.username = null;
        this.connected = false;
        this.currentServer = null;
        
        // crypting
        this.encryptionKey = null;
        this.algorithm = 'aes-256-gcm';
        
        this.init();
    }
    
    init() {
        this.showWelcome();
        this.setupEventListeners();
    }
    
    showWelcome() {
        const welcome = `
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


[SYSTEM] THE CHAT v2.0 - ENCRYPTED INFITRATION
[SYSTEM] AES-256-GCM ENCRYPTION
[SYSTEM] Type 'help' for available commands
[SYSTEM] Use 'connect <host:port> <username>' to join server
`;
        this.addOutput(welcome, 'system');
    }
    
    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                if (command) {
                    this.processCommand(command);
                    this.input.value = '';
                }
            }
        });
        
        document.addEventListener('click', () => {
            this.input.focus();
        });
    }
    
    generateEncryptionKey(password = 'default_hacker_key') {
        return crypto.scryptSync(password, 'salt', 32);
    }
    
    encryptMessage(text) {
        if (!this.encryptionKey) return text;
        
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            this.addOutput('[ERROR] Encryption failed', 'error');
            return text;
        }
    }
    
    // encrypt messages
    decryptMessage(encryptedData) {
        if (!this.encryptionKey || typeof encryptedData === 'string') return encryptedData;
        
        try {
            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            return '[ENCRPTED MESSAGE - WRONG KEY]';
        }
    }
    
    processCommand(command) {
        this.addOutput(`$> ${command}`, 'user');
        
        if (command.startsWith('connect ')) {
            this.handleConnect(command);
        } else if (command.startsWith('/nick ')) {
            this.handleNick(command);
        } else if (command.startsWith('/key ')) {
            this.handleSetKey(command);
        } else if (command === '/clear') {
            this.clearScreen();
        } else if (command === '/quit') {
            this.handleQuit();
        } else if (command === 'help') {
            this.showHelp();
        } else if (command === 'server') {
            this.startServer();
        } else if (this.connected) {
            this.sendMessage(command);
        } else {
            this.addOutput('[ERROR] not connected to a server. use "connect <host:port> <username>"', 'error');
        }
    }
    
    handleConnect(command) {
        const parts = command.split(' ');
        if (parts.length < 3) {
            this.addOutput('[ERROR] using connect <host:port> <username>', 'error');
            return;
        }
        
        const hostPort = parts[1];
        const username = parts[2];
        const password = parts[3] || 'default_hacker_key';
        
        this.encryptionKey = this.generateEncryptionKey(password);
        this.addOutput(`[CRYPTO] Encryption key generated from password`, 'system');
        
        if (this.socket) {
            this.socket.close();
        }
        
        this.addOutput(`[SYSTEM] connecting to ${hostPort} as ${username}...`, 'system');
        
        try {
            this.socket = new WebSocket(`ws://${hostPort}`);
            this.username = username;
            this.currentServer = hostPort;
            
            this.socket.onopen = () => {
                this.connected = true;
                this.addOutput(`[CONNECTED] Encrypted connection to ${hostPort}`, 'connected');
                this.addOutput(`[SYSTEM] youre now known as ${username}`, 'system');
                this.prompt.textContent = `[${username}@${hostPort}]$>`;
                
                const joinMessage = this.encryptMessage(`${username} has joined the.chat`);
                this.socket.send(JSON.stringify({
                    type: 'join',
                    username: username,
                    message: joinMessage
                }));
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    this.addOutput(event.data, 'message');
                }
            };
            
            this.socket.onclose = () => {
                this.connected = false;
                this.addOutput(`[DISCONNECTED] Connection to ${this.currentServer} lost`, 'disconnected');
                this.prompt.textContent = '$>';
            };
            
            this.socket.onerror = (error) => {
                this.addOutput(`[ERROR] Connection failed: ${error.message || 'Unknown error'}`, 'error');
                this.connected = false;
                this.prompt.textContent = '$>';
            };
            
        } catch (error) {
            this.addOutput(`[ERROR] Invalid host:port format`, 'error');
        }
    }
    
    handleMessage(data) {
        let displayMessage = data.message;
        
        // uncrypt mssg if object cyrpt
        if (typeof data.message === 'object' && data.message.encrypted) {
            displayMessage = this.decryptMessage(data.message);
        }
        
        switch (data.type) {
            case 'message':
                this.addOutput(`[${data.username}] ${displayMessage}`, 'message');
                break;
            case 'join':
                this.addOutput(`[SYSTEM] ${displayMessage}`, 'system');
                break;
            case 'leave':
                this.addOutput(`[SYSTEM] ${displayMessage}`, 'system');
                break;
            case 'nick':
                this.addOutput(`[SYSTEM] ${displayMessage}`, 'system');
                break;
            default:
                this.addOutput(`[${data.username || 'UNKNOWN'}] ${displayMessage}`, 'message');
        }
    }
    
    handleNick(command) {
        const newNick = command.split(' ')[1];
        if (!newNick) {
            this.addOutput('[ERROR] using /nick <new_username>', 'error');
            return;
        }
        
        if (!this.connected) {
            this.addOutput('[ERROR] not connected to a server', 'error');
            return;
        }
        
        const oldNick = this.username;
        this.username = newNick;
        this.prompt.textContent = `[${newNick}@${this.currentServer}]$>`;
        
        const nickMessage = this.encryptMessage(`${oldNick} is now known as ${newNick}`);
        this.socket.send(JSON.stringify({
            type: 'nick',
            oldUsername: oldNick,
            username: newNick,
            message: nickMessage
        }));
    }
    
handleSetKey(command) {
      const newPassword = command.split(' ')[1];
    if (!newPassword) {
                    this.addOutput('[ERROR] using /key <new_password>', 'error');
            return;
        }
        
    this.encryptionKey = this.generateEncryptionKey(newPassword);
    this.addOutput('[CRYPTO] new encryption key set', 'system');
   }
    
    sendMessage(message) {
        if (this.socket && this.connected) {
            const encryptedMessage = this.encryptMessage(message);
            this.socket.send(JSON.stringify({
                type: 'message',
                username: this.username,
                message: encryptedMessage
            }));
        }
    }
    
                handleQuit() {
                    if (this.connected && this.socket) {
                        const leaveMessage = this.encryptMessage(`${this.username} has left the chat`);
                        this.socket.send(JSON.stringify({
                            type: 'leave',
                            username: this.username,
                            message: leaveMessage
                        }));
                        this.socket.close();
                    }
                    this.addOutput('[SYSTEM] session terminated... Goodbye, homie', 'system');
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }
    
    clearScreen() {
        this.output.innerHTML = '';
    }
    
    showHelp() {
        const help = `
[HELP] The terminal commands :
  connect <host:port> <username> [password - optional]  - Connect with encryption
  /nick <new_username>                       - change your username
  /key <new_password>                        - change encryption key
  /clear                                     - clear the screen
  /quit                                      - exit the terminal
  server                                     - start a local server on port 3883
  help                                       - show help message

[INFO]
  all messages are encrypted with AES-256-GCM
  default password: 'default_hacker_key'
  use same password to decrypt messages

[EXAMPLE]
  connect 192.168.1.100:3883 /or link us3r
  connect localhost:3883 notU53r thekey
  /key new_secret_password
  /nick notanonymous
`;
        this.addOutput(help, 'system');
    }
    
    startServer() {
        this.addOutput('[SYSTEM] starting encrypted server on port 3883...', 'system');
        this.addOutput('[SYSTEM] to start the server, run in a separate terminal:', 'system');
        this.addOutput('[SYSTEM] npm run server', 'system');
        this.addOutput('[SYSTEM] then connect with: connect ipadress:3883 <username>', 'system');
        this.addOutput('[CRYPTO] all messages will be encrypted end to end', 'system');
    }
    
    addOutput(text, className = '') {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.textContent = text;
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }
}

// init
document.addEventListener('DOMContentLoaded', () => {
    new HackerTerminal();
});