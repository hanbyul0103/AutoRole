// 월, 일을 입력하면 json에서 삭제됨 (월, 일 안 쓰면 오늘)
import {
    ApplicationCommandOptionType
} from "discord.js";

// 라이브러리

// 외부 함수

export default {
    name: 'hi',
    description: '봇이 인사합니다.',
    options: [
        {
            name: 'name',
            description: '당신의 이름을 입력하세요.',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],
    callback: async (client, interaction) => {
        let name = interaction.options?.getString("name");

        if (!name) name = "홍길동";

        await interaction.reply({ content: `Hi, ${name}.` });
    }
}