// json 관리 담당

// 라이브러리
import fs from 'fs';
import path from 'path';

// 외부 함수
import { _ } from '../utils/Core/defines.js';

function isFileExist(filePath) {
    return fs.existsSync(filePath);
}

function readFile(filePath) {
    if (!isFileExist(filePath)) {
        console.log(`[JSON_HELPER] 파일이 존재하지 않습니다: ${filePath}`);

        return {};
    }

    try {
        const data = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(data || '{}');
    } catch (error) {
        console.error(`[JSON_HELPER] 파일을 불러오는 중 오류 발생: ${filePath}`, error);

        return {};
    }
}

function writeFile(filePath, data) {
    try {
        const jsonString = JSON.stringify(data, null, 4);

        fs.writeFileSync(filePath, jsonString, 'utf8');

        return true;
    } catch (error) {
        console.error(`[JSON_HELPER] 파일 저장 중 오류 발생: ${filePath}`, error);

        return false;
    }
}

function getDirectory(baseDirectory = './src/data', directoryName = null) {
    let newDirectory;

    if (!directoryName) newDirectory = baseDirectory;
    else newDirectory = path.join(baseDirectory, directoryName.toString());

    if (!isFileExist(newDirectory)) {
        console.log(`[JSON_HELPER] 폴더가 존재하지 않습니다. 폴더를 생성합니다.. ${newDirectory}`);

        fs.mkdirSync(newDirectory, { recursive: true }); // recursive를 true로 하면 한 번에 여러 개의 폴더를 생성할 수 있다.
    }

    return newDirectory;
}

// TODO: create server.json files
async function initializeServerFiles(client) {
    // 서버 json 담겨있는 폴더
    const serverDataDirectory = getDirectory(_, "serverData");

    // fileStatus.json 경로
    const fileStatusPath = path.join(getDirectory(_), "fileStatus.json");

    // fileStatus.json 파일 읽기
    let fileStatus = readFile(fileStatusPath);

    //#region 서버 데이터 검증
    console.log(`[JSON_HELPER] 서버 데이터 검증`);

    // 봇이 들어가있는 서버 id 싹 긁어와서 업데이트
    const guilds = await client.guilds.fetch();
    const guildDatas = []
    // const guilds = guild

    for (const guild of guilds.values()) {
        guildDatas.push({
            id: guild.id,
            isFileCreated: false
        });
    }

    fileStatus = guildDatas;

    console.log(fileStatus);

    writeFile(fileStatusPath, fileStatus);

    // 새로 입력된 서버 id에는 isFileCreated를 false로 (기본값)
    // 있는 서버는 파일이 생성돼있는지 검증하고 데이터 수정
    //#endregion

    //#region 서버 데이터 생성
    console.log(`[JSON_HELPER] 서버 데이터 생성중...`);

    fileStatus = readFile(fileStatusPath);

    for (let i = 0; i < fileStatus.length; i++) {
        // 파일 대조하면서 생성
        if (fileStatus[i].isFileCreated === false) {
            const dataPath = path.join(serverDataDirectory, `${fileStatus[i].id}.json`);
            const guild = await client.guilds.fetch(fileStatus[i].id);
            const members = await guild.members.fetch(); // Collection<Snowflake, GuildMember> 객체라서 인덱스로 접근할 수 없음
            const filteredMembers = members.filter(m => !m.user.bot)

            let memberDatas = [];

            for (const member of filteredMembers.values()) {
                memberDatas.push({
                    id: member.user.id,
                    displayName: member.displayName,
                    nickname: member.nickname,
                    roles: member.roles.cache.map(r => r.id) // roles는 Collection이므로 id 배열로 변환
                });
            }

            const data = {
                roles: {
                    st: "",
                    nd: "",
                    rd: ""
                },
                "memberDatas": memberDatas
            };

            writeFile(dataPath, data);

            // TODO: 서버 세팅이 달라졌는지 확인해서 수정했으면 좋겠는데
            // fileStatus[i].isFileCreated = true;
            // writeFile(fileStatusPath, fileStatus);

            console.log(memberDatas.length);
        }
    }
    //#endregion
}

export { readFile, writeFile, initializeServerFiles };