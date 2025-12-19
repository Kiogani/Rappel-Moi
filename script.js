let events =[];
let alarmInterval;
let ownerName = "Propriétaire";
let recognition;

// INITIALISATION
window.onload = () => {
    loadOwnerName();
    loadEvents();
    setInterval(updateClock, 1000);
    updateClock();
    
    // --- AJOUTEZ CES DEUX LIGNES ---
    // Cache l'écran de chargement après 2 secondes (pour bien voir l'animation)
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
};

function updateClock() {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString('fr-FR');
}

// GESTION DU NOM
function setOwnerName() {
    //On récupère l'élément
    const nameInput = document.getElementById('owner-name-input');

    // On vérifie s'il existe AVANT de faire le .trim()
    if (nameInput) {
        const newName = nameInput. value.trim();
        if (newName) {
            ownerName = newName;
            localStorage.setItem('agendaOwnerName', ownerName);
            alert("Nom enregistré !");
        } else{
            alert("veuillez entrer un nom.");
        }
    } else {
        console.error("L'élément 'owner-name-input' est introuvable dans le HTML.");
    }
}

function loadOwnerName() {
    const saved = localStorage.getItem('agendaOwnerName');
    if (saved) {
        ownerName = saved;
        const input = document.getElementById('owner-name-input');
        if (input) {
            input.value = saved;
        }
    }
}

// SYNTHESE VOCALE
function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    window.speechSynthesis.speak(utter);
}

// NOUVELLE FONCTION
function testVoices() {
    // Récupère toutes les voix disponibles sur le système
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
        alert("Aucune voix détectée. Essayez de recliquer dans 2 secondes (le temps que le système les charge).");
        return;
    }

    console.log("--- Liste des voix disponibles ---");
    voices.forEach((voice, index) => {
        console.log(`${index}: ${voice.name} (${voice.lang}) ${voice.localService ? 'Hors-ligne' : 'Besoin Internet'}`);
    });

    //Teste la première voix française trouvéé
    const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frenchVoice) {
        const testUtter = new SpeechSynthesisUtterance("Ceci est un test de voixlocale.");
        testUtter.voice = frenchVoice;
        window.speechSynthesis.sprak(testUtter);
        alert("j'essaie de parler avec la voix : " + frenchVoice.name);
    }


}

// RECONNAISSANCE VOCALE
function startListening() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return alert("Non supporté");

    recognition = new SpeechRec();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => document.getElementById('speech-status').textContent = "Ecoute...";
    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        document.getElementById('event-description').value = text;
        document.getElementById('speech-status').textContent = "Dicte terminée !";
    };
    recognition.start();
}

// ALARMES
function checkAlarms() {
    const now = new Date();
    events.forEach(event => {
        if (event.time <= now && !event.isAlarmed) {
            speak(`Bonjour ${ownerName}, il est l'heure pour : ${event.description}`);
            event.isAlarmed = true;
            saveEvents();
            renderEvents();
        }
    });
}

function startAlarmChecker() {
    if (!alarmInterval) alarmInterval = setInterval(checkAlarms, 5000);
}

// CRUD EVENEMENTS
function addEvent() {
    const time = document.getElementById('event-time').value;
    const desc = document.getElementById('event-description').value;
    if (!time || !desc) return alert("Remplissez tout !");

    events.push({ time: new Date(time), description: desc, isAlarmed: false});
    saveEvents();
    renderEvents();
    startAlarmChecker();
}

function renderEvents() {
    const ul = document.getElementById('events-ul');
    ul.innerHTML = events.map((e, i) => `
    <li class="${e.isAlarmed ? 'alarmed' : ''}">
    <span>${new Date(e.time).toLocaleString('fr-FR')} - ${e.description}</span>
    <button onclick="removeEvent(${i})" style="background:red; color:white;">X</button>
    </li>
    `).join('');
}

function removeEvent(i) {
    events.splice(i, 1);
    saveEvents();
    renderEvents();
}

function saveEvents() {
    localStorage.setItem('agendaEvents', JSON.stringify(events));
}

function loadEvents() {
    const saved = localStorage.getItem('agendaEvents');
    if (saved) {
        events = JSON.parse(saved).map(e => ({ ...e, time: new Date(e.time) }));
        renderEvents();
        startAlarmChecker();
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker Enregistré !"))
        .catch((err) => console.log("Erreur SW :", err));
}