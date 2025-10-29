import {
    REST,
    Routes
} from 'discord.js';

//env설정
import dotenv from "dotenv";
dotenv.config();

// 라이브러리
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function registCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
        const commandModule = await import(pathToFileURL(path.join(commandsPath, file)));
        const command = commandModule.default;

        if (!command?.name || !command?.description) {
            console.warn(`[COMMAND_REGISTER] ${file}에서 name 또는 description 누락됨`);
            continue;
        }

        // Slash Command JSON 변환
        commands.push({
            name: command.name,
            description: command.description,
            options: command.options ?? [],
        });
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log(`[COMMAND_REGISTER] ${commands.length}개 명령어 등록중...`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('[COMMAND_REGISTER] 슬래시 커맨드 등록 완료!');
    } catch (err) {
        console.error('[COMMAND_REGISTER] 등록 오류:', err);
    }
}

export { registCommands }