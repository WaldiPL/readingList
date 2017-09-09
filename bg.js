browser.runtime.onInstalled.addListener(handleInstalled);
function handleInstalled(details){
	if(details.reason==="install"){
		browser.storage.local.get('pages').then(result=>{
			if(result.pages===undefined){
				browser.storage.local.set({pages:[],thumbs:[]});
			}
		});
	}
	if(details.reason==="install"||details.reason==="update"){
		browser.storage.local.get('settings').then(result=>{
			if(result.settings===undefined){
				browser.storage.local.set({settings:{
					"view":"normal",
					"theme":"light",
					"showNotification":true,
					"notificationTime":7000,
					"rapidDeleting":false,
					"showNotificationBar":true
				}});
			}
		});
	}
}

var urlList=[];

(function(){
	browser.storage.local.get().then(result=>{
		let pages=result.pages;
		if(pages){
			pages.forEach(value=>{
				urlList.push(value.url);
			});
		}
	});
})();

browser.runtime.onMessage.addListener(run);
function run(m,s){
	if(m.deleted){
		browser.tabs.query({
			url:urlList[m.id]
		}).then(tab=>{
			urlList.splice(m.id,1);
			if(tab[0]){
				setIcon(tab[0].id,tab[0].url);
			}
		});
	}else if(m.fromContent){
		remove(s.tab,onList(s.url));
	}
}

browser.tabs.onUpdated.addListener((tabId, changeInfo)=>{
	if(!changeInfo.url)return;
	setIcon(tabId,changeInfo.url);
});

browser.tabs.onActivated.addListener(activeInfo=>{
	browser.tabs.get(activeInfo.tabId).then(tab=>{
		setIcon(activeInfo.tabId,tab.url);
	});
});

function setIcon(tabId,url){
	const a=onList(url);
	browser.browserAction.setIcon({
		path:(a>=0)?"icons/btn.svg#d":"icons/btn.svg#a",
		tabId: tabId
	});
	browser.browserAction.setTitle({
		title:(a>=0)?browser.i18n.getMessage("deletePage"):browser.i18n.getMessage("extensionAction")
	});
	a>=0?insert(tabId,false):insert(tabId,true);
}

function onList(url){
	return urlList.indexOf(url);
}

browser.browserAction.onClicked.addListener(tab=>{
	const il=onList(tab.url);
	if(il>=0){
		remove(tab,il);
	}else{
		 browser.tabs.captureVisibleTab().then(e=>{
			resize(e,f=>{
				save(tab,f);
			});
		});
	}
});

browser.contextMenus.create({
	title:		browser.i18n.getMessage("addAll"),
	contexts:	["browser_action"],
	onclick:	()=>{addAll();}
});

browser.contextMenus.create({
	title:		browser.i18n.getMessage("options"),
	contexts:	["browser_action"],
	onclick:	()=>{browser.runtime.openOptionsPage();}
});

function remove(tab,il){
	browser.storage.local.get().then(result=>{
		let pages = result.pages;
		let thumbs = result.thumbs;
		pages.splice(il,1);
		thumbs.splice(il,1);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
	}).then(()=>{
		urlList.splice(il,1);
		setIcon(tab.id,tab.url);
		browser.runtime.sendMessage({"refreshList":true});
	});
}

function save(tab,base64){
	browser.storage.local.get().then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs,
			settings=result.settings,
			page={
				url:     tab.url,
				domain:  tab.url.split("/")[2],
				title:   tab.title,
				favicon: tab.favIconUrl?tab.favIconUrl:"icons/fav.png",
			};
		if(!page.domain)return;
		let thumb={
			base: base64
		};
		urlList.unshift(tab.url);
		setIcon(tab.id,tab.url)
		pages.unshift(page);
		thumbs.unshift(thumb);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
		if(settings.showNotification)notify("single",settings.notificationTime,tab);
	}).then(()=>{
		browser.runtime.sendMessage({"refreshList":true});
	});
}

function resize(src,callback){
	let img=new Image();
	img.onload = function() {
		let canvas = document.createElement('canvas');
		let ctx = canvas.getContext('2d');
		canvas.width = 64;
		canvas.height = 40;
		ctx.drawImage(this, -48, 0, 160, 90);
		let dataURL = canvas.toDataURL();
		callback(dataURL);
	};
	img.src = src;
}

function insert(tabId,del){
	browser.storage.local.get('settings').then(result=>{
		let settings=result.settings;
		if(settings.showNotificationBar){
			if(del){
				browser.tabs.executeScript(
					tabId,{
					code:`(function(){
						const toolbar=document.getElementById("readinglistToolbar");
						toolbar.className="hidden";
						setTimeout(()=>{toolbar.remove();},200);
					})();`
				});
			}else{
				browser.tabs.executeScript(
					tabId,{
					file:"/insert.js"
				});
				browser.tabs.insertCSS(
					tabId,{
					file:"/insert.css"
				});
			}
		}
	});
}

let tempE;
function addAll(){
	browser.tabs.query({currentWindow: true}).then(e=>{
		tempE=e;
		browser.storage.local.get().then(result=>{
			let pages=result.pages,
				thumbs=result.thumbs,
				settings=result.settings,
				page;
			tempE.forEach(tab=>{
				if(onList(tab.url)<0){
					page={
						url:     tab.url,
						domain:  tab.url.split("/")[2],
						title:   tab.title,
						favicon: tab.favIconUrl?tab.favIconUrl:"icons/fav.png"
					};
					if(!page.domain)return;
					let thumb={
						base: "icons/thumb.svg"
					};
					urlList.unshift(tab.url);
					setIcon(tab.id,tab.url)
					pages.unshift(page);
					thumbs.unshift(thumb);
				}
			});
			browser.storage.local.set({pages:pages,thumbs:thumbs});
			if(settings.showNotification)notify("all",settings.notificationTime);
		}).then(()=>{
			browser.runtime.sendMessage({"refreshList":true});
		});
	});
}

let clearNotify;
function notify(mode,time,tab){
	clearInterval(clearNotify);
	if(mode==="single"){
		browser.notifications.create("readingList",{
			"type": "basic",
			"iconUrl": tab.favIconUrl?tab.favIconUrl:"icons/fav.png",
			"title": browser.i18n.getMessage("added"),
			"message": tab.title
		});
	}else{
		browser.notifications.create("readingList",{
			"type": "basic",
			"iconUrl": "icons/icon.svg",
			"title":browser.i18n.getMessage("extensionName"),
			"message":browser.i18n.getMessage("addedAll")
		});
	}
	clearNotify=setTimeout(()=>{browser.notifications.clear("readingList");},time);
}
