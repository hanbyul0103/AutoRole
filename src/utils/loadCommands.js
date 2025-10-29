// 라이브러리
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getCommands() {
    const commands = new Map();
    const commandsPath = path.join(__dirname, '../commands');
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
        const commandModule = await import(pathToFileURL(path.join(commandsPath, file)));
        const command = commandModule.default;

        if (!command?.name || !command?.callback) {
            console.warn(`[LOAD_COMMANDS] ${file}에서 name 또는 callback이 누락됨`);
            continue;
        }

        commands.set(command.name, command);
    }

    return commands;
}

export { getCommands };