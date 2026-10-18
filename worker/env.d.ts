declare namespace Cloudflare {
  interface Env {
    /** Optional; set d1 to DB in .openai/hosting.json before using the database example. */
    DB?: D1Database;
  }
}
