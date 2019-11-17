"use strict";

(function(){
	list(true);
	translate();
	document.getElementById("search").addEventListener("input",search);
	document.getElementById("sort").addEventListener("click",()=>{
		document.getElementById("sort").classList.toggle("active");
		document.getElementById("popupSort").classList.toggle("hidden");
	});
	let sortPopup=document.getElementById("popupSort").children;
		sortPopup[0].addEventListener("click",()=>{sortList("descDate");});
		sortPopup[1].addEventListener("click",()=>{sortList("ascDate");});
		sortPopup[2].addEventListener("click",()=>{sortList("az");});
		sortPopup[3].addEventListener("click",()=>{sortList("za");});
	document.addEventListener("selectstart",e=>{if(!(e.target.type==="search"))e.preventDefault();});
	document.addEventListener("click",e=>{
		if(e.target.id!=="sort"&&e.target.parentElement.id!=="popupSort"){
			document.getElementById("sort").classList.remove("active");
			document.getElementById("popupSort").classList.add("hidden");
		}
	});
	document.addEventListener("blur",()=>{
		document.getElementById("sort").classList.remove("active");
		document.getElementById("popupSort").className="hidden";
	});
	document.getElementById("clear").addEventListener("click",()=>{
		document.getElementById("search").value="";
		search();
	});
	document.getElementById("editSave").addEventListener("click",saveTitle);
	document.getElementById("editClose").addEventListener("click",closeEdit);
})();

