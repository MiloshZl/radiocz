var data = [];
const audioPlayer = document.getElementById('radioPlayer');
let lastStationUrl = '';  // Uloží poslední URL přehrávané stanice
let retryCount = 0;  // Počítadlo pokusů
const maxRetries = 3;  // Maximální počet pokusů

const url = 'https://de2.api.radio-browser.info/json/stations/search?limit=15&language=czech&hidebroken=true&order=clickcount&reverse=true&is_https=true';

// Načtení uložených oblíbených stanic z cookies
let favoriteStations = [];
let currentPlayingButton = null; // Proměnná pro uložení aktuálního tlačítka "Přehrává se"

function hledej() {
    var searchValue = document.getElementById('searchValue').value;
    const searchStation = 'https://de2.api.radio-browser.info/json/stations/search?hidebroken=true&reverse=true&is_https=true&name='+ encodeURIComponent(searchValue) + '&nameExact=false&limit=15';
    console.log(searchValue);
    fetch(searchStation)
        .then(response => response.json())
        .then(data => {
            search(data);
            console.log(data);
        })
        .catch(error => console.error('Chyba:', error));
}

fetch(url)
    .then(response => response.json())
    .then(data => radia(data))
    .catch(error => console.error('Chyba:', error));

// Zobrazí oblíbené stanice

function zobrazOblibene() {
    let container = document.getElementById('favoriteStations');
    container.innerHTML = ""; // Vymazání obsahu

    if (favoriteStations.length === 0) {
        container.innerHTML = "<p>Nemáte žádné oblíbené stanice.</p>";
        return;
    }

    let row = document.createElement('div');
    row.className = 'row'; // Bootstrap row

    favoriteStations.forEach((station) => {
        let col = document.createElement('div');
        col.className = 'col-md-4 mb-4'; // Bootstrap column with margin-bottom

        let card = document.createElement('div');
        card.className = 'card';

        let imgContainer = document.createElement('div');
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center'; // Center the image horizontally
        imgContainer.style.marginBottom = '10px'; // Space between image and content

        let img = document.createElement('img');
        img.src = station.favicon || 'img/pngwing.com.png'; // Default image if favicon is not available
        img.alt = station.name + ' Logo';
        img.style.maxWidth = '45px'; // Max width of the image
        img.style.height = 'auto'; // Auto height to maintain aspect ratio

        imgContainer.appendChild(img);

        let cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center'; // Center text inside card-body

        let h5 = document.createElement('h5');
        h5.className = 'card-title';
        h5.textContent = station.name;

        // Vytvoření tlačítek
        let playButton = document.createElement('button');
        playButton.textContent = "Přehrát";
        playButton.className = "btn btn-primary";
        playButton.style.marginRight = '10px'; // Space between buttons
        playButton.addEventListener('click', function() {
            playRadio(station.url, playButton);
        });

        let removeButton = document.createElement('button');
        removeButton.textContent = "Odebrat";
        removeButton.className = "btn btn-danger";
        removeButton.addEventListener('click', function() {
            removeFromFavorites(station);
        });

        // Seskupení tlačítek do btn-group
        let btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.role = 'group';
        btnGroup.setAttribute('aria-label', 'Tlačítková skupina');

        // Přidání tlačítek do btn-group
        btnGroup.appendChild(playButton);
        btnGroup.appendChild(removeButton);

        // Přidání prvků do card
        cardBody.appendChild(imgContainer);
        cardBody.appendChild(h5);
        cardBody.appendChild(btnGroup);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
    });

    // Přidání řádku do kontejneru
    container.appendChild(row);
}


