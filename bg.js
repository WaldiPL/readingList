var urlList=[];

(function(){
	browser.storage.local.get().then(result=>{
		let pages = result.pages;
		if(!pages)browser.storage.local.set({pages:[],thumbs:[]});
		else{
			pages.forEach(value=>{
				urlList.push(value.url);
			});
		}
	});
})();

browser.runtime.onMessage.addListener(run);
function run(m){
	if(m.deleted){
		browser.tabs.query({
			url:urlList[m.id]
		}).then(tab=>{
			urlList.splice(m.id,1);
			if(tab[0]){
				setIcon(tab[0].id,tab[0].url);
			}
		});
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
		let pages = result.pages;
		let thumbs = result.thumbs;
		let page={
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
		const len=pages.length;
		pages.unshift(page);
		thumbs.unshift(thumb);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
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