function list(sync){
	browser.storage.local.get(["pages","thumbs","settings"]).then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs,
			settings=result.settings,
			container=document.getElementById("readinglist"),
			view=settings.view;
		document.documentElement.className=settings.theme;
		document.body.className=view;
		if(settings.showSearchBar){
			document.getElementById("searchbar").removeAttribute("class");
		}else{
			document.getElementById("searchbar").className="none";
			document.getElementById("search").value="";
		}
		if(settings.showSort)
			document.getElementById("sort").classList.remove("none");
		else
			document.getElementById("sort").classList.add("none");
		container.className="";
		container.textContent="";
		if(!pages.length){
			let emptyH2=document.createElement("h2");
				emptyH2.textContent=i18n("emptyH2");
			let emptyList=document.createElement("div");
				emptyList.id="emptyList";
				emptyList.textContent=i18n("emptyList");
			emptyList.insertBefore(emptyH2,emptyList.firstChild);
			container.appendChild(emptyList);
		}else{
			pages.forEach((value,i)=>{
				let pageContainer=document.createElement("div");
					pageContainer.id="page"+i;
				let eA=document.createElement("a");
					eA.className="pages";
					if((settings.readerMode==1&&value.reader===true)||(settings.readerMode==2&&value.reader===true)||settings.readerMode==3){
						eA.href=value.url;
						if(value.reader)eA.className="pages readerMode";

						eA.addEventListener("mouseup",e=>{
							if(e.button===1){
								eA.removeAttribute("href");
								setTimeout(()=>{eA.href=value.url;},300);
							}
						});

						eA.addEventListener("auxclick",e=>{
							e.preventDefault();
							if(e.button===1){
								browser.tabs.query({currentWindow:true,active:true}).then(tabs=>{
									browser.tabs.create({
										url:value.url,
										active:false,
										openInReaderMode:true,
										index:tabs[0].index+1
									}).then(tab=>{
										if(!settings.deleteOpened){
											if(thumbs[i].base==="icons/thumb.svg")
												browser.runtime.sendMessage({"updateThumb":true,"id":i,"url":value.url,"tab2":tab});
											if(value.reader===undefined)
												browser.runtime.sendMessage({"updateReader":true,"id":i,"tabId":tab.id});
										}
									});
								});
							}
						});
						eA.addEventListener("click",e=>{
							e.preventDefault();
							if(e.ctrlKey){
								browser.tabs.create({
									url:value.url,
									active:false,
									openInReaderMode:true
								}).then(tab=>{
									if(!settings.deleteOpened){
										if(thumbs[i].base==="icons/thumb.svg")
											browser.runtime.sendMessage({"updateThumb":true,"id":i,"url":value.url,"tab2":tab});
										if(value.reader===undefined)
											browser.runtime.sendMessage({"updateReader":true,"id":i,"tabId":tab.id});
									}
								});
							}else{
								browser.tabs.query({currentWindow:true,active:true}).then(tabs=>{
									const tab=tabs[0];
									browser.tabs.create({
										url:value.url,
										active:true,
										openInReaderMode:true,
										index:tab.index
									}).then(tab=>{
										if(!settings.deleteOpened){
											if(thumbs[i].base==="icons/thumb.svg")
												browser.runtime.sendMessage({"updateThumb":true,"id":i,"url":value.url,"tab2":tab});
											if(value.reader===undefined)
												browser.runtime.sendMessage({"updateReader":true,"id":i,"tabId":tab.id});
										}
									});
									browser.tabs.remove(tab.id);
								});	
							}
						});
					}else{
						eA.href=value.url;
						eA.addEventListener("click",e=>{
							if(!e.ctrlKey){
								e.preventDefault();
								browser.tabs.update({
									url:value.url
								});
							}
						});
						if(!settings.deleteOpened){
							if(thumbs[i].base==="icons/thumb.svg"){
								eA.addEventListener("click",()=>{
									browser.runtime.sendMessage({"updateThumb":true,"id":i,"url":value.url});
								});
								eA.addEventListener("mouseup",e=>{
									if(e.button===1)
										browser.runtime.sendMessage({"updateThumb":true,"id":i,"url":value.url});
								});
							}
							if(value.reader===undefined){
								eA.addEventListener("click",()=>{
									browser.runtime.sendMessage({"updateReader":true,"id":i,"url":value.url});
								});
								eA.addEventListener("mouseup",e=>{
									if(e.button===1)
										browser.runtime.sendMessage({"updateReader":true,"id":i,"url":value.url});
								});
							}
						}
					}
					if(settings.deleteOpened){
						eA.addEventListener("click",()=>{
							deletePage(i);
						});
						eA.addEventListener("auxclick",e=>{
							if(e.button===1){
								deletePage(i);
							}
						});
					}

				let eTitle=document.createElement("div");
					eTitle.className="title";
					eTitle.textContent=value.title;
				let eDelete=document.createElement("div");
					eDelete.className="delete";
					eDelete.title=i18n("delete");
					eDelete.addEventListener("click",()=>{deleteLeter(i,settings.rapidDeleting);});
				let eEdit=document.createElement("div");
					eEdit.className="edit";
					eEdit.title=i18n("rename");
					eEdit.addEventListener("click",e=>{editTitle(e,i);});
				let eFavicon=document.createElement("img");
					eFavicon.src=value.favicon;
					eFavicon.className="favicon";
				if(view==="normal"){
					let eBoxThumb=document.createElement("div");
						eBoxThumb.className="boxThumb";
					let eThumb=document.createElement("img");
						eThumb.className="thumb";
						eThumb.src=thumbs[i].base;
					let eUrl=document.createElement("div");
						eUrl.className="url";
						eUrl.textContent=value.domain;
					eA.appendChild(eBoxThumb);
					eBoxThumb.appendChild(eThumb);
					eBoxThumb.appendChild(eFavicon);
					eA.appendChild(eTitle);
					eA.appendChild(eUrl);
				}else if(view==="compact"){
					eA.appendChild(eFavicon);
					eA.appendChild(eTitle);
				}else if(view==="medium"){
					let eUrl=document.createElement("div");
						eUrl.className="url";
						eUrl.textContent=value.domain;
					eA.appendChild(eFavicon);
					eA.appendChild(eTitle);
					eA.appendChild(eUrl);
				}
				let buttons=document.createElement("div");
					buttons.className="buttons";
				pageContainer.appendChild(eA);
				buttons.appendChild(eEdit);
				buttons.appendChild(eDelete);
				pageContainer.appendChild(buttons);
				container.appendChild(pageContainer);
			});
			let firstFavicon=document.getElementById("page0").getElementsByClassName("favicon")[0].src;
			if(!firstFavicon.startsWith("data:image"))convertFavicons();
			sortList(settings.sort,true);
		}
		search();
		closeEdit();
		if(sync)browser.runtime.sendMessage({"sync":true});
	});
}

function editTitle(e,id){
	const scrollTop=document.getElementById("readinglist").scrollTop;
	const input=document.getElementById("editInput");
		input.value=document.getElementById("page"+id).getElementsByClassName("title")[0].textContent;
	const container=document.getElementById("editContainer");
		container.style.top=e.target.parentElement.offsetTop-scrollTop+"px";
	const save=document.getElementById("editSave");
		save.dataset.id=id;
	document.getElementById("editOverlay").className="";
	input.focus();
}

function saveTitle(e){
	const id=e.target.dataset.id;
	const newTitle=document.getElementById("editInput").value;
	browser.storage.local.get("pages").then(result=>{
		const pages=result.pages;
		Object.assign(pages[id],{title:newTitle});
		browser.storage.local.set({pages}).then(()=>{
			document.getElementById("page"+id).getElementsByClassName("title")[0].textContent=newTitle;
			browser.runtime.sendMessage({"refreshList":true});
			browser.runtime.sendMessage({"updateBookmarkTitle":true,"url":pages[id].url,"title":newTitle});
			sortList(document.getElementById("readinglist").dataset.sort,true);
			closeEdit();
		});
	});
}

