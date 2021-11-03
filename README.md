check-file-repository
This action checks the status of the jira service desk every 30 minutes, if the status is done the action ends execution
Example
```
jobs:
  check-status-service-desk:
    runs-on: ubuntu-latest
    name: check status service desk
    steps:
      - uses: actions/checkout@v2
      - id: foo
        uses: archaic10/check-status-service-desk@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          path_file: 'apps.js'
          url-jira:'<url_example>'
          basic-auth:'<basic_auth_jira>'
      - name: Get the output foo
        run: echo "The time was ${{ steps.foo.outputs.result }}"
```

To use this action you need to pass the github_token, the path of the configuration file, which needs to be a .json file, containing the input branch information and the base branch and the jira card id: 

example
```
{
    "branch_base": "main",
    "branch_head": "development",
    "id_card": "10"
}
```
    