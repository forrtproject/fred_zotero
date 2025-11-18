/**
 * Preference utilities for Replication Checker
 */

var ReplicationCheckerPrefs = {
  PREF_PREFIX: "extensions.zotero.replication-checker.",

  /**
   * Get a preference value
   * @param {string} key - The preference key (without prefix)
   * @returns {*} The preference value
   */
  get(key) {
    return Zotero.Prefs.get(this.PREF_PREFIX + key, true);
  },

  /**
   * Set a preference value
   * @param {string} key - The preference key (without prefix)
   * @param {*} value - The value to set
   */
  set(key, value) {
    return Zotero.Prefs.set(this.PREF_PREFIX + key, value, true);
  },

  /**
   * Get the "how are you today" preference
   * @returns {string} One of: 'great', 'good', 'okay', 'not-great'
   */
  getHowAreYouToday() {
    return this.get("howAreYouToday");
  },

  /**
   * Set the "how are you today" preference
   * @param {string} value - One of: 'great', 'good', 'okay', 'not-great'
   */
  setHowAreYouToday(value) {
    return this.set("howAreYouToday", value);
  }
};
