'use strict';

/**
 * Adds server-captured login context to players, closing the Member
 * Search "Last Login IP"/"Last Login Since"/"No Login Since" gap (those
 * columns already existed and were populated; there was just no filter
 * for them) and two new ones the search form doesn't filter on yet but
 * services/player-api can now populate for real:
 *
 * - last_login_country: derived server-side from last_login_ip via an
 *   offline IP-to-country lookup (geoip-lite) at the moment of
 *   login/register - never a client-reported "detected location", which
 *   is both spoofable and requires a browser permission prompt. See
 *   services/player-api/src/player-auth.service.ts's own comment.
 * - last_login_user_agent / last_login_device: the request's own
 *   User-Agent header, parsed into a coarse Desktop/Mobile/Tablet/Bot
 *   classification server-side. This is real, honest device
 *   *classification* - not device *fingerprinting* (uniquely
 *   re-identifying a specific returning device via a canvas/WebGL/audio
 *   hash for multi-account/fraud correlation), which would need a
 *   client-side collector and a separate per-device table and is a
 *   materially bigger feature than what this migration adds.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE players ADD COLUMN last_login_country TEXT;
    ALTER TABLE players ADD COLUMN last_login_user_agent TEXT;
    ALTER TABLE players ADD COLUMN last_login_device TEXT;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE players DROP COLUMN last_login_country;
    ALTER TABLE players DROP COLUMN last_login_user_agent;
    ALTER TABLE players DROP COLUMN last_login_device;
  `);
};
