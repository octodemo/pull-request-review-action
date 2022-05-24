# pull-request-review-action

A GitHub Action that can perform a Pull Request review from GitHub Actions. The primary purpose for this action is to provide automation in demos where we need an external user to perform a review to satisfy our branch protections rules.

## Usage


### Parameters

* `pr_number`: The Pull Request number to apply the review to
* `outcome`: The review outcome, one of `approve`, `comment` or `request_changes`. Note `comment` and `request_changes` require you to also add a `comment` value
* `repository`: Optional fully qualified name of the repository that contains the Pull Request, defaults to `${{ github.repository }}` from the workflow
* `comment`: Optional (although dependent on the `outcome` value) for the main comment/body for the review
* `token`: Optional GitHub token that is used to access the API for applying the review. The user associated with the token is the reviewer


### Examples

Get a temporary token for a GitHub Application and use that to apply a PR review as the application;

```
- name: Get temporary token for octodemobot application
  id: temp_token
  uses: peter-murray/workflow-application-token-action@v1.3.0
  with:
    application_id: ${{ secrets.OCTODEMOBOT_APPLICATION_ID_REPO_AUTOMATION }}
    application_private_key: ${{ secrets.OCTODEMOBOT_APPLICATION_KEY_REPO_AUTOMATION }}

- name: Apply PR Code Review
  uses: octodemo/pull-request-review-action@main
  with:
    pr_number: 1
    outcome: approve
    comment: I approve!
    token: ${{ steps.temp_token.outputs.token }}
```
