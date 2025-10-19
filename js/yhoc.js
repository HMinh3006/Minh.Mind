const vocabData = [
  { word: "apple", meaning: "quả táo", part: "noun" },
  { word: "beautiful", meaning: "xinh đẹp", part: "adjective" },
  { word: "study", meaning: "học tập", part: "verb" },
  { word: "computer", meaning: "máy tính", part: "noun" },
  { word: "run", meaning: "chạy", part: "verb" },
  { word: "friendship", meaning: "tình bạn", part: "noun" },
  { word: "strong", meaning: "mạnh mẽ", part: "adjective" },
  { word: "book", meaning: "quyển sách", part: "noun" },
  { word: "dream", meaning: "giấc mơ", part: "noun" },
  { word: "kindness", meaning: "lòng tốt", part: "noun" },
];

const container = document.getElementById("vocabList");

vocabData.forEach(item => {
  const card = document.createElement("div");
  card.classList.add("card");

  const wordEl = document.createElement("div");
  wordEl.classList.add("word");
  wordEl.textContent = item.word;

  const partEl = document.createElement("div");
  partEl.classList.add("part");
  partEl.textContent = `(${item.part})`;

  const meaningEl = document.createElement("div");
  meaningEl.classList.add("meaning");
  meaningEl.textContent = item.meaning;

  const button = document.createElement("button");
  button.textContent = "🔊";
  button.title = "Phát âm";
  button.addEventListener("click", () => speakWord(item.word));

  card.appendChild(wordEl);
  card.appendChild(partEl);
  card.appendChild(meaningEl);
  card.appendChild(button);

  container.appendChild(card);
});

// Dùng Web Speech API để phát âm
function speakWord(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}