function closeEdit(){
	document.getElementById("editOverlay").className="hidden";
	document.getElementById("editInput").value=" ";
}

function sortList(mode="descDate",auto){
	let rl=document.getElementById("readinglist"),
		btnSort=document.getElementById("popupSort").children;
	document.getElementById("sort").classList.remove("active");
	document.getElementById("popupSort").className="hidden";
	if(rl.dataset.sort===mode&&!auto)return;
	if(!auto){
		browser.storage.local.get("settings").then(result=>{
			let s=result.settings;
			Object.assign(s,{sort:mode});
			browser.storage.local.set({settings:s});
		});
	}
	[...btnSort].forEach(v=>{
		v.removeAttribute("class");
	});
	if(mode==="descDate"){
		btnSort[0].className="checked";
		if(rl.dataset.sort){
			let frag=document.createDocumentFragment();
			for(let i=0,len=rl.childElementCount;i<len;i++){
				frag.appendChild(document.getElementById("page"+i));
			}
			rl.appendChild(frag);
		}
		rl.dataset.sort="descDate";
	}else if(mode==="ascDate"){
		btnSort[1].className="checked";
		let frag=document.createDocumentFragment();
		for(let i=rl.childElementCount-1;i>=0;i--){
			frag.appendChild(document.getElementById("page"+i));
		}
		rl.appendChild(frag);
		rl.dataset.sort="ascDate";
	}else if(mode==="az"){
		btnSort[2].className="checked";
		let arrTitles=[],
			titles=document.getElementsByClassName("title"),
			frag=document.createDocumentFragment();
		[...titles].forEach(v=>{
			arrTitles.push(v.textContent.toLowerCase());
		});
		arrTitles.sort();
		let arrId=[];
		[...titles].forEach(v=>{
			let index=arrTitles.indexOf(v.textContent.toLowerCase());
			arrTitles[index]=null;
			arrId[index]=v.parentElement.parentElement.id;
		});
		arrId.forEach(v=>{
			frag.appendChild(document.getElementById(v));
		});
		rl.appendChild(frag);
		rl.dataset.sort="az";
	}else if(mode==="za"){
		btnSort[3].className="checked";
		let arrTitles=[],
			titles=document.getElementsByClassName("title"),
			frag=document.createDocumentFragment();
		[...titles].forEach(v=>{
			arrTitles.push(v.textContent.toLowerCase());
		});
		arrTitles.sort();
		arrTitles.reverse();
		let arrId=[];
		[...titles].forEach(v=>{
			let index=arrTitles.indexOf(v.textContent.toLowerCase());
			arrTitles[index]=null;
			arrId[index]=v.parentElement.parentElement.id;
		});
		arrId.forEach(v=>{
			frag.appendChild(document.getElementById(v));
		});
		rl.appendChild(frag);
		rl.dataset.sort="za";
	}
}

var timeout1;
function deleteLeter(id,rapid){
	if(rapid){
		deletePage(id);
	}else{
		let pages=document.getElementById("page"+id).getElementsByClassName("pages")[0].classList;
		pages.toggle("deleting");
		document.getElementById("page"+id).getElementsByClassName("buttons")[0].classList.toggle("deleting");
		document.getElementById("readinglist").classList.toggle("deleting");
		if(pages.contains("deleting")){
			timeout1=setTimeout(function(){deletePage(id);},2000);
		}else{
			clearTimeout(timeout1);
		}
	}
}

function deletePage(id){
	browser.storage.local.get(["pages","thumbs"]).then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs;
		pages.splice(id,1);
		thumbs.splice(id,1);
		browser.storage.local.set({pages:pages,thumbs:thumbs}).then(()=>{
			list();
			browser.runtime.sendMessage({"deleted":true,"id":id});
		});
	});
}

browser.runtime.onMessage.addListener(run);
function run(m){
	if(m.refreshList)list();
}

function search(){
	let q=document.getElementById("search").value.toLowerCase();
	let p=document.getElementsByClassName("pages");
	[...p].forEach(e=>{
		if(e.getElementsByClassName("title")[0].textContent.toLowerCase().includes(q)||e.href.toLowerCase().includes(q))
			e.parentElement.classList.remove("none");
		else
			e.parentElement.classList.add("none");
	});
	const hiddenPages=document.getElementById("readinglist").getElementsByClassName("none").length;
	document.getElementById("readinglist").dataset.notfound=(p.length===hiddenPages&&hiddenPages>0)?i18n("notfound"):"false";
}

