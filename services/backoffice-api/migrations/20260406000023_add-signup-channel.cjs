'use strict';

/**
 * Closes Member Search's last fabricated-vs-disabled gap that had a real,
 * buildable backend behind it: Channel Type. Captured once, at
 * registration, from a `?ref=<code>` query param apps/player-web's
 * register page reads off the URL (a real affiliate-link parameter, not
 * a client-asserted "trust me, I'm affiliate traffic" field) - present
 * means AFFILIATE, absent means DIRECT. No REFERRAL value: that would be
 * a genuinely separate player-to-player referral subsystem (CLAUDE.md's
 * phase 11, "confirm the data model before building" - not this
 * migration's job), so the CHECK constraint only allows the two values
 * this signup flow can actually produce.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE players ADD COLUMN signup_channel TEXT NOT NULL DEFAULT 'DIRECT' CHECK (signup_channel IN ('DIRECT', 'AFFILIATE'));
    ALTER TABLE players ADD COLUMN referral_code TEXT;

    CREATE INDEX players_signup_channel_idx ON players (signup_channel);
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE players DROP COLUMN signup_channel;
    ALTER TABLE players DROP COLUMN referral_code;
  `);
};
