// ── DATEN ───────────────────────────────────────────────
let daten = [];

// Standard-Kategorien (können erweitert werden)
let kategorien = [
    { id: "normal",  name: "Normal",  symbol: "⚪" },
    { id: "wichtig", name: "Wichtig", symbol: "🔴" },
    { id: "schule",  name: "Schule",  symbol: "📚" },
    { id: "einkauf", name: "Einkauf", symbol: "🛒" },
    { id: "arbeit",  name: "Arbeit",  symbol: "💼" },
    { id: "sport",   name: "Sport",   symbol: "🏃" },
    { id: "gesundheit", name: "Gesundheit", symbol: "💊" },
    { id: "familie", name: "Familie", symbol: "👨‍👩‍👧" }
];

// ── DATUM ───────────────────────────────────────────────
const heute = new Date();
document.getElementById("datum").textContent =
    heute.toLocaleDateString("de-DE", {
        weekday: "long", day: "numeric", month: "long"
    });

// ── TABS ────────────────────────────────────────────────
function tabWechseln(name) {
    document.querySelectorAll(".tab-seite").forEach(s => s.classList.remove("aktiv"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("aktiv"));
    document.getElementById("seite-" + name).classList.add("aktiv");
    document.getElementById("tab-" + name).classList.add("aktiv");
    if (name === "einstellungen") katListeRendern();
}

// ── DIALOG ──────────────────────────────────────────────
function dialog(text, onBestaetigen) {
    const div = document.getElementById("dialog");
    div.style.display = "flex";
    div.innerHTML = `
        <div class="dialog-overlay" onclick="dialogSchliessen()"></div>
        <div class="dialog-box">
            <p class="dialog-text">🗑️ ${text}</p>
            <div class="dialog-buttons">
                <button class="dialog-nein" onclick="dialogSchliessen()">Abbrechen</button>
                <button class="dialog-ja" id="dialogJa">Löschen</button>
            </div>
        </div>`;
    document.getElementById("dialogJa").onclick = () => {
        dialogSchliessen();
        onBestaetigen();
    };
}

function dialogSchliessen() {
    const el = document.getElementById("dialog");
    el.style.display = "none";
    el.innerHTML = "";
}

// ── THEME ───────────────────────────────────────────────
function themeSetzen(modus) {
    if (modus === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }
    localStorage.setItem("theme", modus);
    document.getElementById("btn-dark").classList.toggle("aktiv", modus === "dark");
    document.getElementById("btn-light").classList.toggle("aktiv", modus === "light");
}

function themeLaden() {
    const gespeichert = localStorage.getItem("theme") || "dark";
    themeSetzen(gespeichert);
}

// ── HAUPTFARBE ──────────────────────────────────────────
function hauptfarbeSetzen(farbe) {
    document.documentElement.style.setProperty("--haupt", farbe);
    // Dunklere Variante berechnen
    document.documentElement.style.setProperty("--haupt-dunkel", farbe);
    localStorage.setItem("hauptfarbe", farbe);
    // Aktiv-Klasse bei Farb-Buttons
    document.querySelectorAll(".farb-btn").forEach(b => {
        b.classList.toggle("aktiv", b.dataset.farbe === farbe);
    });
    document.getElementById("eigenefarbe").value = farbe;
}

function hauptfarbeLaden() {
    const farbe = localStorage.getItem("hauptfarbe") || "#7c6ff7";
    hauptfarbeSetzen(farbe);
}

// ── HINTERGRUND ─────────────────────────────────────────
const hintergruende = {
    standard: { dark: "#0f0f1a", card: "#1a1a2e", border: "#2a2a3a", input: "#0f0f1a" },
    blau:     { dark: "#0a0f1e", card: "#0d1b3e", border: "#1a2a5e", input: "#08101a" },
    gruen:    { dark: "#0a150a", card: "#0f200f", border: "#1a3a1a", input: "#081008" },
    rot:      { dark: "#1a0a0a", card: "#2a0f0f", border: "#3a1a1a", input: "#150808" },
    hell:     { dark: "#f0f0f5", card: "#ffffff",  border: "#ddddee", input: "#f8f8ff" }
};

function hintergrundSetzen(name) {
    const hg = hintergruende[name] || hintergruende.standard;
    document.documentElement.style.setProperty("--bg", hg.dark);
    document.documentElement.style.setProperty("--card", hg.card);
    document.documentElement.style.setProperty("--border", hg.border);
    document.documentElement.style.setProperty("--input", hg.input);
    localStorage.setItem("hintergrund", name);
    document.querySelectorAll(".hg-btn").forEach(b => {
        b.classList.toggle("aktiv", b.dataset.hg === name);
    });
}

function hintergrundLaden() {
    const name = localStorage.getItem("hintergrund") || "standard";
    hintergrundSetzen(name);
}

// ── SPEICHERN & LADEN ───────────────────────────────────
function speichern() {
    localStorage.setItem("todoapp-daten", JSON.stringify(daten));
}

function laden() {
    const gespeichert = localStorage.getItem("todoapp-daten");
    if (gespeichert) daten = JSON.parse(gespeichert);
    const katGespeichert = localStorage.getItem("todoapp-kategorien");
    if (katGespeichert) kategorien = JSON.parse(katGespeichert);
}

function kategorienSpeichern() {
    localStorage.setItem("todoapp-kategorien", JSON.stringify(kategorien));
}

// ── KATEGORIEN VERWALTEN ────────────────────────────────
function katListeRendern() {
    const liste = document.getElementById("katListe");
    if (!liste) return;
    liste.innerHTML = kategorien.map(k => `
        <li class="kat-item">
            <span class="kat-symbol-gross">${k.symbol}</span>
            <span class="kat-name-text">${k.name}</span>
            ${k.id.startsWith("custom-") ? `
                <button class="kat-loeschen" onclick="kategorieLoeschen('${k.id}')">🗑️</button>
            ` : `<span class="kat-standard-badge">Standard</span>`}
        </li>
    `).join("");
}

function kategorieHinzufuegen() {
    const nameEl = document.getElementById("katNameEingabe");
    const symbolEl = document.getElementById("katSymbolEingabe");
    const name = nameEl.value.trim();
    const symbol = symbolEl.value.trim() || "📌";
    if (!name) { nameEl.focus(); return; }

    const neueKat = {
        id: "custom-" + Date.now(),
        name,
        symbol
    };
    kategorien.push(neueKat);
    kategorienSpeichern();
    nameEl.value = "";
    symbolEl.value = "";
    katListeRendern();
    rendern(); // Dropdown in Ordnern aktualisieren
}

function kategorieLoeschen(id) {
    kategorien = kategorien.filter(k => k.id !== id);
    kategorienSpeichern();
    katListeRendern();
    rendern();
}

// ── DATEN LÖSCHEN ───────────────────────────────────────
function alleDatenLoeschen() {
    dialog("Alle Aufgaben und Ordner wirklich löschen?", () => {
        daten = [];
        speichern();
        rendern();
        tabWechseln("aufgaben");
    });
}

// ── BENACHRICHTIGUNGEN ──────────────────────────────────
function benachrichtigungErlauben() {
    if (!("Notification" in window)) {
        alert("Dein Browser unterstützt keine Benachrichtigungen.");
        return;
    }
    Notification.requestPermission().then(erlaubnis => {
        if (erlaubnis === "granted") {
            aktualisiereNotifButtons(true);
            localStorage.setItem("notif", "true");
            new Notification("MyTodo 📝", {
                body: "Benachrichtigungen sind jetzt aktiv!",
                icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
            });
        } else {
            alert("Bitte in den Browser-Einstellungen erlauben.");
        }
    });
}

function aktualisiereNotifButtons(aktiv) {
    const btn1 = document.getElementById("notifBtn");
    const btn2 = document.getElementById("notifSettingBtn");
    if (btn1) { btn1.textContent = aktiv ? "🔔 Aktiv!" : "🔔 Benachrichtigungen"; btn1.classList.toggle("aktiv", aktiv); }
    if (btn2) { btn2.textContent = aktiv ? "✅ Aktiv" : "Aktivieren"; btn2.classList.toggle("aktiv", aktiv); }
}

function benachrichtigungLaden() {
    const aktiv = localStorage.getItem("notif") === "true" && Notification.permission === "granted";
    aktualisiereNotifButtons(aktiv);
}

function benachrichtigungSenden(titel, text) {
    if (Notification.permission === "granted") {
        new Notification(titel, {
            body: text,
            icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
        });
    }
}

// ── TÄGLICHE ERINNERUNG ─────────────────────────────────
function erinnerungSpeichern() {
    const zeit = document.getElementById("erinnerungZeit").value;
    localStorage.setItem("erinnerungZeit", zeit);
    benachrichtigungSenden("⏰ Erinnerung gesetzt", `Du wirst täglich um ${zeit} Uhr erinnert.`);
}

function erinnerungPruefen() {
    const gespeichert = localStorage.getItem("erinnerungZeit");
    if (!gespeichert || Notification.permission !== "granted") return;
    const el = document.getElementById("erinnerungZeit");
    if (el) el.value = gespeichert;

    const [h, m] = gespeichert.split(":").map(Number);
    const jetzt = new Date();
    const letzteErinnerung = localStorage.getItem("letzteErinnerung");
    const heute = jetzt.toDateString();
    if (jetzt.getHours() === h && jetzt.getMinutes() === m && letzteErinnerung !== heute) {
        localStorage.setItem("letzteErinnerung", heute);
        const offene = alleOffenenAufgaben();
        benachrichtigungSenden("📝 MyTodo – Tagesstart!", `Du hast ${offene} offene Aufgabe(n) heute.`);
    }
}

function alleOffenenAufgaben() {
    let count = 0;
    function zaehlen(liste) {
        liste.forEach(o => {
            count += o.aufgaben.filter(a => !a.erledigt).length;
            zaehlen(o.unterordner);
        });
    }
    zaehlen(daten);
    return count;
}

// ── FÄLLIGE AUFGABEN ────────────────────────────────────
function faelligeAufgabenPruefen() {
    const jetzt = new Date();
    jetzt.setHours(0, 0, 0, 0);
    const faellig = [];

    function suchen(liste) {
        liste.forEach(o => {
            o.aufgaben.forEach(a => {
                if (!a.erledigt && a.datum) {
                    const d = new Date(a.datum);
                    d.setHours(0, 0, 0, 0);
                    if (d <= jetzt) faellig.push(a.text);
                }
            });
            suchen(o.unterordner);
        });
    }
    suchen(daten);

    const banner = document.getElementById("faelligBanner");
    if (faellig.length > 0) {
        document.getElementById("faelligText").textContent =
            `⏰ ${faellig.length} Aufgabe(n) fällig: ${faellig.slice(0, 2).join(", ")}${faellig.length > 2 ? " ..." : ""}`;
        banner.style.display = "flex";
        benachrichtigungSenden(
            "📝 MyTodo — Fällige Aufgaben!",
            `${faellig.length} Aufgabe(n) warten: ${faellig.slice(0, 2).join(", ")}`
        );
    } else {
        banner.style.display = "none";
    }
}

function bannerSchliessen() {
    document.getElementById("faelligBanner").style.display = "none";
}

// ── ORDNER ──────────────────────────────────────────────
function ordnerHinzufuegen(elternId) {
    const eingabeId = elternId ? "uEingabe-" + elternId : "ordnerEingabe";
    const eingabe = document.getElementById(eingabeId);
    const name = eingabe.value.trim();
    if (!name) return;

    const neuerOrdner = { id: Date.now(), name, aufgaben: [], unterordner: [] };
    if (elternId === null) {
        daten.push(neuerOrdner);
    } else {
        const eltern = ordnerFinden(daten, elternId);
        if (eltern) eltern.unterordner.push(neuerOrdner);
    }
    eingabe.value = "";
    unterordnerEingabeVerstecken(elternId);
    speichern();
    rendern();
}

function ordnerLoeschen(id) {
    dialog("Ordner und alle Inhalte löschen?", () => {
        daten = ordnerEntfernen(daten, id);
        speichern();
        rendern();
    });
}

function ordnerFinden(liste, id) {
    for (const o of liste) {
        if (o.id === id) return o;
        const gefunden = ordnerFinden(o.unterordner, id);
        if (gefunden) return gefunden;
    }
    return null;
}

function ordnerEntfernen(liste, id) {
    return liste
        .filter(o => o.id !== id)
        .map(o => ({ ...o, unterordner: ordnerEntfernen(o.unterordner, id) }));
}

// ── AUFGABEN ────────────────────────────────────────────
function aufgabeHinzufuegen(ordinId) {
    const eingabe = document.getElementById("eingabe-" + ordinId);
    const kat = document.getElementById("kat-" + ordinId).value;
    const datum = document.getElementById("datum-" + ordinId).value;
    const text = eingabe.value.trim();
    if (!text) return;

    const o = ordnerFinden(daten, ordinId);
    if (!o) return;

    o.aufgaben.push({ id: Date.now(), text, kategorie: kat, datum: datum || null, erledigt: false });
    eingabe.value = "";
    document.getElementById("datum-" + ordinId).value = "";
    speichern();
    faelligeAufgabenPruefen();
    rendern();
}

function aufgabeToggle(ordinId, aufgabeId) {
    const o = ordnerFinden(daten, ordinId);
    const a = o.aufgaben.find(a => a.id === aufgabeId);
    if (a) a.erledigt = !a.erledigt;
    speichern();
    faelligeAufgabenPruefen();
    rendern();
}

function aufgabeLoeschen(ordinId, aufgabeId) {
    dialog("Aufgabe löschen?", () => {
        const o = ordnerFinden(daten, ordinId);
        if (o) o.aufgaben = o.aufgaben.filter(a => a.id !== aufgabeId);
        speichern();
        faelligeAufgabenPruefen();
        rendern();
    });
}

// ── DATUM ANZEIGE ───────────────────────────────────────
function datumAnzeigen(datum) {
    if (!datum) return "";
    const d = new Date(datum);
    const jetzt = new Date();
    jetzt.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d - jetzt) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return `<span class="aufgabe-datum-anzeige rot">⚠️ Überfällig seit ${Math.abs(diff)} Tag(en)</span>`;
    if (diff === 0) return `<span class="aufgabe-datum-anzeige rot">⏰ Heute fällig!</span>`;
    if (diff === 1) return `<span class="aufgabe-datum-anzeige">📅 Morgen fällig</span>`;
    return `<span class="aufgabe-datum-anzeige">📅 Fällig in ${diff} Tagen</span>`;
}

