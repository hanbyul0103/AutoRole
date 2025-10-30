import { EmbedBuilder } from "discord.js";

function createEmbed({ title, description, fields = [], timestamp = false }) {
    const embed = new EmbedBuilder()
        .setTitle(title ?? " ")
        .setDescription(description ?? " ");

    if (fields.length > 0) {
        embed.addFields(fields.map(f => ({
            name: f.name,
            //value: `\`\`\`diff\n${f.value} \n\`\`\``,
            value: `${f.value}\n`,
            inline: f.inline || false
        })));
    }

    if (timestamp) {
        embed.setTimestamp();
    }

    return embed;
}

export { createEmbed };