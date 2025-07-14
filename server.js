const WebSocket = require('ws');
const crypto = require('crypto');

class EncryptedHackerChatServer {
    constructor(port = 3883) {
        this.port = port;
        this.clients = new Map();
        this.rooms = new Map();
        this.init();
    }
    
    init() {
        this.wss = new WebSocket.Server({ 
            port: this.port,
            host: '0.0.0.0'
        });
        
        console.log(`
▄▄▄█████▓ ██░ ██ ▓█████      ██████ ▓█████  ██▀███   ██▒   █▓▓█████  ██▀███  
▓  ██▒ ▓▒▓██░ ██▒▓█   ▀    ▒██    ▒ ▓█   ▀ ▓██ ▒ ██▒▓██░   █▒▓█   ▀ ▓██ ▒ ██▒
▒ ▓██░ ▒░▒██▀▀██░▒███      ░ ▓██▄   ▒███   ▓██ ░▄█ ▒ ▓██  █▒░▒███   ▓██ ░▄█ ▒
░ ▓██▓ ░ ░▓█ ░██ ▒▓█  ▄      ▒   ██▒▒▓█  ▄ ▒██▀▀█▄    ▒██ █░░▒▓█  ▄ ▒██▀▀█▄  
  ▒██▒ ░ ░▓█▒░██▓░▒████▒   ▒██████▒▒░▒████▒░██▓ ▒██▒   ▒▀█░  ░▒████▒░██▓ ▒██▒
  ▒ ░░    ▒ ░░▒░▒░░ ▒░ ░   ▒ ▒▓▒ ▒ ░░░ ▒░ ░░ ▒▓ ░▒▓░   ░ ▐░  ░░ ▒░ ░░ ▒▓ ░▒▓░
    ░     ▒ ░▒░ ░ ░ ░  ░   ░ ░▒  ░ ░ ░ ░  ░  ░▒ ░ ▒░   ░ ░░   ░ ░  ░  ░▒ ░ ▒░
  ░       ░  ░░ ░   ░      ░  ░  ░     ░     ░░   ░      ░░     ░     ░░   ░ 
          ░  ░  ░   ░  ░         ░     ░  ░   ░           ░     ░  ░   ░     
                                                         ░                   

        `);
        
        console.log(`[SERVER] EHC Server running on port ${this.port}`);
        console.log(`[SERVER] AES-256-GCM ETE Encryption`);
        console.log(`[SERVER] listening on all interface (0.0.0.0:${this.port})`);
        console.log(`[SERVER] local connection: ws://localhost:${this.port}`);
        console.log(`[SERVER] network connection: ws://yourip:${this.port}`);
        console.log(`[SERVER] Ready connections...`);
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            const clientInfo = {
                id: clientId,
                socket: ws,
                username: null,
                room: 'main',
                ip: req.socket.remoteAddress,
                lastActivity: Date.now()
            };
            
            this.clients.set(clientId, clientInfo);
            console.log(`[CONNECTION] new crypted client: ${clientId} from ${clientInfo.ip}`);
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(clientId, message);
                    
                    const client = this.clients.get(clientId);
                    if (client) {
                        client.lastActivity = Date.now();
                    }
                } catch (error) {
                    console.log(`[ERROR] invalid json from ${clientId}: ${data}`);
                }
            });
            
            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });
            
            ws.on('error', (error) => {
                console.log(`[ERROR] client ${clientId} error:`, error.message);
                this.handleDisconnect(clientId);
            });
            
            // ping/pong for the connxion
            ws.on('pong', () => {
                const client = this.clients.get(clientId);
                if (client) {
                    client.lastActivity = Date.now();
                }
            });
        });
        
        setInterval(() => {
            this.cleanupInactiveClients();
        }, 30000); 
        
        setInterval(() => {
            this.pingClients();
        }, 25000);
    }
    
    handleMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;
        
        switch (message.type) {
            case 'join':
                this.handleJoin(clientId, message);
                break;
            case 'message':
                this.handleChatMessage(clientId, message);
                break;
            case 'nick':
                this.handleNickChange(clientId, message);
                break;
            case 'leave':
                this.handleLeave(clientId, message);
                break;
            default:
                console.log(`[WARNING] unknown type: ${message.type}`);
        }
    }
    
    handleJoin(clientId, message) {
        const client = this.clients.get(clientId);
        client.username = message.username;
        
        console.log(`[JOIN] ${message.username} (${clientId}) joined encrypted chat`);
        
        // Broadcast for encrypted mssg
        this.broadcastInstant(message, clientId);
        
        this.sendToClient(clientId, {
            type: 'system',
            message: ` welcome to the The chat, ${message.username}!`
        });
        
        const userCount = Array.from(this.clients.values()).filter(c => c.username).length;
        this.sendToClient(clientId, {
            type: 'system',
            message: `users : ${userCount}`
        });
    }
    
    handleChatMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client.username) return;
        
        console.log(`[MESSAGE] ${client.username}: [ENCRYPTED]`);
        
        // broadcast for mssg
        this.broadcastInstant(message, clientId);
    }
    
    handleNickChange(clientId, message) {
        const client = this.clients.get(clientId);
        const oldUsername = client.username;
        client.username = message.username;
        
        console.log(`[NICK] ${oldUsername} is now know as ${message.username}`);
        
        // broadcast for nickname changing
        this.broadcastInstant(message);
    }
    
    handleLeave(clientId, message) {
        console.log(`[LEAVE] ${message.username} left the chat`);
        
        // broadcast for leaving mssg
        this.broadcastInstant(message, clientId);
        
        this.handleDisconnect(clientId);
    }
    
    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            if (client.username) {
                console.log(`[DISCONNECT] ${client.username} (${clientId}) disconnected`);
                
                // broadcast for disconnexion
                this.broadcastInstant({
                    type: 'leave',
                    username: client.username,
                    message: `${client.username} has disconnected`
                }, clientId);
            } else {
                console.log(`[DISCONNECT] Anonymous client ${clientId} disconnected`);
            }
            
            this.clients.delete(clientId);
        }
    }
    
   
    broadcastInstant(message, excludeClientId = null) {
        const activeClients = Array.from(this.clients.entries()).filter(([id, client]) => {
            return id !== excludeClientId && 
                   client.socket.readyState === WebSocket.OPEN;
        });
        
        // instant sending to all clients
        const promises = activeClients.map(([id, client]) => {
            return new Promise((resolve) => {
                try {
                    client.socket.send(JSON.stringify(message), resolve);
                } catch (error) {
                    console.log(`[ERROR] failed to send to ${id}:`, error.message);
                    resolve();
                }
            });
        });
        
        Promise.all(promises).then(() => {
            console.log(`[BROADCAST] message sent to ${activeClients.length} clients`);
        });
    }
    
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.socket.readyState === WebSocket.OPEN) {
            try {
                client.socket.send(JSON.stringify(message));
            } catch (error) {
                console.log(`[ERROR] failed to send to ${clientId}:`, error.message);
            }
        }
    }
    
    // ping for keeping active connexions
    pingClients() {
        this.clients.forEach((client, clientId) => {
            if (client.socket.readyState === WebSocket.OPEN) {
                try {
                    client.socket.ping();
                } catch (error) {
                    console.log(`[PING ERROR] ${clientId}:`, error.message);
                    this.handleDisconnect(clientId);
                }
            }
        });
    }
    
    // removing inactive clients
    cleanupInactiveClients() {
        const now = Date.now();
        const timeout = 60000;
        
        this.clients.forEach((client, clientId) => {
            if (now - client.lastActivity > timeout) {
                console.log(`[CLEANUP] Removing inactive client: ${clientId}`);
                this.handleDisconnect(clientId);
            }
        });
    }
    
    generateClientId() {
        return crypto.randomBytes(8).toString('hex');
    }
}

const server = new EncryptedHackerChatServer(3883);

process.on('SIGINT', () => {
    console.log('\n[SERVER] Shutting down server gracefully...');
    server.wss.close(() => {
        console.log('[SERVER] server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n[SERVER] received SIGTERM, shutting down...');
    server.wss.close(() => {
        console.log('[SERVER] server closed');
        process.exit(0);
    });
});