function istFaellig(datum) {
    if (!datum) return false;
    const d = new Date(datum);
    const jetzt = new Date();
    jetzt.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d <= jetzt;
}

// ── UNTERORDNER ─────────────────────────────────────────
function unterordnerEingabeToggle(elternId) {
    const el = document.getElementById("uEingabeBereich-" + elternId);
    el.classList.toggle("sichtbar");
    if (el.classList.contains("sichtbar")) {
        document.getElementById("uEingabe-" + elternId).focus();
    }
}

function unterordnerEingabeVerstecken(elternId) {
    if (!elternId) return;
    const el = document.getElementById("uEingabeBereich-" + elternId);
    if (el) el.classList.remove("sichtbar");
}

// ── PROZENT ─────────────────────────────────────────────
function prozentBerechnen(ordner) {
    let gesamt = 0, erledigt = 0;
    function zaehlen(o) {
        gesamt += o.aufgaben.length;
        erledigt += o.aufgaben.filter(a => a.erledigt).length;
        o.unterordner.forEach(zaehlen);
    }
    zaehlen(ordner);
    if (gesamt === 0) return 0;
    return Math.round((erledigt / gesamt) * 100);
}

// ── OFFENE ORDNER ───────────────────────────────────────
function offeneOrdnerHolen() {
    const offen = new Set();
    document.querySelectorAll(".ordner.offen").forEach(el => {
        const id = parseInt(el.id.replace("ordner-", ""));
        offen.add(id);
    });
    return offen;
}

