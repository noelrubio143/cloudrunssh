/*
* Proxy Bridge - Version Cloud Run
* Based on PANCHO7532 - P7COMUnications LLC (c) 2021
*/
const crypto = require("crypto");
const net = require('net');

// Configuration - variables d'environnement
var dhost = process.env.DHOST || "cdn.worldsolution.site";
var dport = process.env.DPORT || 22;
var mainPort = process.env.PORT || 8080;
var packetsToSkip = parseInt(process.env.PACKSKIP) || 0;
var gcwarn = true;

console.log("[INFO] Configuration:");
console.log("[INFO]   DHOST = " + dhost);
console.log("[INFO]   DPORT = " + dport);
console.log("[INFO]   PORT = " + mainPort);
console.log("[INFO]   PACKSKIP = " + packetsToSkip);

function gcollector() {
    if(!global.gc && gcwarn) {
        console.log("[WARNING] Garbage Collector isn't enabled! Memory leaks may occur.");
        gcwarn = false;
        return;
    } else if(global.gc) {
        global.gc();
        return;
    }
}
setInterval(gcollector, 1000);

const server = net.createServer();

server.on('connection', function(socket) {
    var packetCount = 0;
    var remoteAddr = socket.remoteAddress || "unknown";
    var remotePort = socket.remotePort || "unknown";
    
    console.log("[INFO] Connection from " + remoteAddr + ":" + remotePort);
    
    // Envoi de la réponse WebSocket
    socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
                 "Connection: Upgrade\r\n" +
                 "Date: " + new Date().toUTCString() + "\r\n" +
                 "Sec-WebSocket-Accept: " + Buffer.from(crypto.randomBytes(20)).toString("base64") + "\r\n" +
                 "Upgrade: websocket\r\n" +
                 "Server: cloudrun-proxy/1.0\r\n\r\n");
    
    var conn = net.createConnection({host: dhost, port: dport});
    
    conn.on('error', function(err) {
        console.log("[REMOTE] Error: " + err.message);
        socket.destroy();
    });
    
    socket.on('error', function(err) {
        console.log("[SOCKET] Error: " + err.message);
        conn.destroy();
    });
    
    socket.on('data', function(data) {
        if(packetCount >= packetsToSkip) {
            if(conn.writable) {
                conn.write(data);
            }
        }
        packetCount++;
    });
    
    conn.on('data', function(data) {
        if(socket.writable) {
            socket.write(data);
        }
    });
    
    socket.on('close', function() {
        console.log("[INFO] Connection closed");
        conn.destroy();
    });
    
    conn.on('close', function() {
        socket.destroy();
    });
});

server.listen(mainPort, "0.0.0.0", function() {
    console.log("[INFO] Server started on port: " + mainPort);
    console.log("[INFO] Redirecting to: " + dhost + ":" + dport);
    console.log("[INFO] Ready to accept connections");
});
