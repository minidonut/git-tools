import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CONFIG_PATH = path.join(os.homedir(), '.config', 'minidonut@git-tools', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

export const accessToken: string = config['access-token'];
export const repoTable: Record<string, { api: string; prefix: string }> = config['repositories'];
