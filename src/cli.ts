#!/usr/bin/env bun
import { writeFileSync } from 'node:fs';
import { DownloadTabService } from '$lib/server/services/download-tab.service';
import { isUrlFromSongsterr } from '$lib/utils/input-validation';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';

interface CliOptions {
  url: string;
  type: SupportedTabDownloadType;
  output?: string;
  separateTracks: boolean;
}

function printUsageAndExit(message?: string): never {
  if (message) console.error(`Error: ${message}\n`);
  console.error(
    `Usage: bun run cli <songsterr-url> [options]\n\n` +
      `Options:\n` +
      `  -t, --type <gp|midi>   Output format (default: gp)\n` +
      `  -o, --output <path>    Output file path (default: derived from song title)\n` +
      `  --separate-tracks      Export MIDI with one track per instrument (midi only)\n` +
      `  -h, --help              Show this help message\n\n` +
      `Example:\n` +
      `  bun run cli https://www.songsterr.com/a/wsa/some-song-tab-s123456 -t gp -o song.gp\n`
  );
  process.exit(message ? 1 : 0);
}

function parseArgs(argv: string[]): CliOptions {
  let url: string | undefined;
  let type: SupportedTabDownloadType = 'byRevisionJson';
  let output: string | undefined;
  let separateTracks = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '-h':
      case '--help':
        printUsageAndExit();
        break;
      case '-t':
      case '--type': {
        const value = argv[++i];
        if (value === 'gp' || value === 'gp7') {
          type = 'byRevisionJson';
        } else if (value === 'midi' || value === 'mid') {
          type = 'byRevisionJsonMidi';
        } else {
          printUsageAndExit(
            `Unknown type "${value}". Expected "gp" or "midi".`
          );
        }
        break;
      }
      case '-o':
      case '--output':
        output = argv[++i];
        break;
      case '--separate-tracks':
        separateTracks = true;
        break;
      default:
        if (arg.startsWith('-')) {
          printUsageAndExit(`Unknown option "${arg}".`);
        }
        if (url) {
          printUsageAndExit(`Unexpected extra argument "${arg}".`);
        }
        url = arg;
    }
  }

  if (!url) printUsageAndExit('Missing Songsterr URL.');
  if (!isUrlFromSongsterr(url)) {
    printUsageAndExit(
      `"${url}" doesn't look like a Songsterr tab URL (expected https://www.songsterr.com/a/wsa/...).`
    );
  }

  return { url, type, output, separateTracks };
}

async function main() {
  const { url, type, output, separateTracks } = parseArgs(
    process.argv.slice(2)
  );

  console.log(`Fetching ${url} ...`);

  const service = new DownloadTabService(type);
  const request = new Request('http://localhost/cli', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ byLinkUrl: url, separateTracks })
  });

  const response = await service.download(request);
  const buffer = Buffer.from(response.file);
  const outputPath = output || response.fileName;

  writeFileSync(outputPath, buffer);
  console.log(
    `Saved "${response.fileName}" -> ${outputPath} (${buffer.length} bytes)`
  );
}

main().catch((error) => {
  console.error(
    `Download failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
