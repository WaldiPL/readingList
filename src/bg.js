init();
let iconTheme,
	urlList=[],
	clearNotify,
	iconChanged,
	folderId,
	folderCreating,
	pageAction;

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
					"showNotificationBar":true,
					"showSearchBar":true,
					"addToContextMenu":true,
					"iconTheme":"dark",
					"showSort":true,
					"sort":"descDate",
					"changelog":true,
					"pageAction":false,
					"readerMode":0
				}});
			}else if(result.settings.showSearchBar===undefined){
				result.settings=Object.assign(result.settings,{
					"showSearchBar":true,
					"addToContextMenu":true,
					"iconTheme":"dark",
					"showSort":true,
					"sort":"descDate",
					"changelog":true,
					"pageAction":false,
					"readerMode":0
				});
				browser.storage.local.set({settings:result.settings});
			}else if(result.settings.showSort===undefined){
				result.settings=Object.assign(result.settings,{
					"showSort":true,
					"sort":"descDate",
					"changelog":true,
					"pageAction":false,
					"readerMode":0
				});
				browser.storage.local.set({settings:result.settings});
			}
		});
		if(!details.temporary&&result.settings.changelog!==false){
			browser.tabs.create({
				url:"index.html#changelog",
				active:true
			});
		}
	}
}

function init(){
	browser.storage.local.get(["pages","settings"]).then(result=>{
		if(result.settings){
			iconTheme=result.settings.iconTheme;
			pageAction=result.settings.pageAction;
			browser.browserAction.setIcon({
				path:`icons/btn.svg#${iconTheme}`
			}).then(()=>{iconChanged=true;});
			let pages=result.pages;
			if(pages){
				pages.forEach(value=>{
					urlList.push(value.url);
				});
			}
			showContext(result.settings.addToContextMenu);
			bookmarksFolder();
		}else
			setTimeout(init,100);
	});
}

browser.runtime.onMessage.addListener(run);
function run(m,s){
	if(m.deleted){
		bookmarksDelete(urlList[m.id]);
		browser.tabs.query({
			url:urlList[m.id].split("#")[0]
		}).then(tabs=>{
			urlList.splice(m.id,1);
			tabs.forEach(tab=>{
				setIcon(tab.id,tab.url);
			});
		});
		browser.tabs.query({
			active:true
		}).then(tabs=>{
			tabs.forEach(tab=>{
				setIcon(tab.id,tab.url);
			});
		});
	}else if(m.fromContent){
		remove(s.tab,onList(s.url));
	}else if(m.iconTheme){
		iconTheme=m.iconTheme;
		browser.browserAction.setIcon({
			path:`icons/btn.svg#${iconTheme}`
		}).then(()=>{
			browser.browserAction.setIcon({
				path:`icons/btn.svg#${iconTheme}`,
				tabId:s.tab.id
			});
		});
		browser.pageAction.setIcon({
			path:`icons/btn.svg#${iconTheme}`,
			tabId:s.tab.id
		});
	}else if(m.addToContextMenu!=undefined){
		showContext(m.addToContextMenu);
	}else if(m.sync){
		bookmarksFolder();
	}else if(m.updateThumb){
		updateThumb(m.id,m.url,m.tab2);
	}else if(m.restoredBackup){
		urlList=[];
		browser.storage.local.get("pages").then(result=>{
			let pages=result.pages;
			if(pages){
				pages.forEach(value=>{
					urlList.push(value.url);
				});
			}
			browser.bookmarks.getChildren(folderId).then(bookmarks=>{
				let folderList=[];
				bookmarks.forEach(v=>{
					if(urlList.indexOf(v.url)<0){
						browser.bookmarks.remove(v.id);
					}
					folderList.unshift(v.url);
				});
				urlList.forEach((v,i)=>{
					if(folderList.indexOf(v)<0){
						bookmarksAdd({"url":v,"title":pages[i].title});
					}
				});
			});
			browser.runtime.sendMessage({"refreshList":true});
		});
	}else if(m.pageAction){
		pageAction=m.show;
	}else if(m.updateReader){
		updateReader(m.id,m.tabId,m.url);
	}
}

browser.tabs.onUpdated.addListener((tabId, changeInfo)=>{
	if(!changeInfo.url)return;
	setIcon(tabId,changeInfo.url);
	if(pageAction)browser.pageAction.show(tabId);
	else browser.pageAction.hide(tabId);
});

browser.tabs.onActivated.addListener(activeInfo=>{
	browser.tabs.get(activeInfo.tabId).then(tab=>{
		setIcon(activeInfo.tabId,tab.url);
		if(pageAction)browser.pageAction.show(activeInfo.tabId);
		else browser.pageAction.hide(activeInfo.tabId);
	});
});

