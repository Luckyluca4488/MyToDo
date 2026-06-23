let daten = [];

const katSymbol = {
    normal: "⚪", wichtig: "🔴", schule: "📚", einkauf: "🛒"
};

// ── DATUM ───────────────────────────────────────────────
const heute = new Date();
document.getElementById("datum").textContent =
    heute.toLocaleDateString("de-DE", {
        weekday: "long", day: "numeric", month: "long"
    });

// ── DIALOG ──────────────────────────────────────────────
function dialog(text, onBestaetigen) {
    const alt = document.getElementById("dialog");
    if (alt) alt.remove();

    const div = document.createElement("div");
    div.id = "dialog";
    div.innerHTML = `
        <div class="dialog-overlay"></div>
        <div class="dialog-box">
            <p class="dialog-text">🗑️ ${text}</p>
            <div class="dialog-buttons">
                <button class="dialog-nein" onclick="dialogSchliessen()">Abbrechen</button>
                <button class="dialog-ja" id="dialogJa">Löschen</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
    document.getElementById("dialogJa").onclick = () => {
        dialogSchliessen();
        onBestaetigen();
    };
}

function dialogSchliessen() {
    const el = document.getElementById("dialog");
    if (el) el.remove();
}

// ── THEME ───────────────────────────────────────────────
function themeToggle() {
    document.body.classList.toggle("light");
    const istLight = document.body.classList.contains("light");
    document.getElementById("themeBtn").textContent =
        istLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    localStorage.setItem("theme", istLight ? "light" : "dark");
}

function themeLaden() {
    const gespeichert = localStorage.getItem("theme");
    if (gespeichert === "light") {
        document.body.classList.add("light");
        document.getElementById("themeBtn").textContent = "🌙 Dark Mode";
    }
}

// ── SPEICHERN & LADEN ───────────────────────────────────
function speichern() {
    localStorage.setItem("todoapp-daten", JSON.stringify(daten));
}

function laden() {
    const gespeichert = localStorage.getItem("todoapp-daten");
    if (gespeichert) daten = JSON.parse(gespeichert);
}

// ── BENACHRICHTIGUNGEN ──────────────────────────────────
function benachrichtigungErlauben() {
    if (!("Notification" in window)) {
        alert("Dein Browser unterstützt keine Benachrichtigungen.");
        return;
    }
    Notification.requestPermission().then(erlaubnis => {
        if (erlaubnis === "granted") {
            document.getElementById("notifBtn").textContent = "🔔 Aktiv!";
            document.getElementById("notifBtn").classList.add("aktiv");
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

function benachrichtigungLaden() {
    if (localStorage.getItem("notif") === "true" &&
        Notification.permission === "granted") {
        document.getElementById("notifBtn").textContent = "🔔 Aktiv!";
        document.getElementById("notifBtn").classList.add("aktiv");
    }
}

function benachrichtigungSenden(titel, text) {
    if (Notification.permission === "granted") {
        new Notification(titel, {
            body: text,
            icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
        });
    }
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

    o.aufgaben.push({
        id: Date.now(),
        text,
        kategorie: kat,
        datum: datum || null,
        erledigt: false
    });

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

// ── UNTERORDNER EINGABE ─────────────────────────────────
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
    let gesamt = 0;
    let erledigt = 0;

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

// ── ORDNER HTML ─────────────────────────────────────────
function ordnerHTML(o, offene) {
    const prozent = prozentBerechnen(o);
    const istOffen = offene.has(o.id);

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
                <span class="aufgabe-kat">${katSymbol[a.kategorie]}</span>
                <button class="loeschen-btn"
                    onclick="aufgabeLoeschen(${o.id}, ${a.id})">🗑️</button>
            </li>`).join("");

    const unterordnerHTML = o.unterordner
        .map(u => ordnerHTML(u, offene))
        .join("");

    return `
    <div class="ordner ${istOffen ? "offen" : ""}" id="ordner-${o.id}">
        <div class="ordner-header" onclick="ordnerToggle(${o.id})">
            <span class="ordner-pfeil">▶</span>
            <span class="ordner-name">📁 ${o.name}</span>
            <span class="ordner-prozent">${prozent}%</span>
            <button class="ordner-loeschen"
                onclick="event.stopPropagation(); ordnerLoeschen(${o.id})">🗑️</button>
        </div>
        <div class="progress-bereich">
            <div class="progress-bar-bg">
                <div class="progress-bar-fill ${prozent === 100 ? "voll" : ""}"
                    style="width: ${prozent}%"></div>
            </div>
        </div>
        <div class="ordner-inhalt">
            <button class="unterordner-btn"
                onclick="unterordnerEingabeToggle(${o.id})">
                📁 Unterordner hinzufügen
            </button>
            <div class="unterordner-eingabe" id="uEingabeBereich-${o.id}">
                <input type="text" id="uEingabe-${o.id}"
                    placeholder="Unterordner Name..."
                    onkeydown="if(event.key==='Enter') ordnerHinzufuegen(${o.id})">
                <button onclick="ordnerHinzufuegen(${o.id})">+ Add</button>
            </div>
            ${unterordnerHTML}
            <div class="aufgabe-eingabe">
                <input type="text" id="eingabe-${o.id}"
                    placeholder="Neue Aufgabe..."
                    onkeydown="if(event.key==='Enter') aufgabeHinzufuegen(${o.id})">
                <input type="date" id="datum-${o.id}" title="Fälligkeitsdatum">
                <select id="kat-${o.id}">
                    <option value="normal">⚪ Normal</option>
                    <option value="wichtig">🔴 Wichtig</option>
                    <option value="schule">📚 Schule</option>
                    <option value="einkauf">🛒 Einkauf</option>
                </select>
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

    if (daten.length === 0) {
        liste.innerHTML = `<p class="leer-text">
            Noch keine Ordner — erstelle deinen ersten! 📁</p>`;
        return;
    }

    liste.innerHTML = daten.map(o => ordnerHTML(o, offene)).join("");
}

// ── START ───────────────────────────────────────────────
themeLaden();
laden();
benachrichtigungLaden();
rendern();
faelligeAufgabenPruefen();
setInterval(faelligeAufgabenPruefen, 60000);

document.getElementById("ordnerEingabe")
    .addEventListener("keydown", e => {
        if (e.key === "Enter") ordnerHinzufuegen(null);
    });