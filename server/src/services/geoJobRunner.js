const prisma = require('../config/database');
const geoDbService = require('./geoDbService');

const runningJobs = new Map();

async function startJob(processId) {
  if (runningJobs.has(processId)) {
    return { started: false, message: 'Job already running.' };
  }

  const process = await prisma.geoManagerProcess.findUnique({ where: { id: processId } });
  if (!process) return { started: false, message: 'Process not found.' };
  if (process.status === 'Running') return { started: false, message: 'Already running.' };

  const stopFlag = { stopped: false };
  runningJobs.set(processId, { stopFlag, progress: { moved: 0, deleted: 0, skipped: 0 } });

  await prisma.geoManagerProcess.update({
    where: { id: processId },
    data: { status: 'Running', startedAt: new Date(), movedRows: 0, deletedRows: 0, skippedRows: 0 },
  });
  await prisma.geoManagerLog.create({
    data: { processId, action: 'Started', details: 'Background job started.' },
  });

  runAsync(processId, process, stopFlag).catch((err) => {
    console.error(`Geo job ${processId} failed:`, err.message);
    cleanupJob(processId, 'Failed', err.message);
  });

  return { started: true, message: 'Job started.' };
}

async function runAsync(processId, process, stopFlag) {
  const sourceSchema = process.sourceSchema;
  const sourceTables = Array.isArray(process.sourceTables) ? process.sourceTables : [];
  const targetGeos = Array.isArray(process.targetGeos) ? process.targetGeos : [];
  const batchSize = process.batchSize || 500;
  const duplicateMode = process.deleteMode || 'delete';

  if (!sourceSchema || sourceTables.length === 0 || targetGeos.length === 0) {
    await cleanupJob(processId, 'Failed', 'Missing source schema, tables, or target geos.');
    return;
  }

  let totalMoved = 0;
  let totalDeleted = 0;
  let totalSkipped = 0;

  for (const table of sourceTables) {
    if (stopFlag.stopped) break;

    const stats = await geoDbService.moveRows(
      sourceSchema, table, targetGeos, batchSize, duplicateMode, stopFlag
    );

    totalMoved += stats.moved;
    totalDeleted += stats.deleted;
    totalSkipped += stats.skipped;

    await prisma.geoManagerProcess.update({
      where: { id: processId },
      data: { movedRows: totalMoved, deletedRows: totalDeleted, skippedRows: totalSkipped },
    });

    await prisma.geoManagerLog.create({
      data: {
        processId,
        action: 'Progress',
        details: `Table ${table}: moved=${stats.moved}, deleted=${stats.deleted}, skipped=${stats.skipped}`,
      },
    });
  }

  const finalStatus = stopFlag.stopped ? 'Stopped' : 'Completed';
  await cleanupJob(processId, finalStatus, null, totalMoved, totalDeleted, totalSkipped);
}

async function cleanupJob(processId, status, errorLog, moved, deleted, skipped) {
  runningJobs.delete(processId);

  const updateData = { status, finishedAt: new Date() };
  if (moved !== undefined) updateData.movedRows = moved;
  if (deleted !== undefined) updateData.deletedRows = deleted;
  if (skipped !== undefined) updateData.skippedRows = skipped;

  try {
    await prisma.geoManagerProcess.update({ where: { id: processId }, data: updateData });
  } catch {}

  await prisma.geoManagerLog.create({
    data: {
      processId,
      action: status,
      details: errorLog || `Process ${status.toLowerCase()}.`,
    },
  }).catch(() => {});
}

function stopJob(processId) {
  const job = runningJobs.get(processId);
  if (!job) return { stopped: false, message: 'Job not running.' };
  job.stopFlag.stopped = true;
  return { stopped: true, message: 'Stop signal sent.' };
}

function getJobStatus(processId) {
  const job = runningJobs.get(processId);
  if (!job) return { running: false };
  return { running: true, progress: job.progress };
}

function isRunning(processId) {
  return runningJobs.has(processId);
}

module.exports = { startJob, stopJob, getJobStatus, isRunning };