function setIcon(tabId,url){
	if(iconTheme&&iconChanged){
		const a=onList(url);
		browser.browserAction.setIcon({
			path:(a>=0)?`icons/btn.svg#${iconTheme}D`:`icons/btn.svg#${iconTheme}`,
			tabId: tabId
		});
		browser.browserAction.setTitle({
			title:(a>=0)?browser.i18n.getMessage("deletePage"):browser.i18n.getMessage("extensionAction"),
			tabId:tabId
		});
		browser.pageAction.setIcon({
			path:(a>=0)?`icons/btn.svg#${iconTheme}D`:`icons/btn.svg#${iconTheme}`,
			tabId:tabId
		});
		browser.pageAction.setTitle({
			title:(a>=0)?browser.i18n.getMessage("deletePage"):browser.i18n.getMessage("extensionAction"),
			tabId:tabId
		});
		a>=0?insert(tabId,false):insert(tabId,true);
	}else
		setTimeout(()=>{setIcon(tabId,url)},200);
}

function onList(url){
	return urlList.indexOf(getURL(url));
}

function onClicked(tab){
	const il=onList(tab.url);
	if(il>=0){
		remove(tab,il);
	}else{
		 browser.tabs.captureVisibleTab().then(thumb=>{
			resize(thumb,tab.favIconUrl,(thumb64,favicon64)=>{
				save(tab,thumb64,favicon64);
			});
		});
	}
}

browser.browserAction.onClicked.addListener(onClicked);
browser.pageAction.onClicked.addListener(onClicked);

browser.contextMenus.create({
	title:		browser.i18n.getMessage("addAll"),
	contexts:	["browser_action","page_action"],
	onclick:	()=>{addAll();}
});

browser.contextMenus.create({
	title:		browser.i18n.getMessage("options"),
	contexts:	["browser_action","page_action"],
	onclick:	()=>{browser.runtime.openOptionsPage();}
});

browser.runtime.getBrowserInfo().then(e=>{
	let version=+e.version.substr(0,2);
	if(version>=57){
		browser.contextMenus.create({
			id:			"showRL",
			title:		browser.i18n.getMessage("showRL"),
			contexts:	["browser_action","page_action"],
		});
		browser.contextMenus.onClicked.addListener(info=>{
			if(info.menuItemId==="showRL")browser.sidebarAction.open();
		});
	}
});

function remove(tab,il){
	browser.storage.local.get(["pages","thumbs"]).then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs;
		pages.splice(il,1);
		thumbs.splice(il,1);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
	}).then(()=>{
		bookmarksDelete(getURL(tab.url));
		urlList.splice(il,1);
		setIcon(tab.id,tab.url);
		browser.runtime.sendMessage({"refreshList":true});
	});
}

function save(tab,thumb64,favicon64){
	browser.storage.local.get().then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs,
			settings=result.settings,
			url=getURL(tab.url),
			page={
				url:     url,
				domain:  url.split("/")[2],
				title:   tab.title,
				favicon: favicon64,
				reader:  tab.isArticle||tab.isInReaderMode
			};
		if(!page.domain)return;
		let thumb={
			base: thumb64
		};
		urlList.unshift(url);
		setIcon(tab.id,url);
		pages.unshift(page);
		thumbs.unshift(thumb);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
		bookmarksAdd(tab);
		if(settings.showNotification)notify("single",settings.notificationTime,tab);
	}).then(()=>{
		browser.runtime.sendMessage({"refreshList":true});
	});
}

function resize(srcThumb,srcFavicon,callback){
	let thumb=new Image(),
		favicon=new Image(),
		thumb64="icons/thumb.svg",
		favicon64="icons/fav.png",
		imgLoaded=0;
	thumb.onload=()=>{
		let canvas=document.createElement('canvas'),
			ctx=canvas.getContext('2d');
		canvas.width=64;
		canvas.height=40;
		ctx.drawImage(thumb,-30,0,190,97);
		thumb64=canvas.toDataURL();
		imgLoaded++;
		if(imgLoaded===2)callback(thumb64,favicon64);
	};
	favicon.onload=()=>{
		let canvas=document.createElement('canvas'),
			ctx=canvas.getContext('2d');
		canvas.width=16;
		canvas.height=16;
		ctx.drawImage(favicon,0,0,16,16);
		favicon64=canvas.toDataURL();
		imgLoaded++;
		if(imgLoaded===2)callback(thumb64,favicon64);
	};
	thumb.onerror=()=>{
		imgLoaded++;
		if(imgLoaded===2)callback(thumb64,favicon64);
	}
	favicon.onerror=()=>{
		imgLoaded++;
		if(imgLoaded===2)callback(thumb64,favicon64);
	}
	thumb.src=srcThumb;
	favicon.src=srcFavicon;
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
					let url=getURL(tab.url);
					page={
						url:     url,
						domain:  url.split("/")[2],
						title:   tab.title,
						favicon: tab.favIconUrl?tab.favIconUrl:"icons/fav.png",
						reader:  tab.isArticle||tab.isInReaderMode
					};
					if(!page.domain)return;
					let thumb={
						base: "icons/thumb.svg"
					};
					urlList.unshift(url);
					setIcon(tab.id,url)
					pages.unshift(page);
					thumbs.unshift(thumb);
					bookmarksAdd(tab);
				}
			});
			browser.storage.local.set({pages:pages,thumbs:thumbs});
			if(settings.showNotification)notify("all",settings.notificationTime);
		}).then(()=>{
			browser.runtime.sendMessage({"refreshList":true});
		});
	});
}

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

