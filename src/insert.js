"use strict";

(function(){
	const inserted=document.getElementById("__readingList");
	if(!inserted){
		let iframe=document.createElement("iframe"),
			css=document.createElement("link"),
			toolbar=document.createElement("div"),
			icon=document.createElement("div"),
			title=document.createElement("span"),
			button=document.createElement("button"),
			close=document.createElement("div"),
			closeX=document.createElement("div");

		iframe.id="__readingList";
		iframe.className="hidden";
		css.rel="stylesheet";
		css.href=browser.extension.getURL("")+"toolbar.css";
		toolbar.id="readinglistToolbar";
		icon.id="readinglistIcon";
		title.id="readinglistTitle";
		button.id="readinglistButton";
		close.id="readinglistClose";
		close.addEventListener("click",()=>{
			iframe.className="hidden";
		});
		close.title=browser.i18n.getMessage("close");
		closeX.id="readinglistCloseX";
		title.textContent=browser.i18n.getMessage("deleteTitle");
		button.textContent=browser.i18n.getMessage("delete");
		button.addEventListener("click",()=>{
			browser.runtime.sendMessage({fromContent:true});
		});
		toolbar.append(icon,title,button,close);
		close.appendChild(closeX);
		document.body.appendChild(iframe);

		iframe.onload=()=>{
			iframe.contentDocument.head.appendChild(css);
			iframe.contentDocument.body.appendChild(toolbar);
		};
		setTimeout(()=>{
			iframe.removeAttribute("class");
		},10000);
	}
})();
