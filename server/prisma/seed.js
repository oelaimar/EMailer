const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const allPermissions = {
  dashboard: { read: true, write: true, delete: true },
  production: { read: true, write: true, delete: true },
  'smtp-servers': { read: true, write: true, delete: true },
  'mta-servers': { read: true, write: true, delete: true },
  'smtp-groups': { read: true, write: true, delete: true },
  domains: { read: true, write: true, delete: true },
  'data-lists': { read: true, write: true, delete: true },
  'data-providers': { read: true, write: true, delete: true },
  offers: { read: true, write: true, delete: true },
  'affiliate-networks': { read: true, write: true, delete: true },
  'virtual-lists': { read: true, write: true, delete: true },
  mailboxes: { read: true, write: true, delete: true },
  headers: { read: true, write: true, delete: true },
  'auto-responders': { read: true, write: true, delete: true },
  users: { read: true, write: true, delete: true },
  roles: { read: true, write: true, delete: true },
  teams: { read: true, write: true, delete: true },
  sessions: { read: true, write: true, delete: true },
  settings: { read: true, write: true, delete: true },
  'tools-spf': { read: true, write: true, delete: true },
  'tools-blacklist': { read: true, write: true, delete: true },
  'tools-extractor': { read: true, write: true, delete: true },
  'tools-values': { read: true, write: true, delete: true },
  'outlook-accounts': { read: true, write: true, delete: true },
  'outlook-send': { read: true, write: true, delete: true },
  'outlook-drops': { read: true, write: true, delete: true },
  'outlook-tests': { read: true, write: true, delete: true },
  'gsuite-accounts': { read: true, write: true, delete: true },
  'gsuite-send': { read: true, write: true, delete: true },
  'gsuite-drops': { read: true, write: true, delete: true },
  'gsuite-tests': { read: true, write: true, delete: true },
  'gmail-accounts': { read: true, write: true, delete: true },
  'gmail-send': { read: true, write: true, delete: true },
  'gmail-drops': { read: true, write: true, delete: true },
  'gmail-tests': { read: true, write: true, delete: true },
  'smtp-groups-list': { read: true, write: true, delete: true },
  'smtp-custom-vmtas': { read: true, write: true, delete: true },
  'smtp-send': { read: true, write: true, delete: true },
  'aws-accounts': { read: true, write: true, delete: true },
  'aws-instances': { read: true, write: true, delete: true },
  'do-accounts': { read: true, write: true, delete: true },
  'do-droplets': { read: true, write: true, delete: true },
  'linode-accounts': { read: true, write: true, delete: true },
  'linode-instances': { read: true, write: true, delete: true },
  'hetzner-accounts': { read: true, write: true, delete: true },
  'hetzner-instances': { read: true, write: true, delete: true },
  'atlantic-accounts': { read: true, write: true, delete: true },
  'atlantic-instances': { read: true, write: true, delete: true },
  'scaleway-accounts': { read: true, write: true, delete: true },
  'scaleway-instances': { read: true, write: true, delete: true },
  'ovh-accounts': { read: true, write: true, delete: true },
  'ovh-instances': { read: true, write: true, delete: true },
  'vultr-accounts': { read: true, write: true, delete: true },
  'vultr-instances': { read: true, write: true, delete: true },
  'azure-accounts': { read: true, write: true, delete: true },
  'azure-instances': { read: true, write: true, delete: true },
  'idcloud-accounts': { read: true, write: true, delete: true },
  'idcloud-instances': { read: true, write: true, delete: true },
  'servers-providers-add': { read: true, write: true, delete: true },
  'servers-providers-list': { read: true, write: true, delete: true },
  'mgmt-servers-add': { read: true, write: true, delete: true },
  'mgmt-servers-list': { read: true, write: true, delete: true },
  'cloudflare-add': { read: true, write: true, delete: true },
  'cloudflare-list': { read: true, write: true, delete: true },
  'mta-add': { read: true, write: true, delete: true },
  'mta-multi-add': { read: true, write: true, delete: true },
  'mta-list': { read: true, write: true, delete: true },
  'mta-vmtas': { read: true, write: true, delete: true },
  'mta-ips': { read: true, write: true, delete: true },
  'mta-install': { read: true, write: true, delete: true },
  'mta-bulk': { read: true, write: true, delete: true },
  'mta-actions': { read: true, write: true, delete: true },
  'mta-proxies': { read: true, write: true, delete: true },
  'smtp-add': { read: true, write: true, delete: true },
  'smtp-list': { read: true, write: true, delete: true },
  'smtp-bulk-check': { read: true, write: true, delete: true },
  'domains-brands': { read: true, write: true, delete: true },
  'domains-subdomains': { read: true, write: true, delete: true },
  'domains-records': { read: true, write: true, delete: true },
  'domains-multi': { read: true, write: true, delete: true },
  'namecheap-add': { read: true, write: true, delete: true },
  'namecheap-list': { read: true, write: true, delete: true },
  'godaddy-add': { read: true, write: true, delete: true },
  'godaddy-list': { read: true, write: true, delete: true },
  'dynadot-add': { read: true, write: true, delete: true },
  'dynadot-list': { read: true, write: true, delete: true },
  'spaceship-add': { read: true, write: true, delete: true },
  'spaceship-list': { read: true, write: true, delete: true },
  'namecom-add': { read: true, write: true, delete: true },
  'namecom-list': { read: true, write: true, delete: true },
  'postmaster-dashboard': { read: true, write: true, delete: true },
  'postmaster-runs': { read: true, write: true, delete: true },
  'geo-dashboard': { read: true, write: true, delete: true },
  'geo-processes': { read: true, write: true, delete: true },
};

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('password', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@app.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: '1',
      email: 'admin@app.com',
      password: adminPassword,
      productionId: 1,
      superUserStatus: 'Activated',
      status: 'Activated',
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      status: 'Activated',
      type: 'Team Based Role',
      permissions: allPermissions,
    },
  });

  console.log(`Created admin role: ${adminRole.name}`);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('Assigned Admin role to admin user');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
