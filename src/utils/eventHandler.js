// 라이브러리
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadEvents = (client) => {
    const eventsPath = path.join(__dirname, "..", "events");
    if (!fs.existsSync(eventsPath)) {
        console.error("[EVENT_HANDLER] events 폴더를 찾을 수 없습니다:", eventsPath);
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const fileUrl = pathToFileURL(filePath).href; // ← pathToFileURL 사용
        import(fileUrl).then(({ default: event }) => {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`[EVENT_HANDLER] ${event.name} loaded`);
        }).catch(err => {
            console.error(`[EVENT_HANDLER] 이벤트 로드 실패: ${file}`, err);
        });
    }
};
