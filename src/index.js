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
	document.getElementById("addToContextMenu").addEventListener("change",e=>{browser.runtime.sendMessage({"addToContextMenu":e.target.checked});});
	document.getElementById("backup").addEventListener("click",createBackup);
	window.addEventListener("hashchange",e=>{changeActive(e.newURL.split("#")[1]);});
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
		iconTheme:			document.getElementById("iconTheme").value
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
		a.download=`${i18n("extensionName")} - ${date}.js`;
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
