(function(){
	list();
})();

function list(){
	browser.storage.local.get().then(result =>{
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
			<img class="delete" src="icons/trash.svg">`;
		});
	}).then(()=>{
		let elm=document.getElementsByClassName("delete");
		[...elm].forEach((value,i)=>{
			value.addEventListener("click",()=>{deletePage(i);});
		});
	});
}

function deletePage(id){
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

browser.runtime.onMessage.addListener(run);
function run(m){
  if(m.refreshList)list();
}