(function(){
	let section=window.location.hash;
	if(!section)window.location.hash="#options";
	else changeActive(section.substr(1));
	translate();
	document.getElementById("notificationTime").addEventListener("change",e=>{document.getElementById("oTime").value=parseInt(e.target.value/1000);});
	document.getElementById("showNotification").addEventListener("change",e=>{
		let checked=e.target.checked;
		document.getElementById("trTime").className="row "+checked;
		document.getElementById("notificationTime").disabled=!checked;
	});
	document.addEventListener("DOMContentLoaded",restoreOptions);
	document.getElementById("optionsForm").addEventListener("change",saveOptions);
	document.getElementById("iconTheme").addEventListener("change",e=>{browser.runtime.sendMessage({"iconTheme":e.target.value});});
	document.getElementById("showPageAction").addEventListener("change",e=>{browser.runtime.sendMessage({"pageAction":true,"show":e.target.checked});});
	document.getElementById("addToContextMenu").addEventListener("change",e=>{browser.runtime.sendMessage({"addToContextMenu":e.target.checked});});
	document.getElementById("backup").addEventListener("click",createBackup);
	window.addEventListener("hashchange",e=>{changeActive(e.newURL.split("#")[1]);});
	document.getElementById("file").addEventListener("change",handleFileSelect);
	document.getElementById("restore").addEventListener("click",restoreBackup);
	document.getElementById("showSearchBar").addEventListener("change",e=>{
		let checked=e.target.checked;
		document.getElementById("sortSub").className="sub "+checked;
		document.getElementById("showSort").disabled=!checked;
	});
})();

function saveOptions(){
	let settings={
		view:				document.getElementById("view").value,
		theme:				document.getElementById("theme").value,
		showNotification:	document.getElementById("showNotification").checked,
		notificationTime:	parseInt(document.getElementById("notificationTime").value),
		rapidDeleting:		document.getElementById("rapidDeleting").checked,
		showNotificationBar:document.getElementById("showNotificationBar").checked,
		showSearchBar:		document.getElementById("showSearchBar").checked,
		addToContextMenu:	document.getElementById("addToContextMenu").checked,
		iconTheme:			document.getElementById("iconTheme").value,
		showSort:			document.getElementById("showSort").checked,
		sort:				document.getElementById("sort").value,
		changelog:			document.getElementById("openChangelog").checked,
		pageAction:			document.getElementById("showPageAction").checked,
		readerMode:			document.getElementById("readerMode").value
	};
	browser.storage.local.set({settings:settings});
	browser.runtime.sendMessage({"refreshList":true});
}

function restoreOptions(){
	browser.storage.local.get('settings').then(result=>{
		let s=result.settings;
		document.getElementById("view").value=s.view;
		document.getElementById("theme").value=s.theme;
		document.getElementById("showNotification").checked=s.showNotification;
		if(!s.showNotification){
			document.getElementById("trTime").className="row false";
			document.getElementById("notificationTime").disabled=true;
		}
		document.getElementById("notificationTime").value=s.notificationTime;
		document.getElementById("oTime").value=parseInt(s.notificationTime/1000);
		document.getElementById("rapidDeleting").checked=s.rapidDeleting;
		document.getElementById("showNotificationBar").checked=s.showNotificationBar;
		document.getElementById("showSearchBar").checked=s.showSearchBar;
		document.getElementById("addToContextMenu").checked=s.addToContextMenu;
		document.getElementById("iconTheme").value=s.iconTheme;
		document.getElementById("showSort").checked=s.showSort;
		document.getElementById("sort").value=s.sort;
		if(!s.showSearchBar){
			document.getElementById("sortSub").className="sub false";
			document.getElementById("showSort").disabled=true;
		}
		document.getElementById("openChangelog").checked=s.changelog!==false?true:false;
		document.getElementById("showPageAction").checked=s.pageAction;
		document.getElementById("readerMode").value=s.readerMode;
	});
}

function createBackup(){
	browser.storage.local.get().then(result=>{
		let a=document.createElement("a");
		document.body.appendChild(a);
		let json=JSON.stringify(result),
			blob=new Blob([json],{type:"octet/stream"}),
			url=window.URL.createObjectURL(blob),
			d=new Date(),
			date=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
		a.href=url;
		a.download=`${i18n("extensionName")} - ${date}.json`;
		a.style.display="none";
		a.click();
		window.URL.revokeObjectURL(url);
	});
}

