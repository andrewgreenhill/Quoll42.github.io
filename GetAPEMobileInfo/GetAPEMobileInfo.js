/*---------------------- Get APE Mobile Info -------------------------
An assistant for getting lists of data from APE Mobile sites, including:
* Users
* Projects
* Templates <= with extra details
* Org Lists
* Project List Types

By Andrew Greenhill.
Version 0.5...
-----------------------------------------------------------------------------*/
import { aGet, apeEntityType, conLog } from './APE_API_Helper.js';

var my_GAMI_NameSpace = function() {
  //A function wrapper simply to create my own name space

  initialise_web_page(); //Set things up in the web page HTML:
  function initialise_web_page() {
    document.getElementById('siteName').placeholder = 'apesandbox';
    // document.getElementById('emailAddress').placeholder = 'support@apexperience.com.au';
    document.getElementById('butn_GI').onclick = getInfo;
  }

  var site1 = {
    type: 'ape mobile',
    name: '',
    apiKey: '',
    userID: 1,
    proxy: 'https://cors-anywhere-ag.herokuapp.com/',
    defaultTimeout: 3000,
  };
  async function getInfo() {
    console.log('Getting info...');
    site1.apiKey = document.getElementById('siteKey').value;

    // Get the site name, and then 'standardise' it (so that a variety of user input 'styles' will work)
    site1.name = document.getElementById('siteName').value || document.getElementById('siteName').placeholder;
    site1.name = removeStartOfString(site1.name, '//');
    site1.name = removeEndOfString(site1.name, '/');
    if (site1.name === site1.name.split('.')[0]) {
      site1.name = site1.name + '.apemobile.com';
    }

    let infoType = document.getElementById('infoType').value;
    let entityType = map2APEMobileEntityType(infoType);

    let jsonResult = await aGet(site1, entityType, '', {}, { dontRLUserCheck: true });
    console.log(jsonResult);
    // download(JSON.stringify(jsonResult), 'jsonResult.json', 'text/plain');

    // Convert jsonResult to CSV, using the 1st record to determine the column headings
    let csv = json2csv(jsonResult, keysOf1stRecord(jsonResult));
    console.log(csv);
    let outputFilename = removeEndOfString(site1.name, '.') + '_' + infoType + 's_' + currentYYMMDD() + '.csv';
    conLog(outputFilename);
    // downloadFile(csv, outputFilename, 'text/plain');
  }

  function removeStartOfString(str, marker) {
    return str.split(marker).pop();
  }
  function removeEndOfString(str, marker) {
    return str.split(marker)[0];
  }
  function currentYYMMDD() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yy = today.getFullYear() - 2000; //Assuming between the years 2000 and 2099
    return yy + mm + dd;
  }

  function keysOf1stRecord(jsonArray) {
    return Object.keys(jsonArray[0]);
  }

  function json2csv(jsonArray, columnHeadings) {
    const replacer = (key, value) => (value === null ? '' : value); // Specify how you want to handle null values here
    let csv = jsonArray.map(row => columnHeadings.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(columnHeadings.join(','));
    return csv.join('\r\n');
  }

  function downloadFile(content, fileName, contentType) {
    var downloadLink = document.createElement('a');
    var blob = new Blob(['\ufeff', content], { type: contentType });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    // document.body.appendChild(downloadLink);
    downloadLink.click();
    // document.body.removeChild(downloadLink);
  }

  function map2APEMobileEntityType(infoType) {
    switch (infoType) {
      case 'User':
        return apeEntityType.User;
      case 'Project':
        return apeEntityType.Project;
      case 'Template':
        return apeEntityType.Template;
      case 'OrgList':
        return apeEntityType.OrgList;
      case 'ProjectListType':
        return apeEntityType.ProjectListType;
      default:
        break;
    }
  }
};
my_GAMI_NameSpace(); //End of my_TMA_NameSpace function, and then run it.
