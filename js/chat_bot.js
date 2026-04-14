const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");

const STORAGE_KEY = "vizoptika_chat_history";

/* ===============================
   📥 ТАРИХТЫ ЖҮКТЕУ
================================ */
loadHistory();

/* ===============================
   🧠 ХАБАР ҚОСУ
================================ */
function add(role, text, save = true) {
    const div = document.createElement("div");
    div.className = role;
    div.innerHTML = text;
    chatBox.appendChild(div);

    if (window.MathJax) {
        MathJax.typesetPromise().then(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    } else {
        chatBox.scrollTop = chatBox.scrollHeight;
    }


    if (save) {
        saveMessage(role, text);
    }
}

/* ===============================
   💾 localStorage-қа сақтау
================================ */
function saveMessage(role, text) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    history.push({ role, text });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ===============================
   📤 localStorage-тан жүктеу
================================ */
function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!history) return;

    chatBox.innerHTML = "";
    history.forEach(msg => {
        add(msg.role, msg.text, false);
    });
}

/* ===============================
   🌐 Сервер адресі
================================ */
const API_URL =
    location.hostname === "localhost" ||
        location.hostname === "127.0.0.1"
        ? "http://localhost:3000/chat"
        : "https://optika-ai-server.onrender.com/chat";

/* ===============================
   📤 ХАБАР ЖІБЕРУ
================================ */
async function send() {
    const text = input.value.trim();
    if (!text) return;

    add("user", text);
    input.value = "";

    const loading = document.createElement("div");
    loading.className = "bot";
    loading.textContent = "⏳ Ойланып жатыр...";
    chatBox.appendChild(loading);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        if (!res.ok) {
            throw new Error("Сервер жауап бермеді");
        }

        const data = await res.json();
        loading.remove();
        add("bot", data.reply);

    } catch (err) {
        loading.remove();
        add(
            "bot",
            "❌ Қате пайда болды.<br>Сервер қосулы екенін тексер."
        );
        console.error(err);
    }
    // input фокусын қайтару (mobile UX)
    setTimeout(() => {
        input.focus();
    }, 100);

}


function clearChat() {
    if (!confirm("Чат тарихын толық тазалайсыз ба?")) return;

    localStorage.removeItem("vizoptika_chat_history");

    chatBox.innerHTML =
        `<div class="bot">Сәлем, оптика бойынша сұрақтарыңызды қойыңыз</div>`;

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

/* ===============================
   ⌨ Enter басқанда жіберу
================================ */
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        send();
    }
});
