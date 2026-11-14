// Cloud backup: copies the save to Mark's Supabase (kids_save_get / kids_save_put)
// so the kids' progress follows them between computers and survives a cleared
// browser. Merging only ever adds progress (more stars, more parts, more planets);
// the server keeps a history of every save, so nothing can be lost for good.
// Photos and birthdays stay on this device and are never uploaded.
window.CLOUD = (function () {
  const API = 'https://nxvtaxbntqhcfqtazbnt.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_51M6zUC11pz8fIPkCvi4WQ_owCE99pB';
  const FAMILY = 'R9so-F-FQWdreVzLrPGtR8YP';
  const GAME = 'rocket-builders';
  const C = { status: 'not synced yet', lastSync: 0 };

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

  // What goes to the cloud: progress only, no photo, birthdays or device settings.
  C.cloudCopy = (save) => {
    const out = { v: 1, profiles: {}, resets: save.resets || {} };
    for (const id in save.profiles) { const p = Object.assign({}, save.profiles[id]); delete p.face; out.profiles[id] = p; }
    return out;
  };

  // Fold profile R (remote) into L (local) in place, keeping the most progress.
  C.mergeProfile = (L, R) => {
    const remoteNewer = (R.touched || 0) > (L.touched || 0);
    const maxMap = (a, b) => {
      a = a || {}; b = b || {};
      for (const k in b) {
        if (typeof a[k] === 'number' && typeof b[k] === 'number') a[k] = Math.max(a[k], b[k]);
        else if (!(k in a) || remoteNewer) a[k] = b[k];
      }
      return a;
    };
    for (const k of ['stars', 'starBits', 'launched']) L[k] = Math.max(L[k] || 0, R[k] || 0);
    L.parts = L.parts || [];
    for (const pid of R.parts || []) if (!L.parts.includes(pid)) L.parts.push(pid);
    for (const k of ['visited', 'stickers', 'videosSeen', 'stationRounds', 'words', 'flags']) L[k] = maxMap(L[k], R[k]);
    if (remoteNewer) {
      if (R.rocket) { L.rocket = JSON.parse(JSON.stringify(R.rocket)); if (L.rocket.crew === 'me' && !L.face) L.rocket.crew = 'kid'; }
      L.level = Object.assign({}, L.level, R.level);
      L.touched = R.touched;
    }
    L.born = Math.min(L.born || 0, R.born || 0);
    return L;
  };

  // Fold a remote save into the local one in place. Returns true if anything changed.
  C.mergeSave = (local, remote) => {
    if (!remote || !remote.profiles) return false;
    const before = JSON.stringify(C.cloudCopy(local));
    local.resets = local.resets || {};
    for (const id in remote.resets || {}) local.resets[id] = Math.max(local.resets[id] || 0, remote.resets[id]);
    const resetAt = id => local.resets[id] || 0;
    for (const id in local.profiles) if (resetAt(id) && (local.profiles[id].born || 0) <= resetAt(id)) delete local.profiles[id];
    for (const id in remote.profiles) {
      const R = remote.profiles[id];
      if (resetAt(id) && (R.born || 0) <= resetAt(id)) continue;
      if (local.profiles[id]) C.mergeProfile(local.profiles[id], R);
      else { const p = JSON.parse(JSON.stringify(R)); p.face = null; if (p.rocket && p.rocket.crew === 'me') p.rocket.crew = 'kid'; local.profiles[id] = p; }
    }
    return JSON.stringify(C.cloudCopy(local)) !== before;
  };

  let busy = false, again = false;
  // Fetch the cloud save, merge it in, and upload the merged result.
  C.sync = async (onChange) => {
    if (busy) { again = true; return; }
    busy = true;
    try {
      const remote = await rpc('kids_save_get', { p_family: FAMILY, p_game: GAME });
      const changed = C.mergeSave(G.save, remote);
      if (changed) { G.persistLocal(); if (onChange) onChange(); }
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