function radia(data) {
    let container = document.getElementById('radia');
    container.innerHTML = ""; // Vymazání obsahu

    let row = document.createElement('div');
    row.className = 'row'; // Bootstrap row

    data.forEach((station) => {
        let col = document.createElement('div');
        col.className = 'col-md-4 mb-4'; // Bootstrap column with margin-bottom

        let card = document.createElement('div');
        card.className = 'card';

        let imgContainer = document.createElement('div');
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center'; // Center the image horizontally
        imgContainer.style.marginBottom = '10px'; // Space between image and content

        let img = document.createElement('img');
        img.src = station.favicon || 'img/pngwing.com.png'; // Default image if favicon is not available
        img.alt = station.name + ' Logo';
        img.style.maxWidth = '45px'; // Max width of the image
        img.style.height = 'auto'; // Auto height to maintain aspect ratio

        imgContainer.appendChild(img);

        let cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center'; // Center text inside card-body

        let h5 = document.createElement('h5');
        h5.className = 'card-title';
        h5.textContent = station.name;

        // Vytvoření tlačítek
        let favoriteButton = document.createElement('button');
        favoriteButton.textContent = "Přidat do oblíbených";
        favoriteButton.className = "btn btn-success";
        favoriteButton.style.marginRight = '10px'; // Space between buttons
        favoriteButton.addEventListener('click', function() {
            addToFavorites(station);
            zobrazOblibene();
        });

        let playButton = document.createElement('button');
        playButton.textContent = "Přehrát";
        playButton.className = "btn btn-primary";
        playButton.addEventListener('click', function() {
            playRadio(station.url, playButton); // Přidání přehrávací funkce
        });

        // Seskupení tlačítek do btn-group
        let btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.role = 'group';
        btnGroup.setAttribute('aria-label', 'Tlačítková skupina');

        // Přidání tlačítek do btn-group
        btnGroup.appendChild(favoriteButton);
        btnGroup.appendChild(playButton);

        // Přidání prvků do card
        cardBody.appendChild(imgContainer);
        cardBody.appendChild(h5);
        cardBody.appendChild(btnGroup);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
    });

    // Přidání řádku do kontejneru
    container.appendChild(row);
}

function search(data) {
    let container = document.getElementById('radiaSearch');
    container.innerHTML = ""; // Vymazání obsahu

    // Zkontroluj, zda jsou data prázdná
    if (data.length === 0) {
        // Pokud nejsou žádná data, zobraz zprávu
        container.innerHTML = "<p>Nebyly nalezeny žádné výsledky.</p>";
        return; // Ukonči funkci
    }

    // Vytvoř nadpis jen pokud jsou nějaká data
    let heading = document.createElement('h2');
    heading.textContent = "Výsledky hledání";
    heading.style.marginTop = "25px";
    container.appendChild(heading);

    let row = document.createElement('div');
    row.className = 'row'; // Bootstrap row

    data.forEach((station) => {
        let col = document.createElement('div');
        col.className = 'col-md-4 mb-4'; // Bootstrap column with margin-bottom

        let card = document.createElement('div');
        card.className = 'card';

        let imgContainer = document.createElement('div');
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center'; // Center the image horizontally
        imgContainer.style.marginBottom = '10px'; // Space between image and content

        let img = document.createElement('img');
        img.src = station.favicon || 'img/pngwing.com.png'; // Default image if favicon is not available
        img.alt = station.name + ' Logo';
        img.style.maxWidth = '45px'; // Max width of the image
        img.style.height = 'auto'; // Auto height to maintain aspect ratio

        imgContainer.appendChild(img);

        let cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center'; // Center text inside card-body

        let h5 = document.createElement('h5');
        h5.className = 'card-title';
        h5.textContent = station.name;

        // Vytvoření tlačítek
        let favoriteButton = document.createElement('button');
        favoriteButton.textContent = "Přidat do oblíbených";
        favoriteButton.className = "btn btn-success";
        favoriteButton.style.marginRight = '10px'; // Space between buttons
        favoriteButton.addEventListener('click', function() {
            addToFavorites(station);
            zobrazOblibene();
        });

        let playButton = document.createElement('button');
        playButton.textContent = "Přehrát";
        playButton.className = "btn btn-primary";
        playButton.addEventListener('click', function() {
            playRadio(station.url, playButton); // Přidání přehrávací funkce
        });

        // Seskupení tlačítek do btn-group
        let btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.role = 'group';
        btnGroup.setAttribute('aria-label', 'Tlačítková skupina');

        // Přidání tlačítek do btn-group
        btnGroup.appendChild(favoriteButton);
        btnGroup.appendChild(playButton);

        // Přidání prvků do card
        cardBody.appendChild(imgContainer);
        cardBody.appendChild(h5);
        cardBody.appendChild(btnGroup);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
    });

    // Přidání řádku do kontejneru
    container.appendChild(row);
}


