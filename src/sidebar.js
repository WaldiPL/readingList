(function(){
	list();
	document.getElementById("search").addEventListener("input",search);
	document.getElementById("search").placeholder=browser.i18n.getMessage("searchPlaceholer");
})();

function list(){
	browser.storage.local.get().then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs,
			settings=result.settings,
			container=document.getElementById("readinglist"),
			view=settings.view;
		document.documentElement.className=settings.theme;
		document.body.className=view;
		if(settings.showSearchBar)
			document.getElementById("searchbar").removeAttribute("class");
		else{
			document.getElementById("searchbar").className="none";
			document.getElementById("search").value="";
		}
		container.className="";
		container.textContent="";
		if(!pages.length){
			let emptyH2=document.createElement("h2");
				emptyH2.textContent=browser.i18n.getMessage("emptyH2");
			let emptyList=document.createElement("div");
				emptyList.id="emptyList";
				emptyList.textContent=browser.i18n.getMessage("emptyList");
			emptyList.insertBefore(emptyH2,emptyList.firstChild);
			container.appendChild(emptyList);
		}else{
			pages.forEach((value,i)=>{
				let ePages=document.createElement("div");
					ePages.className="pages";
				let eA=document.createElement("a");
					eA.href=value.url;
					eA.addEventListener("click",e=>{
						e.preventDefault();
						browser.tabs.update({
							url:value.url
						});
					});
				let eBox=document.createElement("div");
					eBox.className="box";
				let eTitle=document.createElement("div");
					eTitle.className="title";
					eTitle.textContent=value.title;
				let eDelete=document.createElement("div");
					eDelete.className="delete";
					eDelete.addEventListener("click",()=>{deleteLeter(i,settings.rapidDeleting);});
					eDelete.addEventListener("mouseover",()=>{hover(i);});
					eDelete.addEventListener("mouseout",()=>{hover(i);});
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
					eBox.appendChild(eTitle);
					eBox.appendChild(eUrl);
					eA.appendChild(eBox);
				}else if(view==="compact"){
					eA.appendChild(eFavicon);
					eA.appendChild(eTitle);
				}
				ePages.appendChild(eA);
				container.appendChild(ePages);
				container.appendChild(eDelete);
			});
		}
		search();
	});
}

var timeout1;
function deleteLeter(id,rapid){
	if(rapid){
		deletePage(id);
	}else{
		let pages=document.getElementsByClassName("pages")[id].classList;
		pages.toggle("deleting");
		document.getElementsByClassName("delete")[id].classList.toggle("deleting");
		document.getElementById("readinglist").classList.toggle("deleting");
		if(pages.contains("deleting")){
			timeout1=setTimeout(function(){deletePage(id);},2000);
		}else{
			clearTimeout(timeout1);
		}
	}
}

function deletePage(id){
	browser.storage.local.get().then(result=>{
		let pages=result.pages,
			thumbs=result.thumbs;
		pages.splice(id,1);
		thumbs.splice(id,1);
		browser.storage.local.set({pages:pages,thumbs:thumbs});
	}).then(()=>{
		list();
		browser.runtime.sendMessage({"deleted":true,"id":id});
	});
}

function hover(id){
	document.getElementsByClassName("pages")[id].classList.toggle("hover");
}

browser.runtime.onMessage.addListener(run);
function run(m){
	if(m.refreshList)list();
}

function search(){
	let q=document.getElementById("search").value.toLowerCase();
	let p=document.getElementsByClassName("pages");
	[...p].forEach(e=>{
		if(e.getElementsByClassName("title")[0].textContent.toLowerCase().includes(q)||(document.body.classList.contains("normal")&&e.getElementsByClassName("url")[0].textContent.toLowerCase().includes(q)))
			e.classList.remove("none");
		else
			e.classList.add("none");
	});
}
