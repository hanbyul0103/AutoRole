const config = require('./config/config.json');
const { Client, IntentsBitField } = require('discord.js');

let currentGuild;
let firstGradeRole, secondGradeRole, thirdGradeRole, student, graduate;
let gradeRoles;
let members;
let ownerId;

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.once('ready', async () => {
    console.log(`[!] Bot Login: ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        currentGuild = guild;
        await GetRoles();
        members = await currentGuild.members.fetch();
        ownerId = guild.ownerId;
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'hi') {
        await message.reply('hi');
    }

    if (command === 'role') {
        await RoleAssignment(message);
    }

    if (command === 'change') {
        await ChangeNickname(message);
    }
});

async function GetRoles() {
    try {
        firstGradeRole = currentGuild.roles.cache.find(role => role.name === '1학년');
        secondGradeRole = currentGuild.roles.cache.find(role => role.name === '2학년');
        thirdGradeRole = currentGuild.roles.cache.find(role => role.name === '3학년');
        student = currentGuild.roles.cache.find(role => role.name === "재학생");
        graduate = currentGuild.roles.cache.find(role => role.name === "졸업생");

        gradeRoles = [firstGradeRole, secondGradeRole, thirdGradeRole, graduate];

        console.log('Get roles done');
    }
    catch (error) {
        console.error(`Error fetching roles: ${error}`);
    }
}

async function RoleAssignment(message) {
    for (const member of members.values()) {
        const nickname = member.nickname || 'None';

        if (!member.roles.cache.has(student.id)) {
            await member.roles.add(student);
        }

        if (nickname.includes('1학년')) {
            await UpdateRoles(member, firstGradeRole);
        } else if (nickname.includes('2학년')) {
            await UpdateRoles(member, secondGradeRole);
        } else if (nickname.includes('3학년')) {
            await UpdateRoles(member, thirdGradeRole);
        }
    }

    await message.reply("부여 완료");
}

async function ChangeNickname(message) {
    for (const member of members.values()) {
        if (member.id === ownerId) continue;

        const nickname = member.nickname || member.user.username;
        const name = nickname.split(' ')[0];

        try {
            if (nickname.includes('1학년')) {
                await member.setNickname(`${name} (2학년)`);
                await UpdateRoles(member, secondGradeRole);
            } else if (nickname.includes('2학년')) {
                await member.setNickname(`${name} (3학년)`);
                await UpdateRoles(member, thirdGradeRole);
            } else if (nickname.includes('3학년')) {
                await member.setNickname(`${name} (졸업생)`);
                await member.roles.remove(student);
                await UpdateRoles(member, graduate);
            }

        } catch (error) {
            console.error(`Error changing nickname for ${member.user.tag}:`, error);
        }
    }

    await message.reply('변경 완료');
}

async function UpdateRoles(member, targetRole) {
    try {
        if (!member.roles.cache.has(targetRole.id)) {
            await member.roles.add(targetRole);
            console.log(`Added '${targetRole.name}' role to ${member.user.tag}`);
        }

        for (const role of gradeRoles) {
            if (role.id !== targetRole.id && member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                console.log(`Removed '${role.name}' role from ${member.user.tag}`);
            }
        }
    } catch (error) {
        console.error('Error updating roles for', member.user.tag, ':', error);
    }
}

client.login(config.token);