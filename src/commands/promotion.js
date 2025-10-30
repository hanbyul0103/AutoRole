// 학년 역할 변경 및 닉네임 변경이 수행됨 (한 번에 한 개의 서버만 진행할 것)

// 라이브러리
import path from 'path';

// 외부 함수
import * as jsonHelper from "../data/jsonHelper.js";

export default {
    name: 'promotion',
    description: '재학생을 대상으로 진급을 수행합니다.',
    options: [],
    callback: async (client, interaction) => {
        const serverDataDirectory = jsonHelper.getDirectory("serverData");
        const serverDataPath = path.join(serverDataDirectory, `${interaction.guild.id}.json`);

        const serverData = jsonHelper.readFile(serverDataPath);

        console.log(serverData.members);
    }
}