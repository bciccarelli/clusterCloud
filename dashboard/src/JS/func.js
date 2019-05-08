const { dialog } = require('electron').remote
const electron = require('electron').remote
const fs = require('fs');
const net = require('net');
const path = require('path')
const crypto = require('crypto');
const algorithm = 'aes-128-cbc';
const serverURL = "http://11ebf3fb.ngrok.io"
var password = "This is my password"
var iv, salt
let w = electron.getCurrentWindow()
var connected = false
var socket = new net.Socket(writable=true)
var max = '□'
var min = '◱'
var a
socket.on('data', function(data) {
  response = JSON.parse(data)
  console.log(a=response)
  for (var i = 1; i > 0; i++) {
    if(!response.hasOwnProperty(i)){
      break
    } else if (!response[i]) {
      document.getElementById("node"+i).innerHTML = ""
    } else {
      document.getElementById("node"+i).innerHTML = 'Server Status: <div class="status" id="node'+i+'-status"> ●●●</div>Online'
    }
  }
  
  unload()
});
function connectTCP(host, port){
  socket.connect(port, host, function(){connected=true;update()})
}
function load(){
  document.getElementById("loading").style.visibility = "visible"
}
function unload(){
  document.getElementById("loading").style.visibility = "hidden"
}
function tcpSend(message, ret){
  socket.write(message)
}
function update() {
  if(connected) {
    load()
    encrypt("update")
  }
}
var out
async function sendFile(node) {
  fileNames = dialog.showOpenDialog({title:"file"})
  console.log(await fs.readFile(fileNames[0], function(err,ret) {
    if(err) {
      alert(err);
      return;
    }
    out = ret;
    f = "file" + node + fileNames[0]+","+String(out)
     encrypt(f)
  }))
}
function reconnect() {
  load()
  socket.destroy()
  connectTCP('localhost',8080)
}
function encrypt(message){
  crypto.randomBytes(8, (err, buf) => {
        if (err) throw err;
        salt = buf
        crypto.randomBytes(16, (err, buf) => {
          if (err) throw err;
          iv = buf
          key = crypto.pbkdf2Sync((password), (salt), 100, 16, 'sha256');
          en = crypto.createCipheriv(algorithm, key, iv);
          result = en.update(message, 'utf8', 'hex');
          result += en.final("hex")
          rv = (iv.toString('hex') + ":" + result + ":" + salt.toString('hex'))
          console.log(rv)
          tcpSend(rv)
        });
    });
}
function decrypt(message) {
  iv = new Uint8Array(Buffer.from(message.split(":")[0], "hex"));
  salt = new Uint8Array(Buffer.from(message.split(":")[2], 'hex'));
  key = crypto.pbkdf2Sync((password), (salt), 100, 16, 'sha256');
  console.log(key)
  d = crypto.createDecipheriv(algorithm, key, iv);
  encrypted = Buffer.from(message.split(":")[1], 'hex')
  let decrypted = d.update(encrypted);
  decrypted += d.final('utf8');
  return decrypted
}
var resize = document.getElementById("resize");
function resizeWindow() {
  current = resize.innerText;
  resize.innerText==max?w.maximize():w.unmaximize();
  resize.innerText=resize.innerText==max?min:max;
  scroll()
}
w.on('enter-full-screen', () => {
  resize.innerText=min
  scroll()
});
w.on('maximize', () => {
  resize.innerText=min
  scroll()
});
w.on('leave-full-screen', () => {
  resize.innerText=max
  scroll()
});
w.on('unmaximize', () => {
  resize.innerText=max
  scroll()
});
function startUp(){
  w.maximize();
}
//setInterval(update, 5000)