function playRadio(urlName, playButton) {
    console.log( urlName );

    
    const audioPlayer = document.getElementById('radioPlayer');
    audioPlayer.src = urlName;
    audioPlayer.play();

    // Resetování předchozího tlačítka "Přehrává se" na "Přehrát"
    if (currentPlayingButton && currentPlayingButton !== playButton) {
        currentPlayingButton.textContent = "Přehrát";
        currentPlayingButton.className = "btn btn-primary";
    }

    // Nastavení aktuálního tlačítka na "Přehrává se"
    playButton.textContent = "Přehrává se";
    playButton.className = "btn btn-warning";
    currentPlayingButton = playButton;

    // Událost pro resetování tlačítka, když přehrávání skončí
    audioPlayer.onended = function() {
        playButton.textContent = "Přehrát";
        playButton.className = "btn btn-primary";
        currentPlayingButton = null;
    };
}

// Uložení oblíbených stanic do localStorage
function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
}

// Přidání stanice do oblíbených a její uložení do localStorage
function addToFavorites(station) {
    if (!isFavorite(station)) {
        favoriteStations.push(station);
        saveFavoritesToLocalStorage(); // Uložení do localStorage
        console.log('Stanice přidána do oblíbených:', station);
    } else {
        alert('Stanice již byla přidána do oblíbených:', station);
    }
}


// Odebrání stanice z oblíbených
function removeFromFavorites(station) {
    favoriteStations = favoriteStations.filter(favStation => favStation.stationuuid !== station.stationuuid);
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations)); // Uložení do localStorage
    zobrazOblibene(); // Aktualizace UI
}


// Zkontroluje, zda je stanice v oblíbených
function isFavorite(station) {
    return favoriteStations.some(favStation => favStation.stationuuid === station.stationuuid);
}

// Uložení oblíbených stanic do localStorage
function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
}

// Načtení oblíbených stanic z localStorage při spuštění aplikace
function loadFavoritesFromLocalStorage() {
    const storedFavorites = localStorage.getItem('favoriteStations');
    if (storedFavorites) {
        try {
            favoriteStations = JSON.parse(storedFavorites);
            console.log("Oblíbené stanice byly úspěšně načteny:", favoriteStations);
        } catch (error) {
            console.error("Chyba při parsování JSON z localStorage:", error);
        }
    } else {
        console.log("Žádné oblíbené stanice nebyly nalezeny v localStorage.");
        favoriteStations = []; // Inicializace jako prázdné pole, pokud žádné stanice nejsou uloženy
    }
}


// Volání funkce pro načtení oblíbených stanic při spuštění stránky
loadFavoritesFromLocalStorage();
zobrazOblibene()


function printLocalStorage() {
    console.log("Local Storage obsah pro tuto stránku:");
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
}

//logování chyb přehrávače
// const audioEvents = [
//     'loadstart',
//     'loadedmetadata',
//     'loadeddata',
//     'canplay',
//     'canplaythrough',
//     'play',
//     'playing',
//     'pause',
//     'waiting',
//     'seeking',
//     'seeked',
//     'ended',
//     'error',
//     //'timeupdate',
//     'stalled',
//     'suspend',
//     'volumechange',
//     'ratechange',
//     'durationchange'
//   ];
  
//   audioEvents.forEach(eventName => {
//     audioPlayer.addEventListener(eventName, event => {
//       console.log(`Událost "${eventName}" byla spuštěna:`, event);
//     });
//   });

  

function handleError(event) {
    console.error('Došlo k chybě:', event);
    alert('Nastala chyba při přehrávání. Zkuste to znovu.');
    // Další kroky, např. přepnout na záložní zdroj
}

audioPlayer.addEventListener('error', handleError);

audioPlayer.addEventListener('error', () => {
    console.warn('Chyba zjištěna, pokus o zotavení...');
    setTimeout(() => {
        audioPlayer.src = ''; // Reset zdroje
        audioPlayer.src = lastStationUrl; // Obnovení původního zdroje
        audioPlayer.play().catch(err => console.error('Obnova selhala:', err));
    }, 1000); // Počkejte 1 sekundu
});


async function isSourceValid(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Kontrola URL selhala:', error);
        return false;
    }
}