function translate(){
	document.title=i18n("extensionName");
	document.getElementById("optionsA").textContent=i18n("options");
	document.getElementById("changelogA").textContent=i18n("changelog");
	document.getElementById("supportA").textContent=i18n("support");
	document.getElementById("h2options").textContent=i18n("options");
	document.getElementById("h3general").textContent=i18n("general");
	document.getElementById("labelShowNotification").textContent=i18n("showNotification");
	document.getElementById("timeLabel").textContent=i18n("notificationTime");
	document.getElementById("labelShowNotificationBar").textContent=i18n("showNotificationBar");
	document.getElementById("labelAddToContextMenu").textContent=i18n("addToContextMenu");
	document.getElementById("labelIconTheme").textContent=i18n("iconTheme");
	let iconTheme=document.getElementById("iconTheme").options;
		iconTheme[0].text=i18n("lightTheme");
		iconTheme[1].text=i18n("darkTheme");
		iconTheme[2].text=i18n("whiteTheme");
		iconTheme[3].text=i18n("blackTheme");
	document.getElementById("h3sidebar").textContent=i18n("sidebar");
	document.getElementById("labelShowSearchBar").textContent=i18n("showSearchBar");
	document.getElementById("labelRapidDeleting").textContent=i18n("rapidDeleting");
	document.getElementById("labelView").textContent=i18n("view");
	let view=document.getElementById("view").options;
		view[0].text=i18n("compact");
		view[1].text=i18n("normal");
	document.getElementById("labelTheme").textContent=i18n("theme");
	let theme=document.getElementById("theme").options;
		theme[0].text=i18n("lightTheme");
		theme[1].text=i18n("darkTheme");
	document.getElementById("h3backup").textContent=i18n("h3backup");
	document.getElementById("backup").textContent=i18n("backup");
	document.getElementById("h2changelog").textContent=i18n("changelog");
	document.getElementById("h2support").textContent=i18n("support");
	document.getElementById("h3bugReport").textContent=i18n("bugReport");
	document.getElementById("spanBugReport").textContent=i18n("spanBugReport");
	document.getElementById("h3translation").textContent=i18n("translation");
	document.getElementById("spanTranslation1").textContent=i18n("spanTranslation1");
	document.getElementById("spanTranslation2").textContent=i18n("spanTranslation2");
	document.getElementById("spanTranslation3").textContent=i18n("spanTranslation3");
	document.getElementById("h3share").textContent=i18n("share");
	document.getElementById("spanShare").textContent=i18n("spanShare");
	document.getElementById("fileText").textContent=i18n("restoreBackup");
	document.getElementById("restoreAlertH4").textContent=i18n("restoreAlertH4");
	document.getElementById("restoreAlertP").textContent=i18n("restoreAlertP");
	document.getElementById("restore").textContent=i18n("restoreButton");
	document.getElementById("restoreError").textContent=i18n("restoreError");
	document.getElementById("restoreOk").textContent=i18n("restoreOk");
	document.getElementById("labelShowSort").textContent=i18n("showSort");
	document.getElementById("labelSort").textContent=i18n("sort");
	let sort=document.getElementById("sort").options;
		sort[0].text=i18n("descDate");
		sort[1].text=i18n("ascDate");
		sort[2].text=i18n("az");
		sort[3].text=i18n("za");
	document.getElementById("labelOpenChangelog").textContent=i18n("openChangelog");
	document.getElementById("labelShowPageAction").textContent=i18n("showPageAction");
	document.getElementById("labelReaderMode").textContent=i18n("labelReaderMode");
	let readerMode=document.getElementById("readerMode").options;
		readerMode[0].text=i18n("readerMode0");
		readerMode[1].text=i18n("readerMode1");
		readerMode[2].text=i18n("readerMode2");
		readerMode[3].text=i18n("readerMode3");
}

function i18n(e,s1){
	return browser.i18n.getMessage(e,s1);
}

function changeActive(e){
	document.getElementById("optionsA").removeAttribute("class");
	document.getElementById("changelogA").removeAttribute("class");
	document.getElementById("supportA").removeAttribute("class");
	document.getElementById(e+"A").className="active";
}

let uploaded;

function handleFileSelect(e){
	let file=e.target.files[0];
	if(file.type==="application/json"||file.type==="application/x-javascript"){
		let reader=new FileReader();
		reader.onload=function(event){
			try{
				uploaded=JSON.parse(event.target.result);
				document.getElementById("restoreError").className="none";
				document.getElementById("restoreAlert").removeAttribute("class");
			}catch(e){
				document.getElementById("restoreAlert").className="none";
				document.getElementById("restoreError").removeAttribute("class");
			}
			document.getElementById("restoreOk").className="none";
		};
		reader.onerror=function(event){
			document.getElementById("restoreAlert").className="none";
			document.getElementById("restoreOk").className="none";
			document.getElementById("restoreError").removeAttribute("class");
		}
		reader.readAsText(file);
	}
}

function restoreBackup(){
	browser.storage.local.set({pages:uploaded.pages,thumbs:uploaded.thumbs}).then(()=>{
		document.getElementById("restoreAlert").className="none";
		document.getElementById("restoreOk").removeAttribute("class");
		browser.runtime.sendMessage({"restoredBackup":true});
	},()=>{
		document.getElementById("restoreAlert").className="none";
		document.getElementById("restoreError").removeAttribute("class");
	});
}
