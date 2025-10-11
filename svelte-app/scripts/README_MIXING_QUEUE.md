# Color Mixing Queue Processor

This directory contains the cron script for processing color mixing calculations in the background.

## Overview

The mixing queue processor (`process-mixing-queue.ts`) is a Node.js script that:
1. Polls the `artboard_palette_mixing_queue` table for pending work
2. Processes swatches in small batches (5 at a time)
3. Finds the closest pigment mix for each swatch using Euclidean distance
4. Caches results in the `swatch_color_models` table
5. Updates progress as it goes

## Performance

Based on the query structure, each swatch typically takes:
- **10-100ms** per swatch on average (depends on database size and server load)
- Processing 5 swatches per run: **50-500ms** per batch
- Recommended cron interval: **every 5 seconds**

For an artboard with 50 swatches:
- Total time: ~50-100 seconds
- User sees incremental progress updates

## Installation

### 1. Install Dependencies

Make sure you have the required packages:

```bash
cd svelte-app
npm install mysql2 tsx
```

### 2. Configure Database Password

The script reads from the `DB_PASSWORD` environment variable. Set it in your production environment:

```bash
export DB_PASSWORD="your_actual_password"
```

Or create a `.env` file in the `svelte-app` directory:

```
DB_PASSWORD=your_actual_password
```

### 3. Make the Shell Script Executable

```bash
chmod +x scripts/run-mixing-queue.sh
```

### 4. Test the Script

Run it manually to ensure it works:

```bash
./scripts/run-mixing-queue.sh
```

You should see output like:
```
[MixingQueue] Starting queue processor...
[MixingQueue] Processing queue entry #1 (artboard=5, palette=2)
[MixingQueue]   Swatch #123: mix_id=4567, distance=2.34, time=45ms
...
```

## Setting Up Cron (Production Server)

### Option 1: Every 5 Seconds (Recommended)

Edit your crontab:
```bash
crontab -e
```

Add these 12 entries to run the script every 5 seconds:
```cron
* * * * * cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 5 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 10 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 15 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 20 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 25 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 30 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 35 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 40 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 45 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 50 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 55 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
```

### Option 2: Every 10 Seconds (Lighter Load)

Use 6 cron entries with 10-second intervals:
```cron
* * * * * cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 10 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 20 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 30 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 40 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
* * * * * sleep 50 && cd /var/www/huemixy/svelte-app && ./scripts/run-mixing-queue.sh >> /var/log/mixing-queue.log 2>&1
```

## Monitoring

### Check Logs

```bash
tail -f /var/log/mixing-queue.log
```

### Check Queue Status

```bash
mysql -u story_user -p huemixy -e "SELECT * FROM artboard_palette_mixing_queue;"
```

### Monitor Performance

The logs show timing for each swatch. Look for patterns like:
- `time=45ms` - fast, good performance
- `time=500ms` - slow, may need database optimization

## Troubleshooting

### Script not running
1. Check cron is running: `systemctl status cron`
2. Check permissions: `ls -l scripts/run-mixing-queue.sh`
3. Check logs: `tail /var/log/mixing-queue.log`

### Slow performance
1. Add indexes to `pigment_mixes` table (should already exist)
2. Reduce `BATCH_SIZE` in the script
3. Increase cron interval to reduce load

### Database connection errors
1. Verify DB_PASSWORD is set correctly
2. Check database is running: `mysql -u story_user -p`
3. Verify port 3307 is correct

## Adjusting Performance

Edit `process-mixing-queue.ts` and change:

```typescript
const BATCH_SIZE = 5; // Process fewer/more swatches per run
```

Smaller batch size = more frequent progress updates, but more cron runs
Larger batch size = fewer runs, but longer gaps between updates
