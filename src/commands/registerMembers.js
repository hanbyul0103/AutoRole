// 현재 서버 인원 등록 (재학생만)

// 라이브러리
import path from 'path';

// 외부 함수
import * as jsonHelper from "../data/jsonHelper.js";

export default {
    name: 'register-members',
    description: '재학생을 등록합니다.',
    options: [],
    callback: async (client, interaction) => {
        const serverDataDirectory = jsonHelper.getDirectory("serverData");
        const serverDataPath = path.join(serverDataDirectory, `${interaction.guild.id}.json`);

        const serverData = jsonHelper.readFile(serverDataPath);

        const guild = await client.guilds.fetch(interaction.guild.id);
        const members = await guild.members.fetch(); // Collection<Snowflake, GuildMember> 객체라서 인덱스로 접근할 수 없음

        if (serverData.roles === undefined) {
            await interaction.reply({ content: `먼저 /register-roles 명령어를 실행해주세요.`, ephemeral: true });
            return;
        }

        const studentRole = serverData.roles.student;

        const filteredMembers = members.filter(m => !m.user.bot && m.roles.cache.has(studentRole));

        let membersData = [];

        for (const member of filteredMembers.values()) {
            membersData.push({
                id: member.user.id,
                displayName: member.displayName,
                globalName: member.user.globalName,
                nickname: member.nickname,
                roles: member.roles.cache.map(r => r.id) // roles는 Collection이므로 id 배열로 변환
            });
        }

        serverData.members = membersData;

        jsonHelper.writeFile(serverDataPath, serverData);

        await interaction.reply({ content: "재학을 모두 등록했습니다.", ephemeral: true });
    }
}