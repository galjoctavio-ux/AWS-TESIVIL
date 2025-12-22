/**
 * Manual sync script for testing leaderboard data import
 * Run with: npx ts-node src/scripts/sync-now.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { syncBenchmarks } from '../jobs/sync-benchmarks';
import { syncModels } from '../jobs/sync-models';

async function main() {
    console.log('🚀 Starting manual sync...\n');

    try {
        // First sync models from OpenRouter
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('STEP 1: Syncing models from OpenRouter...');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const modelsCount = await syncModels();
        console.log(`\n✅ Models synced: ${modelsCount}\n`);

        // Then sync benchmarks from leaderboards
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('STEP 2: Syncing benchmarks from leaderboards...');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const benchmarksCount = await syncBenchmarks();
        console.log(`\n✅ Benchmarks synced: ${benchmarksCount}\n`);

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎉 SYNC COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