function showContext(e){
	if(e){
		browser.contextMenus.create({
			id:			"addToReadingList",
			title:		browser.i18n.getMessage("extensionAction"),
			contexts:	["page","tab"],
			onclick:	contextAdd
		});
	}else
		browser.contextMenus.remove("addToReadingList");
}

async function contextAdd(e){
	const url=getURL(e.pageUrl);
	let tabs=await browser.tabs.query({
		url:url.split("#")[0],
		currentWindow:true
	});
	if(!tabs.length){
		tabs=await browser.tabs.query({
			currentWindow:true
		});
		tabs=tabs.filter(v=>{
			return v.url===e.pageUrl;
		})
	}
	const tab=tabs[0],
		  il=onList(url);
	if(il>=0){
		browser.storage.local.get("settings").then(result=>{
			if(result.settings.showNotification)notify("single",result.settings.notificationTime,tab);
		});
	}else{
		if(tab.active){
			browser.tabs.captureVisibleTab().then(thumb=>{
				resize(thumb,tab.favIconUrl,(thumb64,favicon64)=>{
					save(tab,thumb64,favicon64);
				});
			});
		}else{
			browser.runtime.getBrowserInfo().then(e=>{
				let version=+e.version.substr(0,2);
				if(version>=59){
					browser.tabs.captureTab(tab.id).then(thumb=>{
						resize(thumb,tab.favIconUrl,(thumb64,favicon64)=>{
							save(tab,thumb64,favicon64);
						});
					});
				}else{
					resize("",tab.favIconUrl,(thumb64,favicon64)=>{
						save(tab,"icons/thumb.svg",favicon64);
					});
				}
			});
		}
	}
}

function bookmarksFolder(){
	browser.storage.local.get("bookmarks").then(result=>{
		browser.bookmarks.search({
			title:browser.i18n.getMessage("folderName")
		}).then(search=>{
			if(search.length){
				if(result.bookmarks===undefined||result.bookmarks.folderId!==search[0].id){
					folderId=search[0].id;
					browser.storage.local.set({bookmarks:{
						folderId:folderId
					}});
				}else
					folderId=result.bookmarks.folderId;
				bookmarksSync();
			}else{
				browser.bookmarks.create({
					title:browser.i18n.getMessage("folderName"),
					type:"folder",
					index:0
				}).then(folder=>{
					folderId=folder.id;
					browser.storage.local.set({bookmarks:{
						folderId:folderId
					}});
					bookmarksSync(true);
				});
			}
		});
	});
}

function bookmarksSync(created){
	if(created){
		folderCreating=true;
		browser.storage.local.get("pages").then(result=>{
			let pages=result.pages;
			pages.forEach(v=>{
				browser.bookmarks.create({
					url:v.url,
					title:v.title,
					parentId:folderId
				});
			});
			setTimeout(()=>{folderCreating=false;},2000);
		});
	}else if(!folderCreating){
		browser.bookmarks.getChildren(folderId).then(bookmarks=>{
			let folderList=[],
				addUrls=[],
				deleteUrls=[];
			bookmarks.forEach(v=>{
				if(urlList.indexOf(v.url)<0){
					addUrls.push({url:v.url,title:v.title});
				}
				folderList.unshift(v.url);
			});
			urlList.forEach((v,i)=>{
				if(folderList.indexOf(v)<0){
					deleteUrls.unshift({url:v,id:i});
				}
			});
			syncFolderList(deleteUrls,addUrls);
		});
	}
}

function bookmarksDelete(url){
	browser.bookmarks.search({url:url}).then(bookmarks=>{
		bookmarks.forEach(v=>{
		  if(v.parentId===folderId)browser.bookmarks.remove(v.id);
		});
	});
}

