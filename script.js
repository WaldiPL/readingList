(function(){
	list();
})();

function list(){
	browser.storage.local.get().then(result=>{
		document.getElementById("readinglist").classList.remove("deleting");
		document.getElementById("readinglist").innerHTML="";
		let pages=result.pages;
		let thumbs=result.thumbs;
		pages.forEach((value,i)=>{
			document.getElementById("readinglist").innerHTML+=`
			<div class="pages">
				<a href="${value.url}">
					<div class="boxThumb">
						<img class="thumb" src="${thumbs[i].base}"/>
						<img class="favicon" src="${value.favicon}"/>
					</div>
					<div class="box">
						<div class="title">${value.title}</div>
						<div class="url">${value.domain}</div>
					</div>
				</a>
			</div>
			<div class="delete"></div>`;
		});
	}).then(()=>{
		let elm=document.getElementsByClassName("delete");
		[...elm].forEach((value,i)=>{
			value.addEventListener("click",()=>{deleteLeter(i);});
			value.addEventListener("mouseover",()=>{hover(i);});
			value.addEventListener("mouseout",()=>{hover(i);});
		});
	});
}
function deleteLeter(id){
	document.getElementsByClassName("pages")[id].classList.toggle("deleting");
	document.getElementsByClassName("delete")[id].classList.toggle("deleting");
	document.getElementById("readinglist").classList.toggle("deleting");
	setTimeout(()=>{deletePage(id);},2000);
}

function deletePage(id){
	let deleting=document.getElementsByClassName("pages")[id].classList.contains("deleting");
	if(deleting){
		browser.storage.local.get().then(result=>{
			let pages=result.pages;
			let thumbs=result.thumbs;
			pages.splice(id,1);
			thumbs.splice(id,1);
			browser.storage.local.set({pages:pages,thumbs:thumbs});
		}).then(()=>{
			list();
			browser.runtime.sendMessage({"deleted":true,"id":id});
		});
	}
}

function hover(id){
	document.getElementsByClassName("pages")[id].classList.toggle("hover");
}

browser.runtime.onMessage.addListener(run);
function run(m){
	if(m.refreshList)list();
}
