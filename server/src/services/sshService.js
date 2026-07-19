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

const getServerInfo = async (host, sshPort, username, password) => {
  try {
    const [ram, storage, ipv4, ipv6] = await Promise.all([
      executeCommand(host, sshPort, username, password, "free -m | awk '/Mem:/ {print $2}'", 10000),
      executeCommand(host, sshPort, username, password, "df -BG / | awk 'NR==2 {print $2}'", 10000),
      executeCommand(host, sshPort, username, password, "hostname -I | wc -w", 10000),
      executeCommand(host, sshPort, username, password, "ip -6 addr scope global | grep -c inet6 || echo 0", 10000),
    ]);
    const ipsResult = await executeCommand(host, sshPort, username, password, "hostname -I", 10000);
    const allIps = ipsResult.stdout.split(' ').filter(Boolean);
    const ipv4List = allIps.filter(ip => !ip.includes(':'));
    const ipv6List = allIps.filter(ip => ip.includes(':'));
    return {
      ram: `${ram.stdout}MB`,
      storage: `${storage.stdout}GB`,
      ipv4Count: parseInt(ipv4.stdout, 10) || ipv4List.length,
      ipv6Count: parseInt(ipv6.stdout, 10) || ipv6List.length,
      ipsV4: ipv4List,
      ipsV6: ipv6List,
    };
  } catch {
    return { ram: 'Unknown', storage: 'Unknown', ipv4Count: 0, ipv6Count: 0, ipsV4: [], ipsV6: [] };
  }
};

const configureAdditionalIps = async (host, sshPort, username, password, os, lines) => {
  try {
    const commands = lines.split('\n').filter(Boolean).map(line => {
      if (os === 'ubuntu' || os === 'debian') {
        const ip = line.trim();
        return `ip addr add ${ip}/24 dev eth0 2>/dev/null || echo "IP ${ip} already configured"`;
      }
      const parts = line.trim().split('|');
      if (parts.length === 3) {
        const [ip, netmask, gateway] = parts;
        return `nmcli con mod etho ipv4.addresses "${ip}/${netmask}" && nmcli con up etho 2>/dev/null || echo "Configured ${ip}"`;
      }
      return `echo "Invalid line: ${line}"`;
    });
    const result = await executeCommand(host, sshPort, username, password, commands.join(' && '), 30000);
    return { status: 'ok', output: result.stdout };
  } catch (err) {
    return { status: 'error', output: err.message };
  }
};

const executeServersCommand = async (host, sshPort, username, password, action) => {
  const commands = {
    'get-info': 'hostname && uname -a && free -m && df -h /',
    'get-ips': 'hostname -I',
    'reboot-server': 'reboot',
    'refresh-ram': 'sync && echo 3 > /proc/sys/vm/drop_caches && free -m',
    'clean-logs': 'truncate -s 0 /var/log/syslog 2>/dev/null; truncate -s 0 /var/log/mail.log 2>/dev/null; echo "Logs cleared"',
    'stop-apache': 'systemctl stop apache2 2>/dev/null || systemctl stop httpd 2>/dev/null; echo "Apache stopped"',
    'start-apache': 'systemctl start apache2 2>/dev/null || systemctl start httpd 2>/dev/null; echo "Apache started"',
    'restart-apache': 'systemctl restart apache2 2>/dev/null || systemctl restart httpd 2>/dev/null; echo "Apache restarted"',
  };
  const cmd = commands[action] || `echo "Unknown action: ${action}"`;
  try {
    const result = await executeCommand(host, sshPort, username, password, cmd, 30000);
    return { output: result.stdout };
  } catch (err) {
    return { output: err.message };
  }
};

module.exports = { executeCommand, checkServer, getServerIps, getServerInfo, configureAdditionalIps, executeServersCommand };
