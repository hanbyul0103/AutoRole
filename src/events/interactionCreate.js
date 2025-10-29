export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands?.get(interaction.commandName);
        if (!command) return;

        try {
            await command.callback(client, interaction);
        } catch (error) {
            console.error(`[INTERACTION_CREATE] 명령어 실행 중 오류 발생:`, error);
            await interaction.reply({
                content: "명령어 실행 중 예상치 못한 오류가 발생했습니다.",
                ephemeral: true,
            });
        }
    },
};
