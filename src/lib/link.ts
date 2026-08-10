/**
 * The one place the vMix Call link format is defined. If vMix ever changes the URL or a parameter
 * name, this file is the only thing that needs editing.
 */

const VMIX_CALL_BASE = "https://advanced.vmixcall.com/call.htm";

/**
 * Builds the link a caster opens in their browser.
 *
 * encodeURIComponent turns characters that are not safe in a URL into escape codes, so a space
 * becomes %20 and "John Smith" becomes "John%20Smith". The original spreadsheet formula did not do
 * this, which meant links with spaces could break when pasted into chat apps that stop reading the
 * URL at the first space. vMix reads the encoded and unencoded forms identically.
 */
export function buildLink(code: string, name: string): string {
  const key = encodeURIComponent(code.trim());
  const displayName = encodeURIComponent(name.trim());

  return `${VMIX_CALL_BASE}?Key=${key}&Name=${displayName}`;
}
