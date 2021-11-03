const core = require('@actions/core');
const github = require('@actions/github')
const axios = require('axios')

var status = null
var fileConfig = null
async function run (){
    
    try {
        let github_token = core.getInput("GITHUB_TOKEN")
        let path_file = core.getInput("path-file")
        console.log("path_file") 
        console.log(path_file) 
        let octokit = github.getOctokit(github_token)    
        let {data} = await octokit.rest.repos.getContent({
            owner: github.context.payload.repository.owner.login,
            repo: github.context.payload.repository.name,
            path: path_file,
        })

        let path = data.download_url
        await setFileConfig(path)

        console.log("run")
        console.log(getFileConfig())
        if(checkRepoConfig (github.context, getFileConfig())){
            let basic_auth =  core.getInput("basic-auth")
            let url = core.getInput("url-jira")    
            let interval = setInterval(()=>{
              if(getStatus() == null || getStatus() != 'done')
                setStatus(basic_auth,url ,getFileConfig().id_card)
              if (getStatus() != null)
                checkStatus(interval)
            } , 300000)   
        }  
    } catch (error) {
        core.setFailed(error.message); 
    }
}

// async function loadFileConfig(){
//     try {           
        
//     } catch (error) {
//         core.setFailed(error.message)
//     }
// }

async function setFileConfig(path){
    try {
        console.log("setFileConfig")
        console.log(path)
        await axios.get(path).then((res)=>{
            fileConfig = res.data
            console.log("fileConfig")      
            console.log(fileConfig)      
        }).catch((error)=>{
            console.log(error)
        })
    } catch (error) {
        core.setFailed(error.message)
    }
}
 
function getFileConfig(){
    return fileConfig
}

async function checkStatus(interval) {   
    if (getStatus() == 'done'){
      clearInterval(interval)
      core.setOutput("result", "GMUD aprovada")
    }else{
      console.log('pendente de aprovação')
    }
}

async function setStatus(basic_auth, url, id_card) {
    
    await axios.get(`${url}${id_card}`,
      {
        headers: {
          Authorization: basic_auth,
        }

      }).then((res) => {
        status = res.data.currentStatus.statusCategory.toLowerCase()
      }).catch((error) => {
        core.setFailed(error.message)
      })      
}
 
function getStatus() {
    return status
}

function checkRepoConfig (context, config){
    console.log("config")
    console.log(config)
    console.log("file config")
    console.log(config.branch_head)
    console.log("pull request object")
    console.log(context.payload.pull_request.head)
    if(context.payload.pull_request.head.ref == config.branch_head && context.payload.pull_request.base.ref == config.branch_base  && config != null){
        return true
    }        
    return false
}

run()