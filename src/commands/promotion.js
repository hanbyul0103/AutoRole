// 학년 역할 변경 및 닉네임 변경이 수행됨 (한 번에 한 개의 서버만 진행할 것)

// 라이브러리
import path from 'path';

// 외부 함수
import * as jsonHelper from "../data/jsonHelper.js";
import * as defines from "../utils/Core/defines.js";

export default {
    name: 'promotion',
    description: '재학생을 대상으로 진급을 수행합니다.',
    options: [],
    callback: async (client, interaction) => {
        const serverDataDirectory = jsonHelper.getDirectory("serverData");
        const serverDataPath = path.join(serverDataDirectory, `${interaction.guild.id}.json`);

        const serverData = jsonHelper.readFile(serverDataPath);

        const guild = client.guilds.fetch(interaction.guild.id);

        for (let i = 0; i < serverData.members.length; i++) {
            const member = guild.members.fetch(serverData.members[i].id);

            // role change


            const originNickname = (serverData.members[i].displayName || serverData.members[i].nickname || serverData.members[i].globalName).toString();
            const newNickname = promoteGrade(originNickname);

            const data = {
                nick: `${newNickname}`,
                roles: []
            };

            await editMemberData(member, data);
        }

        console.log(serverData.members);
    }
}

async function editMemberData(member, data) {
    try {
        await member.edit(data);
        return;
    } catch (error) {
        if (error.code === 429 && error.retry_after) {
            console.log(`429 발생, ${error.retry_after}s 기다리는 중...`);

            await new Promise(r => setTimeout(r, (err.retry_after + 0.1) * 1000));
        } else {
            console.log(error);
            return;
        }
    }
}

function promoteGrade(str) {
    const match = str.match(/\((\d)학년\)/);

    if (!match) {
        console.log(`해당 학생의 학년 정보가 없습니다. ${str}`);
        return str; // 학년 정보가 없으면 그대로 반환
    }

    const grade = Number(match[1]);

    if (grade === 3) {
        return str.replace(/\(\d학년\)/, `(${defines.cardinalNumber}기)`);
    }

    // 다음 학년으로 변경
    const nextGrade = grade + 1;
    return str.replace(/\(\d학년\)/, `(${nextGrade}학년)`);
}

function promoteRole() {

}