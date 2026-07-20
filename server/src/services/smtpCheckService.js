const net = require('net');
const tls = require('tls');
const { Buffer } = require('buffer');

const TIMEOUT = 5000;

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let data = '';
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP response timeout'));
    }, TIMEOUT);

    const onData = (chunk) => {
      data += chunk.toString();
      const lines = data.split('\r\n');
      for (const line of lines) {
        if (line.length >= 4 && /^[23]\d\d\s/.test(line)) {
          clearTimeout(timeout);
          socket.removeListener('data', onData);
          socket.removeListener('error', onError);
          resolve({ code: parseInt(line.substring(0, 3), 10), message: line });
          return;
        }
      }
    };

    const onError = (err) => {
      clearTimeout(timeout);
      socket.removeListener('data', onData);
      reject(err);
    };

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

function sendCommand(socket, command) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP command timeout'));
    }, TIMEOUT);

    socket.write(command + '\r\n', () => {
      readResponse(socket)
        .then((resp) => { clearTimeout(timeout); resolve(resp); })
        .catch((err) => { clearTimeout(timeout); reject(err); });
    });
  });
}

function checkSmtpServer(server) {
  return new Promise((resolve) => {
    const { host, port, encryption, username, password } = server;
    const portNum = parseInt(port, 10) || 25;
    const enc = (encryption || 'None').toLowerCase();

    const done = (status, message) => resolve({ status, message });

    const runTest = (socket) => {
      readResponse(socket)
        .then(async (banner) => {
          if (banner.code !== 220) {
            socket.destroy();
            return done('Error', `Unexpected banner: ${banner.message}`);
          }

          try {
            const ehlo = await sendCommand(socket, 'EHLO localhost');
            if (ehlo.code !== 250) {
              socket.destroy();
              return done('Error', `EHLO failed: ${ehlo.message}`);
            }

            if (enc === 'starttls') {
              const starttls = await sendCommand(socket, 'STARTTLS');
              if (starttls.code !== 220) {
                socket.destroy();
                return done('Error', `STARTTLS failed: ${starttls.message}`);
              }

              const tlsSocket = tls.connect({
                socket,
                rejectUnauthorized: false,
              }, () => {
                checkAuth(tlsSocket, username, password, done);
              });
              tlsSocket.on('error', (err) => {
                done('Error', `TLS error: ${err.message}`);
              });
            } else {
              checkAuth(socket, username, password, done);
            }
          } catch (err) {
            socket.destroy();
            done('Error', `SMTP error: ${err.message}`);
          }
        })
        .catch((err) => {
          socket.destroy();
          done('Error', `Connection error: ${err.message}`);
        });
    };

    const onError = (err) => {
      done('Error', `Connection failed: ${err.message}`);
    };

    if (enc === 'ssl' || enc === 'ssl/tls' || enc === 'tls') {
      const socket = tls.connect({
        host,
        port: portNum,
        rejectUnauthorized: false,
        timeout: TIMEOUT,
      }, () => {
        runTest(socket);
      });
      socket.on('error', onError);
    } else {
      const socket = net.connect({ host, port: portNum, timeout: TIMEOUT }, () => {
        runTest(socket);
      });
      socket.on('error', onError);
      socket.on('timeout', () => {
        socket.destroy();
        done('Error', 'Connection timed out');
      });
    }
  });
}

function checkAuth(socket, username, password, done) {
  if (!username || !password) {
    try { socket.write('QUIT\r\n'); } catch {}
    socket.destroy();
    return done('Activated', 'Connection successful');
  }

  const authBuf = Buffer.from(username).toString('base64');
  const passBuf = Buffer.from(password).toString('base64');

  sendCommand(socket, 'AUTH LOGIN')
    .then(async (authResp) => {
      if (authResp.code === 334) {
        const userResp = await sendCommand(socket, authBuf);
        if (userResp.code === 334) {
          const passResp = await sendCommand(socket, passBuf);
          if (passResp.code === 235) {
            try { socket.write('QUIT\r\n'); } catch {}
            socket.destroy();
            return done('Activated', 'Authentication successful');
          } else {
            try { socket.write('QUIT\r\n'); } catch {}
            socket.destroy();
            return done('Error', `Authentication failed: ${passResp.message}`);
          }
        }
      }
      try { socket.write('QUIT\r\n'); } catch {}
      socket.destroy();
      done('Error', `AUTH LOGIN failed: ${authResp.message}`);
    })
    .catch((err) => {
      socket.destroy();
      done('Error', `AUTH error: ${err.message}`);
    });
}

module.exports = { checkSmtpServer };
