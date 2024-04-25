# Amazon ECS "PRE-Render Task Definition Secrets" Action for GitHub Actions

This task is additionial task that is executed before ECS Render Task Definition Action that only injects Parameter Store Secrets into `task-definition.json` file and does nothing more.

Features:
- ability to read parameter store secrets from multiple paths for given region,
- explicit list of environment variable names to be used by the task definition.

## Usage

Single source of parameters:

```yaml
      - name: Render secrets from parameter store
        id: render-secrets
        uses: Selleo/amazon-ecs-render-task-definition-secrets@v1.0
        with:
          region: eu-central-1
          task-definition: task-definition.json
          envs: -|
            AWS_ACCESS_KEY_ID 
            AWS_REGION
          paths: /ecs/app/production/
```

Options:
- `region` - AWS Region to fetch Parameter Store Secrets
- `task-definition` - Your input file
- `envs` - List of environment variables included in the path that you want to render in task defintion
- `paths` - List of sources to fetch Parameter Store Secrets from

Outputs:
- `task-definition` - Output file path available for next steps (`${{ steps.render-secrets.outputs.task-definition }}`)

Example usage with multiple paths:

```yaml
      - name: Render secrets from parameter store
        id: render-secrets
        uses: Selleo/amazon-ecs-render-task-definition-secrets@v1.0
        with:
          region: eu-central-1
          task-definition: task-definition.json
          envs: -|
            AWS_ACCESS_KEY_ID 
            AWS_REGION
          paths: -|
            /ecs/app/production/
            /ecs/app-config/production/
```