import * as core from '@actions/core';
import * as github from '@actions/github';


type Repo = {
  owner: string,
  repo: string
}

const OUTCOME_VALUES = ['APPROVE', 'COMMENT', 'REQUEST_CHANGES'];

type ReviewOutcome = 'APPROVE' | 'COMMENT' | 'REQUEST_CHANGES';

type ReviewForPullRequestPayload = {
  owner: string
  repo: string
  pull_number: number
  event: ReviewOutcome
  body?: string
}

async function run() {
  const repository: Repo = getRepository()
    , pr_number: number = parseInt(getRequiredInput('pr_number'))
    , token: string = getRequiredInput('token')
    , outcome: ReviewOutcome = getOutcome()
    , comment = core.getInput('comment') || undefined
    // , pullRequestComments = core.getInput('pr_line_comments') || undefined
    ;

  try {
    const octokit = github.getOctokit(token);

    const payload: ReviewForPullRequestPayload = {
      ...repository,
      pull_number: pr_number,
      event: outcome,
    }

    if (comment) {
      payload.body = comment;
    }

    core.startGroup('Pull Request Review');
    core.info(`${JSON.stringify(payload, null, 2)}`);
    core.endGroup();

    const result = await octokit.rest.pulls.createReview(payload);
    if (result.status === 200) {
      core.info(`Pull Request review submitted successfully`);
    } else {
      throw new Error(`Unexpected status code; ${result.status} when applying pull request review`);
    }
  } catch (err) {
    core.setFailed(`Failed apply code review to PR ${pr_number}; ${err}`);
  }
}

run();


function getRequiredInput(name) {
  return core.getInput(name, { required: true });
}

function getRepository(): Repo {
  const repository = core.getInput('repository');

  const parts = repository.split('/');
  if (parts.length !== 2) {
    throw new Error(`repository value '${repository}' was not in the corect <owner>/<repository_name> form.`);
  }

  return {
    owner: parts[0],
    repo: parts[1]
  }
}


function getOutcome(): ReviewOutcome {
  const value: string = getRequiredInput('outcome').toUpperCase();

  const idx = OUTCOME_VALUES.indexOf(value);
  if (idx === -1) {
    throw new Error(`Invalid outcome value '${value}', must be one of ${JSON.stringify(OUTCOME_VALUES)} `);
  }

  // @ts-ignore
  return OUTCOME_VALUES[idx];
}

