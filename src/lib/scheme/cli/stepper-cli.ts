// file: cli/stepper-cli.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

import { FormatterScheme, type SnapshotPassoStepping } from '../ast/formatter';
import { creaAmbiente, AmbienteNonTrovatoError } from '../runtime/registroAmbienti';
import { StepperScheme } from '../runtime/stepper';
import { Ambiente } from '../runtime/ambiente';
import type { ValoreScheme } from '../runtime/valori';
import type { PassoStepping } from '../runtime/stepper';

type OutputFormat = 'text' | 'json';

export interface CLIOptions {
    ambiente: Ambiente<ValoreScheme> | undefined;
    filePath: string;
    maxPassi: number;
    format: OutputFormat;
    interactive: boolean;
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
        throw new Error('Uso: stepper-cli <file-programma.scm> [--max-passi N] [--json] [--ambiente ID] [--interactive|-i]');
    }

    const filePath = argv[0];
    let maxPassi = 200;
    let format: OutputFormat = 'text';
    let ambiente: Ambiente<ValoreScheme> | undefined = undefined;
    let interactive = false;

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

        if (arg === '--ambiente') {
            const idAmbiente = argv[i + 1];
            if (!idAmbiente) {
                throw new Error('Manca il valore per --ambiente');
            }

            try {
                ambiente = creaAmbiente(idAmbiente);
            } catch (error) {
                if (error instanceof AmbienteNonTrovatoError) {
                    throw new Error(`Ambiente da CLI non riconosciuto: "${idAmbiente}"`);
                }
                throw error;
            }

            i++;
            continue;
        }

        if (arg === '--interactive' || arg === '-i') {
            interactive = true;
            continue;
        }

        throw new Error(`Argomento non riconosciuto: ${arg}`);
    }

    return { filePath, maxPassi, format, ambiente, interactive };
}

/**
 * Attende la pressione di INVIO dallo standard input.
 */
function attendiPressioneInvio(promptText: string): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(promptText, () => {
            rl.close();
            resolve();
        });
    });
}

/**
 * Esegue lo stepper in streaming interattivo (passo-passo).
 */
export async function eseguiStepperInterattivo(options: CLIOptions): Promise<void> {
    const sorgente = readFileSync(options.filePath, 'utf-8');
    const stepper = StepperScheme.daSorgente(sorgente, options.ambiente);
    const formatter = new FormatterScheme();

    const passiAcquisiti: PassoStepping[] = [];
    let numeroPasso = 0;

    process.stdout.write(`=== AVVIO STEPPER INTERATTIVO (${options.filePath}) ===\n\n`);

    for (const passo of stepper.passiStream(sorgente, options.maxPassi)) {
        numeroPasso++;
        passiAcquisiti.push(passo);

        if (options.format === 'json') {
            const snapshot = formatter.formattaTimelineStepping([passo])[0];
            process.stdout.write(JSON.stringify({ passo: numeroPasso, snapshot }, null, 2) + '\n');
        } else {
            const outputTesto = formatter.formattaTimelineTestuale([passo]);
            process.stdout.write(`--- Passo ${numeroPasso} ---\n`);
            process.stdout.write(`${outputTesto}\n\n`);
        }

        if (!passo.èTerminato) {
            await attendiPressioneInvio('Premi [INVIO] per eseguire il prossimo passo (o Ctrl+C per uscire)... ');
        }
    }

    process.stdout.write(`\n=== ESECUZIONE COMPLETATA (${numeroPasso} passi) ===\n`);
}

/**
 * Esecuzione standard non interattiva (batch).
 */
export function eseguiStepperDaFile(options: CLIOptions): string {
    const sorgente = readFileSync(options.filePath, 'utf-8');
    const stepper = StepperScheme.daSorgente(sorgente, options.ambiente);
    const formatter = new FormatterScheme();

    // Raccoglie la sequenza consumando il generatore passiStream
    const passi: PassoStepping[] = Array.from(stepper.passiStream(sorgente, options.maxPassi));

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

async function main(): Promise<void> {
    try {
        const options = parseArgs(process.argv.slice(2));

        if (options.interactive) {
            await eseguiStepperInterattivo(options);
        } else {
            const output = eseguiStepperDaFile(options);
            process.stdout.write(`${output}\n`);
        }
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