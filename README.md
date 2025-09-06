# Chrome Home Page

A customizable Chrome New Tab / Homepage extension made with HTML, CSS, and JavaScript.

**Repository:** dipakmeshram26/chrome-home-page

---

## 🔧 Description

This project provides a lightweight, customizable homepage you can use as Chrome's New Tab page. It includes several example layouts (`home3.html`, `home4.html`, ..., `home17.html`), styles, and JavaScript utilities to add interactive widgets, quick links, and visual elements.

छोटा सा Chrome New Tab/homepage project — आसानी से customize कर सकते हो।

---

## 🚀 Features

* Multiple example homepage layouts to choose from
* Custom CSS for visual styles (`style22.css`)
* JavaScript widgets and interactions (`js.js`, `script.js`)
* Supports replacing Chrome's new tab with the extension via `manifest.json`
* Static assets: images and icons included

---

## 📁 Repository Structure (key files)

```
index.html                # main demo/home page
home3.html ... home17.html# alternative layout pages
manifest.json             # Chrome extension manifest (MV3)
style22.css               # main stylesheet
js.js, script.js          # frontend JavaScript
background.js             # background/service worker (if used)
images/                   # icons and images (circle.png, girl.png, v.png...)
```

---

## 🛠️ Install / Load Locally (Developer)

1. Clone the repo:

   ```bash
   git clone https://github.com/dipakmeshram26/chrome-home-page.git
   cd chrome-home-page
   ```
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder.
5. The extension will appear in the list. To replace the new tab page, ensure `manifest.json` contains:

   ```json
   "chrome_url_overrides": {
     "newtab": "index.html"
   }
   ```
6. Open a new tab to see the custom homepage.

---

## ✅ Notes & Tips

* If you change files, click the **Reload** button on the extension card in `chrome://extensions/` to apply updates.
* Use the sample `home*.html` files to prototype different layouts; copy and rename whichever you want as the default `index.html`.
* For MV3, `background.js` should be registered as a service worker in `manifest.json` if required.

---

## 🧑‍💻 Contributing

Feel free to open issues or pull requests. Suggestions:

* Add themes (dark/light) or a settings UI
* Add small widgets (clock, weather with a public API, bookmarks grid)
* Improve accessibility and mobile responsiveness

---

## 📜 License

Specify a license (e.g., MIT) by adding a `LICENSE` file. Example: MIT License.

---

## ✉️ Contact

If you want help customizing this for your own use, describe what you want and I can help implement it.

---

*Generated README — tweak details (features, license) to match your final project.*
