const SITE_CONFIG = {
  refreshSeconds: 30,

  sheets: {
    // Replace this with your published CSV link for the Today's Plays tab.
    todaysPlaysCsv:
      "PASTE_YOUR_TODAYS_PLAYS_CSV_URL_HERE",

    // Replace this with your published CSV link for the model summary tab.
    modelSummaryCsv:
      "PASTE_YOUR_MODEL_SUMMARY_CSV_URL_HERE"
  },

  columns: {
    todaysPlays: {
      date: "Date",
      game: "Game",
      away: "Away",
      home: "Home",
      awayPitcher: "Away SP",
      homePitcher: "Home SP",
      betType: "Bet Type",
      play: "Recommended Play",
      modelPercent: "Model %",
      noVigPercent: "No-Vig Implied %",
      edge: "Edge",
      odds: "Odds",
      playValue: "Play Value",
      notes: "Notes"
    },

    modelSummary: {
      model: "Model",
      record: "Record",
      winPercent: "Win %",
      roi: "ROI",
      units: "Units",
      avgClv: "Avg CLV",
      bestBetType: "Best Bet Type",
      lastUpdated: "Last Updated",
      notes: "Notes"
    }
  }
};