function i18n(e,s1){
	return browser.i18n.getMessage(e,s1);
}

function translate(){
	document.getElementById("search").placeholder=i18n("searchPlaceholer");
	document.getElementById("sort").title=i18n("sort");
	let sortPopup=document.getElementById("popupSort").children;
		sortPopup[0].textContent=i18n("descDate");
		sortPopup[1].textContent=i18n("ascDate");
		sortPopup[2].textContent=i18n("az");
		sortPopup[3].textContent=i18n("za");
	document.title=i18n("extensionName");
	document.getElementById("editInput").placeholder=i18n("pageTitle");
	document.getElementById("editSave").textContent=i18n("save");
}

function convertFavicons(){
	browser.storage.local.get(["pages","settings"]).then(result=>{
		let pages=result.pages;
		const settings=result.settings;
		const mode=settings.faviconService;
		for(let i=0;i<pages.length;i++){
			if(pages[i].favicon.startsWith("http")){
				favicon64(pages[i].favicon,mode).then(fav=>{
					document.getElementById("page"+i).getElementsByClassName("favicon")[0].src=fav.icon;
					Object.assign(pages[i],{favicon:fav.icon});
					if(fav.count===pages.length){
						browser.storage.local.set({pages:pages});
					}
				});
			}else{
				faviconCount++;
				if(faviconCount===pages.length){
					browser.storage.local.set({pages:pages});
				}
			}
		}
	});
}

let faviconCount=0;
function favicon64(url,mode){
	return new Promise((resolve,reject)=>{
		let img=new Image();
		img.onload=e=>{
			faviconCount++;
			let canvas=document.createElement("canvas"),
				ctx=canvas.getContext("2d");
			canvas.width=16;
			canvas.height=16;
			ctx.drawImage(e.target,0,0,16,16);
			let dataURL=canvas.toDataURL();
			if(dataURL==="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACD0lEQVQ4ja2TwWvacBTHe+0f4an/i9CTM530VM3sZY3LRCpSawaVbNXDdh47VGy9JDKCNNBEaVqQgBsNZTskCAFJhHZQAyHQ0kMN3x1KftPWnbYH7/R73w/vvd/3LS39r0gV2svxRCPG8QpVfCdrm2/bQYo+ClP0UZhl20GRk7Uyr1DxRCOWKrSXn4lX15sr+Z1OPZsTrf2Pp15LusSBeIGWdAndcLFX63kZRrDypU59db25MgeJJxqxfKlT32S/jj996UNSTXT7Nib+PZyrAABwfXOHbt8GzQhjttSpxxONGAGUeYXKMIKlGy4k1YSkmpC1IWRtSADTEDgbjHA+GCHNCFaZVygCKHKytlfredMQBBBlcPsAAAhuHyCpJn5Yv8B96Hrb3LFGAFm2HeiGS4qeiqMOTHsCSTWhGy7onBgQwMvMYWg7PgCg27dh2pM5cRRngxEk1YTt+FjbaIZzgOubO9JqtMBFAFkbwnZ8ULOAV2/EQDfcuWLdcElGcACY+PfQDRcZRvgzQpGTtWqt580Cnu7j+88r8rZTPfEKlZklVt4ryegb/waQVBPT8LGz9JZgVapK8pmRaEYYz0Jsxydi2/Efxa8XGCmyMlvq1NOMYO3yiqcbLs4HIxyIF/jc+oZdXvXSW4LFLrLy7DFVqkpymzvW6JwYrKUPQ2qjGWYYIdiuyKfcfvfFwmP6l/gNHYU5BdT5NkIAAAAASUVORK5CYII="||
			   dataURL==="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAUklEQVQ4jWNgwAKmTp26ferUqYfQ8HZsaonRSJxBRGhEweTYjNsl+Gwh6ApcthPpve2EbSDkSlICi/4GEOsFygKR4mikSkKiOCmT6BKycyVWjQAj+9YckubstwAAAABJRU5ErkJggg=="||
			   dataURL==="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEklEQVQ4jWNgGAWjYBSMAggAAAQQAAF/TXiOAAAAAElFTkSuQmCC"){
			dataURL="icons/fav.png";
			}
			resolve({icon:dataURL,count:faviconCount});
		};
		
		img.onerror=()=>{
			faviconCount++;
			resolve({icon:"icons/fav.png",count:faviconCount});
		};
		
		switch(mode){
		case "google":
			img.src=`https://www.google.com/s2/favicons?domain=${url.split("://")[1]}`;
			break;
		case "duckduckgo":
			img.src=`https://proxy.duckduckgo.com/ip3/${url.split("://")[1]}`;
			break;
		default:
			img.src=url;
		}
	});
}
