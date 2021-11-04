const core = require('@actions/core');
const github = require('@actions/github')
const axios = require('axios')

var status = null
var fileConfig = null
async function run (){
    await loadFileConfig()
    try {
        if(checkRepoConfig (github.context, getFileConfig())){
            let basic_auth =  core.getInput("basic-auth")
            let url = core.getInput("url-jira")    
            let interval = setInterval(()=>{
              if(getStatus() == null || getStatus() != 'done')
                setStatus(basic_auth,url ,getFileConfig().id_card)
              if (getStatus() != null)
                checkStatus(interval)
            } , 30000)   
        }  
    } catch (error) {
        core.setFailed(error.message); 
    }
}

async function loadFileConfig(){
    try {           
        let github_token = core.getInput("GITHUB_TOKEN")
        let path_file = core.getInput("path-file")        
        let octokit = github.getOctokit(github_token)    
        let {data} = await octokit.rest.repos.getContent({
            owner: github.context.payload.repository.owner.login,
            repo: github.context.payload.repository.name,
            path: path_file,
            ref: github.context.payload.pull_request.head.ref
        })

        let path = data.download_url
        await setFileConfig(path)
    } catch (error) {
        core.setFailed(error.message)
    }
}

async function setFileConfig(path){
    try {
        await axios.get(path).then((res)=>{
            fileConfig = res.data 
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
    if(context.payload.pull_request.head.ref == config.branch_head && context.payload.pull_request.base.ref == config.branch_base  && config != null){
        return true
    }        
    return false
}

run()