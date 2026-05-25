let allPlays = [];
let activeFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  loadTodaysPlays();

  setInterval(loadTodaysPlays, SITE_CONFIG.refreshSeconds * 1000);
});

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      activeFilter = button.dataset.filter;
      renderPlays();
    });
  });
}

async function loadTodaysPlays() {
  const status = document.getElementById("status");

  try {
    const rows = await fetchCsv(SITE_CONFIG.sheets.todaysPlaysCsv);
    const c = SITE_CONFIG.columns.todaysPlays;
    const today = todayIsoLocal();

    allPlays = rows.filter(row => {
      const rowDate = normalizeDate(getValue(row, c.date));
      const play = getValue(row, c.play);
      const betType = getValue(row, c.betType);

      // Shows rows for today with either a recommended play or bet type.
      return rowDate === today && (play || betType);
    });

    renderPlays();

    document.getElementById("lastUpdated").textContent =
      `Last updated: ${new Date().toLocaleString()}`;
  } catch (error) {
    status.textContent = error.message;
    document.getElementById("playsGrid").innerHTML = "";
  }
}

function renderPlays() {
  const grid = document.getElementById("playsGrid");
  const status = document.getElementById("status");
  const c = SITE_CONFIG.columns.todaysPlays;

  const filtered = allPlays.filter(row => {
    if (activeFilter === "ALL") return true;

    const betType = getValue(row, c.betType).toUpperCase();
    const play = getValue(row, c.play).toUpperCase();

    return betType.includes(activeFilter) || play.includes(activeFilter);
  });

  if (!filtered.length) {
    status.textContent = "No plays found for the selected filter.";
    grid.innerHTML = "";
    return;
  }

  status.textContent = `${filtered.length} play${filtered.length === 1 ? "" : "s"} found.`;

  grid.innerHTML = filtered.map(row => createPlayCard(row)).join("");
}

function createPlayCard(row) {
  const c = SITE_CONFIG.columns.todaysPlays;

  const game = getValue(row, c.game) || `${getValue(row, c.away)} @ ${getValue(row, c.home)}`;
  const betType = getValue(row, c.betType);
  const play = getValue(row, c.play);
  const playValue = getValue(row, c.playValue);
  const edge = getValue(row, c.edge);
  const notes = getValue(row, c.notes);

  const badgeClass = getBadgeClass(playValue || edge);

  return `
    <article class="play-card">
      <div class="card-content">
        <div class="card-top">
          <div>
            <div class="game-title">${escapeHtml(game)}</div>
            <div class="subtle">
              ${escapeHtml(getValue(row, c.awayPitcher))} vs ${escapeHtml(getValue(row, c.homePitcher))}
            </div>
          </div>

          <span class="badge ${badgeClass}">
            ${escapeHtml(betType || play || "PLAY")}
          </span>
        </div>

        <div class="stat-grid">
          <div class="stat">
            <div class="stat-label">Play</div>
            <div class="stat-value">${escapeHtml(play || "—")}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Odds</div>
            <div class="stat-value">${escapeHtml(formatOdds(getValue(row, c.odds)))}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Model</div>
            <div class="stat-value">${escapeHtml(formatPercent(getValue(row, c.modelPercent)))}</div>
          </div>

          <div class="stat">
            <div class="stat-label">No-Vig</div>
            <div class="stat-value">${escapeHtml(formatPercent(getValue(row, c.noVigPercent)))}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Edge</div>
            <div class="stat-value ${classifyNumber(edge)}">${escapeHtml(formatPercent(edge))}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Value</div>
            <div class="stat-value">${escapeHtml(playValue || "—")}</div>
          </div>
        </div>

        ${notes ? `<p class="notes">${escapeHtml(notes)}</p>` : ""}
      </div>
    </article>
  `;
}

function getBadgeClass(value) {
  const raw = String(value || "").toLowerCase();

  if (raw.includes("strong") || raw.includes("+")) return "";
  if (raw.includes("avoid") || raw.includes("negative") || raw.includes("-")) return "red";
  if (raw.includes("medium") || raw.includes("lean")) return "yellow";

  return "";
}
