(function(){
	translate();
	document.getElementById("notificationTime").addEventListener("change",e=>{document.getElementById("oTime").value=parseInt(e.target.value/1000);});
	document.getElementById("showNotification").addEventListener("change",e=>{
		let checked=e.target.checked;
		document.getElementById("trTime").className=checked;
		document.getElementById("notificationTime").disabled=!checked;
	});
	document.addEventListener("DOMContentLoaded",restoreOptions);
	document.getElementById("optionsForm").addEventListener("change",saveOptions);
	document.getElementById("backup").addEventListener("click",createBackup);
})();

function saveOptions(){
	let settings={
		view:				document.getElementById("view").value,
		theme:				document.getElementById("theme").value,
		showNotification:	document.getElementById("showNotification").checked,
		notificationTime:	parseInt(document.getElementById("notificationTime").value),
		rapidDeleting:		document.getElementById("rapidDeleting").checked,
		showNotificationBar:document.getElementById("showNotificationBar").checked
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
		document.getElementById("notificationTime").value=s.notificationTime;
		document.getElementById("oTime").value=parseInt(s.notificationTime/1000);
		document.getElementById("rapidDeleting").checked=s.rapidDeleting;
		document.getElementById("showNotificationBar").checked=s.showNotificationBar;
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
	document.getElementById("h2options").textContent=i18n("options");
	document.getElementById("labelView").textContent=i18n("view");
	let view=document.getElementById("view").options;
		view[0].text=i18n("compact");
		view[1].text=i18n("normal");
	document.getElementById("labelTheme").textContent=i18n("theme");
	let theme=document.getElementById("theme").options;
		theme[0].text=i18n("lightTheme");
		theme[1].text=i18n("darkTheme");
	document.getElementById("labelShowNotification").textContent=i18n("showNotification");
	document.getElementById("timeLabel").textContent=i18n("notificationTime");
	document.getElementById("labelRapidDeleting").textContent=i18n("rapidDeleting");
	document.getElementById("labelShowNotificationBar").textContent=i18n("showNotificationBar");
	document.getElementById("backup").value=i18n("backup");
}

function i18n(e,s1){
	return browser.i18n.getMessage(e,s1);
}
