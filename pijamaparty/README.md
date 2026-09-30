# Pijama Party RSVP — updated

Responsive single-page RSVP using the supplied pink paper texture and sticker assets.

## Run locally
Open `index.html` directly, or serve the folder with a local static server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Current response storage
The page currently stores the latest response **only in the visitor's browser** using `localStorage`.
That means responses are not centralized and the host cannot see everybody's answers yet.

Each response now contains:

```json
{
  "name": "Guest name",
  "choice": "Staying over | Going home",
  "toiletryBag": "Yes | No",
  "sleepGear": "Yes | No",
  "submittedAt": "ISO timestamp"
}
```

For centralized collection, connect `saveResponse()` in `script.js` to a backend such as Google Apps Script + Google Sheets, Supabase, or Firebase.
