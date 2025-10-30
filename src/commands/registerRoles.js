// 1학년, 2학년, 3학년 역할 등록

import {
    ApplicationCommandOptionType
} from "discord.js";

// 라이브러리
import path from 'path';

// 외부 함수
import * as embedGenerator from "../utils/embedGenerator.js";
import * as jsonHelper from "../data/jsonHelper.js";

export default {
    name: 'register-roles',
    description: '학년별 역할을 등록합니다.',
    options: [
        {
            name: '1st',
            description: '1학년 역할',
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: '2nd',
            description: '2학년 역할',
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: '3rd',
            description: '3학년 역할',
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'student',
            description: '재학생 역할',
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'graduate',
            description: '졸업생 역할',
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
    ],
    callback: async (client, interaction) => {
        const st = interaction.options.getRole("1st");
        const nd = interaction.options.getRole("2nd");
        const rd = interaction.options.getRole("3rd");
        const student = interaction.options.getRole("student");
        const graduate = interaction.options.getRole("graduate");

        const serverDataDirectory = jsonHelper.getDirectory("serverData");
        const serverDataPath = path.join(serverDataDirectory, `${interaction.guild.id}.json`);

        const serverData = jsonHelper.readFile(serverDataPath);

        serverData.roles = {
            st: st.id,
            nd: nd.id,
            rd: rd.id,
            student: student.id,
            graduate: graduate.id
        }

        jsonHelper.writeFile(serverDataPath, serverData);

        const roles = [st, nd, rd, student, graduate];
        const gradeLabels = ["1학년", "2학년", "3학년", "재학생", "졸업생"];

        const fields = roles.map((role, index) => ({
            name: `\`${gradeLabels[index]}\``,
            value: `<@&${role.id}>`,
            inline: false
        }));

        const replyEmbed = embedGenerator.createEmbed({
            fields: fields,
            timestamp: true
        });

        await interaction.reply({ content: "역할이 등록되었습니다.", embeds: [replyEmbed], ephemeral: true });
    }
}