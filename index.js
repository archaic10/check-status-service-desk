const core = require('@actions/core');
const github = require('@actions/github')
const axios = require('axios')

var status = null
var typeStatus = null
var changeStatus = false
async function run (){    
    try {        
      let basic_auth =  core.getInput("basic-auth")
      let url = core.getInput("url-jira")
      let otherTypesCurrentStatus = core.getInput("other-types-current-status")    
      let interval = setInterval(()=>{
        if(getStatus() == null || getStatus() != 'done')
          setStatus(basic_auth, url, otherTypesCurrentStatus)
        if (getStatus() != null)
          checkStatus(interval)
      } , 30000)
    } catch (error) {
        core.setFailed(error.message) 
    }
}

async function checkStatus(interval) {   
    if (getStatus() == 'done' || changeStatus ){
      clearInterval(interval)
      core.setOutput("result", "GMUD aprovada")
    }else{
      console.log('Pendente de aprovação')
    }
}

async function setStatus(basic_auth, url, otherTypesCurrentStatus) {
    
    await axios.get(url,
      {
        headers: {
          Authorization: basic_auth,
        }

      }).then((res) => {
        status = res.data.currentStatus.statusCategory.toLowerCase()
        if(otherTypesCurrentStatus){
          if(typeStatus == null)
            setTypeStatus(res.data.currentStatus.status.toLowerCase())                     

          if(typeStatus != res.data.currentStatus.status.toLowerCase())
            changeStatus = true
          
        }
      }).catch((error) => {
        core.setFailed(error.message)
      })      
}
 
function getStatus() {
    return status
}

function setTypeStatus(nameStatus){
    typeStatus = removeAccent(nameStatus)
}

function getTypeStatus(){
  return typeStatus
}

function removeAccent (text)
{       
    text = text.toLowerCase();                                                         
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replace(new RegExp('[Ç]','gi'), 'c');
    return text;                 
}

function checkRepoConfig (context){
    return context.payload.pull_request.base.ref == context.payload.repository.default_branch
}

run()