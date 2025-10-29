// json 관리 담당

// 라이브러리
import fs from 'fs';

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

// TODO: create server.json file

export { readFile, writeFile };