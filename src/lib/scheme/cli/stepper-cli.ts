import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FormatterScheme, type SnapshotPassoStepping } from '../ast/formatter';
import { creaAmbienteGlobale } from '../runtime/ambienteStandard';
import { StepperScheme } from '../runtime/stepper';

type OutputFormat = 'text' | 'json';

export interface CLIOptions {
    filePath: string;
    maxPassi: number;
    format: OutputFormat;
}

interface TracciaJSON {
    filePath: string;
    maxPassi: number;
    numeroPassi: number;
    terminato: boolean;
    passi: SnapshotPassoStepping[];
}

function parseArgs(argv: string[]): CLIOptions {
    if (argv.length === 0) {
        throw new Error('Uso: stepper-cli <file-programma.scm> [--max-passi N] [--json]');
    }

    const filePath = argv[0];
    let maxPassi = 200;
    let format: OutputFormat = 'text';

    for (let i = 1; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--max-passi') {
            const valore = argv[i + 1];
            if (!valore) {
                throw new Error('Manca il valore per --max-passi');
            }

            const parsed = Number(valore);
            if (!Number.isInteger(parsed) || parsed <= 0) {
                throw new Error('--max-passi deve essere un intero positivo');
            }

            maxPassi = parsed;
            i++;
            continue;
        }

        if (arg === '--json') {
            format = 'json';
            continue;
        }

        throw new Error(`Argomento non riconosciuto: ${arg}`);
    }

    return { filePath, maxPassi, format };
}

export function eseguiStepperDaFile(options: CLIOptions): string {
    const sorgente = readFileSync(options.filePath, 'utf-8');
    const stepper = new StepperScheme(creaAmbienteGlobale());
    const formatter = new FormatterScheme();

    const passi = stepper.passiDaSorgente(sorgente, options.maxPassi);

    if (options.format === 'json') {
        const timeline = formatter.formattaTimelineStepping(passi);
        const payload: TracciaJSON = {
            filePath: options.filePath,
            maxPassi: options.maxPassi,
            numeroPassi: timeline.length,
            terminato: timeline.length > 0 ? timeline[timeline.length - 1].terminato : false,
            passi: timeline,
        };

        return JSON.stringify(payload, null, 2);
    }

    return formatter.formattaTimelineTestuale(passi);
}

function main(): void {
    try {
        const options = parseArgs(process.argv.slice(2));
        const output = eseguiStepperDaFile(options);
        process.stdout.write(`${output}\n`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Errore CLI stepper: ${message}\n`);
        process.exitCode = 1;
    }
}

const thisFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (invokedFile === thisFile) {
    main();
}