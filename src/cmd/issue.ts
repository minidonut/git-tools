import { Octokit } from '@octokit/rest';
import { accessToken, repoTable } from '../common/config';
import { getRepo } from '../common/repo';
import * as prompts from 'prompts';
import * as execa from 'execa';
import * as chalk from 'chalk';

const getMe = async (octokit: Octokit): Promise<string> => {
  const {
    data: { login: user },
  } = await octokit.request('/user');
  return user;
};

type AddIssueArg = {
  title: string;
  owner: string;
  repo: string;
  octokit: Octokit;
  description: string;
};
const addIssue = async ({
  owner,
  repo,
  title,
  octokit,
  description = '',
}: AddIssueArg): Promise<{ url: string; number: number }> => {
  if (!title) {
    throw new Error('issue title should be provided');
  }
  const me = await getMe(octokit);
  const { data } = await octokit.issues.create({
    owner,
    repo,
    title,
    assignees: [me],
    body: description,
  });
  return {
    url: data.html_url,
    number: data.number,
  };
};

const checkout = async (branch: string): Promise<void> => {
  await execa('git', ['fetch', 'origin', 'master'], {
    stdio: 'inherit',
  });

  await execa('git', ['checkout', '-b', branch], {
    stdio: 'inherit',
  });
};

/*
const argv = yargs.command(
  'add [message]',
  'add a issue',
  yargs => {
    yargs.positional('message', {
      type: 'string',
      default: '',
      describe: 'issue title',
    });
    yargs.option('checkout', {
      alias: 'c',
      type: 'boolean',
      describe: 'create commit and checkout as issue-number',
    });
  },
  async argv => {
    const message = argv.message as string;
    const checkout = argv.checkout as boolean;
    await addIssue({
      message,
      checkout,
    });
  }
).argv;
*/

/**
 * issue command entry
 */
const main = async (): Promise<void> => {
  const { owner, repo, url } = await getRepo();
  const fullname = `${owner}/${repo}`;

  if (!(fullname in repoTable)) throw new Error(`can not find ${fullname} in config`);
  const { api, prefix } = repoTable[fullname];

  const { title } = await prompts({
    name: 'title',
    type: 'text',
    message: 'title',
  });
  if (!title) process.exit(0);

  const { description } = await prompts({
    name: 'description',
    type: 'text',
    message: 'description',
  });

  const { doCheckout } = await prompts({
    name: 'doCheckout',
    type: 'confirm',
    message: `create a new branch and checkout?`,
    initial: true,
  });

  const confirmMessage = `
create a new issue at ${chalk.green(url)}
  ${chalk.grey('title')}       - ${title}
  ${chalk.grey('description')} - ${description}
  ${chalk.grey('checkout')}    - ${chalk.green(doCheckout)}
`;

  const { proceed } = await prompts({
    name: 'proceed',
    type: 'confirm',
    message: confirmMessage,
    initial: true,
  });

  if (!proceed) {
    console.log('canceled');
    process.exit(0);
  }

  const octokit = new Octokit({
    auth: accessToken,
    baseUrl: api,
  });

  const { number: issueNumber, url: issueUrl } = await addIssue({
    octokit,
    owner,
    repo,
    title,
    description,
  });

  if (doCheckout) await checkout(`${prefix}-${issueNumber}`);
  console.log(issueUrl);
};

main();
