const { Client } = require('ssh2');

const executeCommand = (host, port, username, password, command, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      conn.end();
      reject(new Error('SSH connection timed out'));
    }, timeout);

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timer);
          conn.end();
          return reject(err);
        }
        stream.on('close', (code) => {
          clearTimeout(timer);
          conn.end();
          if (code !== 0 && stderr) {
            return reject(new Error(stderr || `Command exited with code ${code}`));
          }
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
        }).on('data', (data) => {
          stdout += data.toString();
        }).stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    }).on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    }).connect({
      host,
      port: parseInt(port, 10) || 22,
      username,
      password,
      readyTimeout: 10000,
      algorithms: {
        kex: [
          'ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
          'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
          'diffie-hellman-group14-sha1',
        ],
      },
    });
  });
};

const checkServer = async (host, sshPort, username, password) => {
  try {
    const result = await executeCommand(host, sshPort, username, password, 'echo OK && hostname && cat /etc/os-release | head -2', 10000);
    return { status: 'ok', sshStatus: 'Connected', hostname: result.stdout.split('\n')[1] || '' };
  } catch (err) {
    return { status: 'error', sshStatus: 'Failed', error: err.message };
  }
};

const getServerIps = async (host, sshPort, username, password) => {
  try {
    const result = await executeCommand(host, sshPort, username, password, "hostname -I | awk '{print $1}'", 10000);
    return result.stdout.split(' ').filter(Boolean);
  } catch {
    return [];
  }
};

module.exports = { executeCommand, checkServer, getServerIps };
