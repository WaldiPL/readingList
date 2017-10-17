let changelog=`[
	{"version":"1.3.3",
		"changes":["Changed shortcut for macOS (Alt+R)","Minor changes"],
		"changesPL":["Zmieniono skrót klawiaturowy dla macOS (Alt+R)","Drobne zmiany"]
	},
	{"version":"1.3.0",
		"changes":["Reorganized options","Added 'Changelog' and 'Support'","Fixed bug #8","Minor changes"],
		"changesPL":["Przeorganizowano opcje","Dodano 'Historię zmian' oraz 'Wsparcie'","Naprawiono błąd #8","Drobne zmiany"]
	},
	{"version":"1.2.9",
		"changes":["Added information if the Reading List is empty","Minor changes"],
		"changesPL":["Dodano infromację jeśli Czytelnia jest pusta","Drobne zmiany"]
	},
	{"version":"1.2.8",
		"changes":["Fixed bug"],
		"changesPL":["Naprawiono błąd"]
	},
	{"version":"1.2.7",
		"changes":["Added white and black button icon"],
		"changesPL":["Dodano białą i czarną ikonę przycisku"]
	},
	{"version":"1.2.6",
		"changes":["Added search bar","Added item to context menu","Updated button icon","Added icon for dark themes","Fixed bugs","Minor changes"],
		"changesPL":["Dodano pasek wyszukiwania","Dodano element do menu kontekstowego","Zaktualizowano ikonę przycisku","Dodano ikonę dla ciemnego motywu","Naprawiono błędy","Drobne zmiany"]
	},
	{"version":"1.2.5",
		"changes":["Added options","Added ability to add all tabs to the Reading List #5","Added notification #3","Added dark theme and updated light theme","Added compact view","Fixed bugs","Minor changes"],
		"changesPL":["Dodano opcje","Dodano możliwość dodania wszystkich kart do Czytelni #5","Dodano powiadomienie #3","Dodano ciemny motyw i zaktualizowano jasny","Dodano zwarty widok","Naprawiono błędy","Drobne zmiany"]
	},
	{"version":"1.2.4",
		"changes":["Added notification bar"],
		"changesPL":["Dodano pasek powiadomień"]
	},
	{"version":"1.2.3",
		"changes":["Improved sidebar (up to 4x faster)","Fixed bug"],
		"changesPL":["Ulepszono pasek boczny (do 4x szybszy)","Naprawiono błąd"]
	},
	{"version":"1.2.2",
		"changes":["Dark sidebar icon","Darker toolbar button icon"],
		"changesPL":["Ciemna ikona paska bocznego","Ciemniejsza ikona przycisku"]
	},
	{"version":"1.2.1",
		"changes":["Minor improvements","Sans-serif font"],
		"changesPL":["Drobne ulepszenia","Czcionka Sans-serif"]
	},
	{"version":"1.2.0",
		"changes":["Added ability to restore a deleted page (sidebar)","Added delete animation (sidebar)","Fixed bug","Minor changes"],
		"changesPL":["Dodano możliwość przywrócenia usuniętej strony (panel boczny)","Dodano animację usuwania (panel boczny)","Naprawiono błędy","Drobne zmiany"]
	},
	{"version":"1.1.1",
		"changes":["Fixed bug","Optimized svg"],
		"changesPL":["Naprawiono błąd","Zoptymalizowano pliki svg"]
	},
	{"version":"1.1.0",
		"changes":["Fixed bugs"],
		"changesPL":["Naprawiono błędy"]
	},
	{"version":"1.1.0",
		"changes":["Initial release"],
		"changesPL":["Pierwsze wydanie"]
	}
]`;

(function(){
	let container=document.getElementById("changelog"),
		lang=browser.i18n.getUILanguage();
	JSON.parse(changelog).forEach(v=>{
		let article=document.createElement("article"),
			h3=document.createElement("h3"),
			ul=document.createElement("ul"),
			changes=lang==="pl"?v.changesPL:v.changes;
		h3.textContent=browser.i18n.getMessage("version",v.version);
		changes.forEach(c=>{
			let li=document.createElement("li");
				li.textContent=c;
			ul.appendChild(li);
		});
		article.appendChild(h3);
		article.appendChild(ul);
		container.appendChild(article);
	});
})();
