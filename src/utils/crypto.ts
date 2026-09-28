/** SHA-256 hash of a string, returned as lowercase hex. */
export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPin(pin: string): Promise<string> {
  return sha256(`lifeos-pin:${pin}`)
}
