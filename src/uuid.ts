/*
Implementation copied from https://stackoverflow.com/a/2117523/7416363.
We don't need anything cryptographically secure, just something reasonably good
and fast, without having to install a dependency (the uuid package is significantly
larger than this package). The whole point of uuid is to avoid infinite loops
while relaying events in networks with cycles.
 */

export function uuid4():string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
