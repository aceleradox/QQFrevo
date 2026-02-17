const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let serverProcess

function startServer() {
  serverProcess = spawn(process.execPath, ['qqfrevo.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true
  })

  // espera o servidor subir
  setTimeout(() => {
    win.loadURL('http://localhost:3000')
  }, 2000)
}

app.whenReady().then(() => {
  startServer()
  createWindow()
})

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill()
})
