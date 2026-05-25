async function fetchCsv(url) {
  if (!url || url.includes("PASTE_YOUR")) {
    throw new Error("CSV URL has not been added in js/config.js yet.");
  }

  const cacheBuster = `cb=${Date.now()}`;
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}${cacheBuster}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`);
  }

  const text = await response.text();
  return parseCsv(text);
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (current || row.length) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = "";
      }

      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map(cleanHeader);

  return rows.slice(1)
    .filter(row => row.some(cell => String(cell || "").trim() !== ""))
    .map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
}

function cleanHeader(value) {
  return String(value || "")
    .replace(/\uFEFF/g, "")
    .trim();
}

function getValue(row, columnName) {
  return row[columnName] || "";
}

function formatPercent(value) {
  const raw = String(value || "").trim();

  if (!raw) return "—";
  if (raw.includes("%")) return raw;

  const num = Number(raw);
  if (Number.isNaN(num)) return raw;

  if (Math.abs(num) <= 1) {
    return `${(num * 100).toFixed(1)}%`;
  }

  return `${num.toFixed(1)}%`;
}

function formatOdds(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";

  const num = Number(raw);
  if (Number.isNaN(num)) return raw;

  return num > 0 ? `+${num}` : `${num}`;
}

function classifyNumber(value) {
  const raw = String(value || "").replace("%", "").replace("+", "").trim();
  const num = Number(raw);

  if (Number.isNaN(num)) return "";

  if (num > 0) return "positive";
  if (num < 0) return "negative";

  return "";
}

function todayIsoLocal() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDate(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return raw;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