function bookmarksAdd(tab){
	browser.bookmarks.create({
		parentId:folderId,
		title:tab.title,
		url:getURL(tab.url)
	});
}

function syncFolderList(deleteUrls,addUrls){
	browser.storage.local.get(["pages","thumbs"]).then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs;
		deleteUrls.forEach(v=>{
			pages.splice(v.id,1);
			thumbs.splice(v.id,1);
			urlList.splice(v.id,1);
		});
		addUrls.forEach(v=>{
			let page={
					url:     v.url,
					domain:  v.url.split("/")[2],
					title:   v.title,
					favicon: "https://www.google.com/s2/favicons?domain="+v.url
				};
			urlList.unshift(v.url);
			pages.unshift(page);
			thumbs.unshift({base:"icons/thumb.svg"});
		});
		browser.storage.local.set({pages:pages,thumbs:thumbs});
	}).then(()=>{
		deleteUrls.forEach(v=>{
			browser.tabs.query({url:v.url}).then(tab=>{
				if(tab[0])setIcon(tab[0].id,tab[0].url);
			});
		});
		addUrls.forEach(v=>{
			browser.tabs.query({url:v.url}).then(tab=>{
				if(tab[0])setIcon(tab[0].id,tab[0].url);
			});
		});
		browser.tabs.query({active:true}).then(tabs=>{
			tabs.forEach(tab=>{
				setIcon(tab.id,tab.url);
			});
		});
		if(deleteUrls.length||addUrls.length)browser.runtime.sendMessage({"refreshList":true});
	});
}

function updateThumb(id,url,tab2,i=0){
	browser.tabs.query({url:url.split("#")[0]}).then(tabs=>{
		let tab=tabs[0]||tab2;
		if(!tab&&i>5){
			return;
		}else if((!tab||tab.status!=="complete")||(tab2&&i<5)){
			setTimeout(()=>{updateThumb(id,url,tab2,i+1);},500);
			return;
		}else if(tab.active){
			browser.tabs.captureVisibleTab().then(thumb=>{
				resize(thumb,tab.favIconUrl,(thumb64,favicon64)=>{
					browser.storage.local.get(["pages","thumbs"]).then(result=>{
						let pages=result.pages,
							thumbs=result.thumbs;
						pages[id].favicon=favicon64;
						thumbs[id].base=thumb64;
						browser.storage.local.set({pages:pages,thumbs:thumbs});
					}).then(()=>{
						browser.runtime.sendMessage({"refreshList":true});
					});
				});
			});
		}else{
			browser.runtime.getBrowserInfo().then(e=>{
				let version=+e.version.substr(0,2);
				if(version>=59){
					browser.tabs.captureTab(tab.id).then(thumb=>{
						resize(thumb,tab.favIconUrl,(thumb64,favicon64)=>{
							browser.storage.local.get(["pages","thumbs"]).then(result=>{
								let pages=result.pages,
									thumbs=result.thumbs;
								pages[id].favicon=favicon64;
								thumbs[id].base=thumb64;
								browser.storage.local.set({pages:pages,thumbs:thumbs});
							}).then(()=>{
								browser.runtime.sendMessage({"refreshList":true});
							});
						});
					});
				}else{
					browser.storage.local.get("pages").then(result=>{
						let pages=result.pages;
						pages[id].favicon=tab.favIconUrl;
						browser.storage.local.set({pages:pages});
					}).then(()=>{
						browser.runtime.sendMessage({"refreshList":true});
					});
				}
			});
		}
	});
}

const failedReaderTitle=browser.i18n.getMessage("failedReaderTitle");	
	
async function updateReader(id,tabId,url,i=0){
	let tab;
	if(tabId!==undefined){
		tab=await browser.tabs.get(tabId);
	}else{
		let tabs=await browser.tabs.query({url:url.split("#")[0]});
		tab=tabs[0];
		if(tab)tabId=tab.id;
	}
	if(tab&&tab.status==="complete"&&tab.isArticle!==undefined&&tab.isInReaderMode!==undefined&&!tab.title.startsWith("about:reader")){
		const failedReader=tab.title===failedReaderTitle;
		browser.storage.local.get(["pages"]).then(result=>{
			let pages=result.pages;
			pages[id].reader=tab.isArticle||(tab.isInReaderMode&&!failedReader);
			browser.storage.local.set({pages:pages});
		}).then(()=>{
			browser.runtime.sendMessage({"refreshList":true});
		});
	}else if(i<5){
		setTimeout(()=>{updateReader(id,tabId,url,i+1);},800);
	}
}

function getURL(url){
	if(url.charAt(0)==="a")url=decodeURIComponent(url.substr(17));
	return url;
}