function ordnerToggle(id) {
    const el = document.getElementById("ordner-" + id);
    if (el) el.classList.toggle("offen");
}

// ── KATEGORIE DROPDOWN HTML ─────────────────────────────
function katDropdownHTML(ordinId) {
    return kategorien.map(k =>
        `<option value="${k.id}">${k.symbol} ${k.name}</option>`
    ).join("");
}

// ── ORDNER HTML ─────────────────────────────────────────
function ordnerHTML(o, offene) {
    const prozent = prozentBerechnen(o);
    const istOffen = offene.has(o.id);

    const katSymbolMap = {};
    kategorien.forEach(k => katSymbolMap[k.id] = k.symbol);

    let aufgabenHTML = o.aufgaben.length === 0
        ? `<p class="leer-text">Noch keine Aufgaben</p>`
        : o.aufgaben.map(a => `
            <li class="aufgabe ${a.kategorie} ${!a.erledigt && istFaellig(a.datum) ? "faellig" : ""} ${a.erledigt ? "erledigt" : ""}">
                <input type="checkbox" ${a.erledigt ? "checked" : ""}
                    onchange="aufgabeToggle(${o.id}, ${a.id})">
                <div class="aufgabe-info">
                    <span class="aufgabe-text">${a.text}</span>
                    ${!a.erledigt ? datumAnzeigen(a.datum) : ""}
                </div>
                <span class="aufgabe-kat">${katSymbolMap[a.kategorie] || "⚪"}</span>
                <button class="loeschen-btn" onclick="aufgabeLoeschen(${o.id}, ${a.id})">🗑️</button>
            </li>`).join("");

    const unterordnerHTML = o.unterordner.map(u => ordnerHTML(u, offene)).join("");

    return `
    <div class="ordner ${istOffen ? "offen" : ""}" id="ordner-${o.id}">
        <div class="ordner-header" onclick="ordnerToggle(${o.id})">
            <span class="ordner-pfeil">▶</span>
            <span class="ordner-name">📁 ${o.name}</span>
            <span class="ordner-prozent">${prozent}%</span>
            <button class="ordner-loeschen" onclick="event.stopPropagation(); ordnerLoeschen(${o.id})">🗑️</button>
        </div>
        <div class="progress-bereich">
            <div class="progress-bar-bg">
                <div class="progress-bar-fill ${prozent === 100 ? "voll" : ""}" style="width:${prozent}%"></div>
            </div>
        </div>
        <div class="ordner-inhalt">
            <button class="unterordner-btn" onclick="unterordnerEingabeToggle(${o.id})">📁 Unterordner</button>
            <div class="unterordner-eingabe" id="uEingabeBereich-${o.id}">
                <input type="text" id="uEingabe-${o.id}" placeholder="Unterordner Name..."
                    onkeydown="if(event.key==='Enter') ordnerHinzufuegen(${o.id})">
                <button onclick="ordnerHinzufuegen(${o.id})">+ Add</button>
            </div>
            ${unterordnerHTML}
            <div class="aufgabe-eingabe">
                <input type="text" id="eingabe-${o.id}" placeholder="Neue Aufgabe..."
                    onkeydown="if(event.key==='Enter') aufgabeHinzufuegen(${o.id})">
                <input type="date" id="datum-${o.id}" title="Fälligkeitsdatum">
                <select id="kat-${o.id}">${katDropdownHTML(o.id)}</select>
                <button onclick="aufgabeHinzufuegen(${o.id})">+ Add</button>
            </div>
            <ul class="aufgabe-liste">${aufgabenHTML}</ul>
        </div>
    </div>`;
}

// ── RENDERN ─────────────────────────────────────────────
function rendern() {
    const offene = offeneOrdnerHolen();
    const liste = document.getElementById("ordnerListe");
    if (!liste) return;
    if (daten.length === 0) {
        liste.innerHTML = `<p class="leer-text">Noch keine Ordner — erstelle deinen ersten! 📁</p>`;
        return;
    }
    liste.innerHTML = daten.map(o => ordnerHTML(o, offene)).join("");
}

// ── START ───────────────────────────────────────────────
laden();
themeLaden();
hauptfarbeLaden();
hintergrundLaden();
benachrichtigungLaden();
rendern();
faelligeAufgabenPruefen();

const erinnerungZeitEl = document.getElementById("erinnerungZeit");
if (erinnerungZeitEl) {
    erinnerungZeitEl.value = localStorage.getItem("erinnerungZeit") || "08:00";
}

setInterval(faelligeAufgabenPruefen, 60000);
setInterval(erinnerungPruefen, 60000);
erinnerungPruefen();

document.getElementById("ordnerEingabe")
    .addEventListener("keydown", e => {
        if (e.key === "Enter") ordnerHinzufuegen(null);
    });
