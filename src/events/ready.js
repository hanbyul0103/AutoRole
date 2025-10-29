// 외부 함수
import * as commandRegister from "../utils/commandRegister.js";
import * as loadCommands from "../utils/loadCommands.js";

export default {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("[!] ready");

        // 명령어 등록
        await commandRegister.registCommands();

        // 명령어 목록 로드
        const commands = await loadCommands.getCommands();
        client.commands = commands; // client에 저장해서 다른 이벤트에서도 접근 가능하게 함
    },
};
