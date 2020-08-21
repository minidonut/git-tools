import * as git from 'isomorphic-git';
import * as fs from 'fs';
import { extract } from './regex';

interface RepoInfo {
  owner: string;
  repo: string;
  url: string;
}

// TODO parse http
const parse = (url: string): RepoInfo => {
  if (url.startsWith('git')) {
    const [owner, repo] = extract(/git@.+:(.+)\/(.+)\.git/, url);
    return {
      owner,
      repo,
      url,
    };
  } else {
    throw new Error("can't parse " + url);
  }
};

export const getRepo = async (): Promise<RepoInfo> => {
  const dir = await git.findRoot({
    fs,
    filepath: process.cwd(),
  });

  const repo = await git.listRemotes({ fs, dir });
  return parse(repo[0].url);
};
