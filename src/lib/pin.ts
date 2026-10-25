export const PIN_COOKIE = "choir_pass";

/** Cookie value for the current PIN. Changing CHOIR_PIN signs everyone out. */
export async function pinToken(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`prochoir:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
