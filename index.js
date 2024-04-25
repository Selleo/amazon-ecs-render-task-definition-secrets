const core = require('@actions/core');
const exec = require("@actions/exec");
const fs = require('fs');
const { SSMClient, GetParametersByPathCommand } = require("@aws-sdk/client-ssm");

async function run() {
    try {
        const region = core.getInput('region', { required: true });
        const envs = core.getInput('envs', { required: true });
        const paths = core.getInput('paths', { required: true });
        const taskDefinitionFile = core.getInput('task-definition', { required: true });
        const envsParts = envs.split(/\s+/);
        console.log(envsParts)
        for (let i=0; i<envsParts.length; i++){
            envsParts[i].trim();
        }
        const pathParts = paths.split(/\s+/);
        const client = new SSMClient({
            region: region,
        });
        let params=[];
        for (let j=0; j<pathParts.length; j++){
            const path = pathParts[j].trim();
            if (path==="")
                continue;
            let nextToken = null;
            while (true){
                const input = { 
                    Path: path,
                    Recursive: true,
                    ParameterFilters: [],
                    WithDecryption: true,
                    MaxResults: Number("10"),
                    NextToken: nextToken,
                };
                const command = new GetParametersByPathCommand(input);
                const response = await client.send(command);
                nextToken = response.NextToken;
                for (let i=0; i<response.Parameters.length; i++){
                    const param=response.Parameters[i];
                    const parts = param.Name.split("/");
                    const name = parts[parts.length - 1];
                    const secret = {
                        name: name,
                        valueFrom: param.ARN,
                    };
                    for (let k=0; k<envsParts.length; k++){
                        const env = envsParts[k];
                        if (env===secret.name){
                            params.push(secret);
                            break;
                        }
                    }
                }
                if (!nextToken)
                    break;
            }
        }
        const taskFile = fs.readFileSync(taskDefinitionFile, 'utf8');
        const parsedFile = JSON.parse(taskFile);
        parsedFile.containerDefinitions[0].secrets=params;
        const renderedTask = JSON.stringify(parsedFile, null, 2);
        fs.writeFileSync("output.json", renderedTask);
        core.setOutput("task-definition", "output.json");
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();