// Cloud backup: copies the save to Mark's Supabase (kids_save_get / kids_save_put), so the
// kids' stamps, stars, jobs and decorating follow them between computers and survive a cleared
// browser. Each kid's progress only ever grows when two copies meet (more stamps, more stars,
// more friends found). The house (furniture, paint, the dollhouse) is shared, so the copy
// changed most recently wins, but unlocked things and best course times are kept from both.
// The server keeps a history of every save. The family photo key and settings stay on the device.
window.CLOUD = (function () {
  const API = 'https://nxvtaxbntqhcfqtazbnt.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_51M6zUC11pz8fIPkCvi4WQ_owCE99pB';
  const FAMILY = 'R9so-F-FQWdreVzLrPGtR8YP';
  const GAME = 'new-house';
  const C = { status: 'not synced yet', lastSync: 0 };
  const clone = o => JSON.parse(JSON.stringify(o));

  const rpc = async (fn, body) => {
    const r = await fetch(API + fn, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(fn + ' ' + r.status);
    const t = await r.text(); return t ? JSON.parse(t) : null;
  };
  const device = () => {
    let d = localStorage.getItem('kidsGames.device');
    if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem('kidsGames.device', d); }
    return d;
  };

  // What goes to the cloud: the kids' progress and the house; not settings or who is playing here.
  C.cloudCopy = save => ({ v: 1, profiles: clone(save.profiles || {}), house: clone(save.house || {}), resets: clone(save.resets || {}) });

  const maxMap = (a, b, remoteNewer) => {
    a = a || {}; b = b || {};
    for (const k in b) {
      if (typeof a[k] === 'number' && typeof b[k] === 'number') a[k] = Math.max(a[k], b[k]);
      else if (!(k in a) || remoteNewer) a[k] = b[k];
    }
    return a;
  };
  // fold kid R (remote) into L (local) in place
  C.mergeProfile = (L, R) => {
    const remoteNewer = (R.touched || 0) > (L.touched || 0);
    L.stars = Math.max(L.stars || 0, R.stars || 0);
    for (const k of ['stamps', 'glims', 'done']) L[k] = maxMap(L[k], R[k], remoteNewer);
    L.intro = !!(L.intro || R.intro);
    if (remoteNewer) { for (const k of ['costume', 'picked']) if (k in R) L[k] = R[k]; L.touched = R.touched; }
    L.born = Math.min(L.born || 0, R.born || 0);
  };
  // fold house R into L in place (L stays the same object, so the game keeps its reference)
  C.mergeHouse = (L, R) => {
    const remoteNewer = (R.touched || 0) > (L.touched || 0);
    const unlocked = Array.from(new Set([...(L.unlocked || []), ...(R.unlocked || [])]));
    const nextPkg = Math.max(L.nextPkg || 0, R.nextPkg || 0);
    const course = clone(L.course || {});
    for (const room in R.course || {}) for (const kid in R.course[room]) {
      const a = (course[room] = course[room] || {})[kid], b = R.course[room][kid];
      course[room][kid] = a == null ? b : Math.min(a, b);
    }
    if (remoteNewer) { for (const k of Object.keys(L)) delete L[k]; Object.assign(L, clone(R)); }
    L.unlocked = unlocked; L.nextPkg = nextPkg; L.course = course;
    L.born = Math.min(L.born || 0, R.born || 0);
  };

  // Fold a remote save into the local one in place. Returns 'house' if the house changed, true if
  // only progress changed, false if nothing did.
  C.mergeSave = (local, remote) => {
    if (!remote || !remote.profiles) return false;
    const before = JSON.stringify(C.cloudCopy(local)), houseBefore = JSON.stringify(local.house);
    local.resets = local.resets || {};
    for (const k in remote.resets || {}) local.resets[k] = Math.max(local.resets[k] || 0, remote.resets[k]);
    const resetAt = k => local.resets[k] || 0;
    for (const id in local.profiles) if (resetAt(id) && (local.profiles[id].born || 0) <= resetAt(id)) delete local.profiles[id];
    for (const id in remote.profiles) {
      const R = remote.profiles[id];
      if (resetAt(id) && (R.born || 0) <= resetAt(id)) continue;
      if (local.profiles[id]) C.mergeProfile(local.profiles[id], R); else local.profiles[id] = clone(R);
    }
    const H = local.house;
    if (resetAt('house') && (H.born || 0) <= resetAt('house')) { // the house was cleared on another computer
      const keepNames = H.roomNames;
      for (const k of Object.keys(H)) delete H[k];
      Object.assign(H, G.defaultHouse(), { roomNames: keepNames, born: resetAt('house') + 1 });
    }
    if (remote.house && !(resetAt('house') && (remote.house.born || 0) <= resetAt('house'))) C.mergeHouse(H, remote.house);
    if (JSON.stringify(C.cloudCopy(local)) === before) return false;
    return JSON.stringify(local.house) !== houseBefore ? 'house' : true;
  };

  let busy = false, again = false;
  C.onChange = null;
  // fetch the cloud save, merge it in, upload the merged result
  C.sync = async () => {
    if (busy) { again = true; return; }
    busy = true;
    try {
      const remote = await rpc('kids_save_get', { p_family: FAMILY, p_game: GAME });
      const changed = C.mergeSave(G.save, remote);
      if (changed) { if (G.markSeen) G.markSeen(); G.persistNow(); if (C.onChange) C.onChange(changed); }
      const mine = C.cloudCopy(G.save);
      if (!remote || JSON.stringify(mine) !== JSON.stringify(remote)) await rpc('kids_save_put', { p_family: FAMILY, p_game: GAME, p_data: mine, p_device: device() });
      C.status = 'backed up'; C.lastSync = Date.now();
    } catch (e) {
      C.status = 'not backed up (offline?)';
    } finally {
      busy = false;
      if (again) { again = false; C.later(); }
    }
  };
  let timer = null;
  C.later = (ms = 4000) => { if (timer) return; timer = setTimeout(() => { timer = null; C.sync(); }, ms); };
  return C;
})();
