const config = require('./config/config.json');
const { Client, IntentsBitField } = require('discord.js');

let members;
let ownerId;
const serverRoles = new Map(); // 서버별 역할 저장용

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
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const currentGuild = message.guild; // 현재 명령어를 보낸 서버
    ownerId = currentGuild.ownerId;

    if (command === 'init') {
        await SaveMembers(currentGuild, message);
        await GetRoles(currentGuild, message);
    }

    if (command === 'role') {
        await RoleAssignment(currentGuild, message);
    }

    if (command === 'change') {
        await ChangeNickname(currentGuild, message);
    }

    if (command === 'debug') {
        await DebugRole(currentGuild, message);
    }

    if (command === 'remove') {
        await RemoveDebugRole(currentGuild, message);
    }
});

async function SaveMembers(currentGuild, message) {
    members = await currentGuild.members.fetch();
    message.reply("멤버 초기화 완료");
    console.log(`Members fetched for guild: ${currentGuild.name}`);
}

async function GetRoles(currentGuild, message) {
    try {
        const roles = {
            firstGradeRole: currentGuild.roles.cache.find(role => role.name === '1학년'),
            secondGradeRole: currentGuild.roles.cache.find(role => role.name === '2학년'),
            thirdGradeRole: currentGuild.roles.cache.find(role => role.name === '3학년'),
            student: currentGuild.roles.cache.find(role => role.name === "재학생"),
            graduate: currentGuild.roles.cache.find(role => role.name === "졸업생"),
            debugRole: currentGuild.roles.cache.find(role => role.name === "debug"),
        };

        roles.gradeRoles = [
            roles.firstGradeRole,
            roles.secondGradeRole,
            roles.thirdGradeRole,
            roles.graduate,
        ];

        serverRoles.set(currentGuild.id, roles);

        message.reply(`${currentGuild.name} 서버의 역할이 저장되었습니다.`);
    } catch (error) {
        console.error(`역할을 불러오는 중 오류 발생 ${currentGuild.name}:`, error);
    }
}

async function RoleAssignment(currentGuild, message) {
    const roles = serverRoles.get(currentGuild.id);
    if (!roles) {
        return message.reply("역할이 초기화되지 않았습니다. `init` 명령을 사용하세요.");
    }

    const memberList = Array.from(members.values()).filter(member => !member.user.bot);

    for (const member of memberList) {
        await ProcessMemberRole(member, roles).catch(error =>
            console.log(`역할을 부여하던 중 오류 발생 ${member.user.tag}`)
        );
        await delay(3); // 3ms 대기
    }

    await message.reply("역할 부여 작업 완료");
}

async function ChangeNickname(currentGuild, message) {
    const roles = serverRoles.get(currentGuild.id);
    if (!roles) {
        return message.reply("역할이 초기화되지 않았습니다. `init` 명령을 사용하세요.");
    }

    const memberList = Array.from(members.values())
        .filter(member => member.id !== ownerId);

    for (const member of memberList) {
        await ProcessNicknameChange(member, roles);
        await delay(3); // 3ms 대기
    }

    await message.reply('변경 완료');
}

async function ProcessMemberRole(member, roles) {
    const nickname = member.nickname || member.user.username;

    try {
        if (!member.roles.cache.has(roles.student.id)) {
            await member.roles.add(roles.student);
            console.log(`Added '${roles.student.name}' role to ${member.user.tag}`);
        }

        if (nickname.includes('1학년')) {
            await UpdateRoles(member, roles.firstGradeRole, roles.gradeRoles);
        } else if (nickname.includes('2학년')) {
            await UpdateRoles(member, roles.secondGradeRole, roles.gradeRoles);
        } else if (nickname.includes('3학년')) {
            await UpdateRoles(member, roles.thirdGradeRole, roles.gradeRoles);
        }
    } catch (error) {
        console.error(`Error processing role for ${member.user.tag}:`, error);
    }
}

async function ProcessNicknameChange(member, roles) {
    const nickname = member.nickname || member.user.username;
    const name = nickname.split(' ')[0];

    try {
        if (nickname.includes('1학년')) {
            await member.setNickname(`${name} (2학년)`);
            await UpdateRoles(member, roles.secondGradeRole, roles.gradeRoles);
        } else if (nickname.includes('2학년')) {
            await member.setNickname(`${name} (3학년)`);
            await UpdateRoles(member, roles.thirdGradeRole, roles.gradeRoles);
        } else if (nickname.includes('3학년')) {
            await member.setNickname(`${name} (졸업생)`);
            await member.roles.remove(roles.student);
            await UpdateRoles(member, roles.graduate, roles.gradeRoles);
        }
    } catch (error) {
        console.error(`Error changing nickname for ${member.user.tag}:`, error);
    }
}

async function UpdateRoles(member, targetRole, gradeRoles) {
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

async function DebugRole(currentGuild, message) {
    const memberList = Array.from(members.values())
        .filter(member => member.id !== ownerId);

    for (const member of memberList) {
        await member.roles.add(serverRoles.get(currentGuild.id).debugRole);
        await delay(3); // 3ms 대기
    }

    await message.reply('디버그 역할 추가');
}

async function RemoveDebugRole(currentGuild, message) {
    const memberList = Array.from(members.values())
        .filter(member => member.id !== ownerId);

    for (const member of memberList) {
        await member.roles.remove(serverRoles.get(currentGuild.id).debugRole);
        await delay(3); // 3ms 대기
    }

    await message.reply('디버그 역할 삭제');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(config.token);
