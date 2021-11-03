/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 151:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 851:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 808:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(151);
const github = __nccwpck_require__(851)
const axios = __nccwpck_require__(808)

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
            } , 300000)   
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
            ref: context.payload.pull_request.head.ref
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
})();

module.exports = __webpack_exports__;
/******/ })()
;