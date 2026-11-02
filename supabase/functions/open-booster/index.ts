import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACK_SIZES: Record<string, number> = { cel25: 4, me55: 5, M2a: 5, M4: 5 };
const SET_IDS: Record<string, string> = {};
const TCGDEX_SET_IDS: Record<string, string> = {
  base1: "base1", swsh7: "swsh7", swsh12pt5: "swsh12.5", sv3pt5: "sv03.5",
  sv6: "sv06", swsh4pt5: "swsh4.5", sv3: "sv03", sv2: "sv02", g1: "g1",
  sv7: "sv07", "me02.5": "me02.5", me04: "me04", me5: "me05", me3: "me03",
  me2: "me02", me1: "me01", cel25: "cel25", me55: "30th",
  M2a: "M2a", M4: "M4",
};
const TCGDEX_LANGUAGES: Record<string, string> = { M2a: "ja", M4: "ja" };
const PACK_PRICES: Record<string, number> = {
  base1: 300, swsh7: 12, swsh12pt5: 8, sv3pt5: 6.5, sv6: 5, swsh45: 7,
  sv3: 4.5, sv2: 4.5, g1: 15, sv7: 5, M2a: 8, "me02.5": 8, M4: 6,
  me04: 6, me5: 8, me3: 8, me2: 12.42, me1: 8, sv8pt5: 12, sv8: 8,
  sv6pt5: 5, sv5: 5, sv4: 5, sv1: 4.5, cel25: 12, me55: 15, xy6: 20,
};

type ApiCard = {
  id?: string;
  name?: string;
  number?: string;
  rarity?: string;
  supertype?: string;
  images?: { large?: string; small?: string };
  set?: { name?: string; printedTotal?: number; total?: number };
  tcgplayer?: { prices?: Record<string, { market?: number }> };
  pricing?: { tcgplayer?: { market?: number }; cardmarket?: { trend?: number } };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function choose<T>(cards: T[]): T {
  if (!cards.length) throw new Error("Catalogue vide pour cette extension.");
  return cards[Math.floor(Math.random() * cards.length)];
}

function rarity(card: ApiCard) {
  return String(card.rarity || "").toLowerCase().replace(/[-_]/g, " ");
}

function price(card: ApiCard) {
  const prices = card.tcgplayer?.prices || {};
  for (const key of ["holofoil", "reverseHolofoil", "normal", "1stEditionHolofoil", "1stEditionNormal"]) {
    const value = Number(prices[key]?.market);
    if (Number.isFinite(value) && value > 0) return { value, priceSource: "tcgplayer" };
  }
  const tcgplayer = Number(card.pricing?.tcgplayer?.market);
  if (Number.isFinite(tcgplayer) && tcgplayer > 0) return { value: tcgplayer, priceSource: "tcgplayer" };
  const cardmarket = Number(card.pricing?.cardmarket?.trend);
  if (Number.isFinite(cardmarket) && cardmarket > 0) return { value: cardmarket, priceSource: "cardmarket_trend" };
  return { value: null, priceSource: "unavailable" };
}

function isBasic(card: ApiCard) {
  return ["common", "uncommon"].includes(rarity(card));
}

function isReverse(card: ApiCard) {
  return isBasic(card) || ["rare", "rare holo", "holo rare"].includes(rarity(card));
}

function isUltra(card: ApiCard) {
  const value = rarity(card);
  return /double rare|ultra rare|amazing rare|radiant|v$|ex$|full art|full-art/.test(value);
}

function isSecret(card: ApiCard) {
  const value = rarity(card);
  return /secret|special illustration|illustration rare|hyper rare|black white rare|trainer gallery|character rare/.test(value);
}

function isClassicHit(card: ApiCard) {
  const value = rarity(card);
  return value === "rare" || value === "rare holo" || value === "holo rare" || value === "rare holo ex";
}

function toPull(card: ApiCard, setId: string, kind: string, packNumber: number) {
  const quote = price(card);
  const printedTotal = Number(card.set?.printedTotal || card.set?.total || 0);
  return {
    id: card.id,
    setId,
    name: card.name || "Carte inconnue",
    number: card.number || "",
    printedTotal,
    setName: card.set?.name || setId,
    category: card.supertype || "",
    rarity: card.rarity || "Carte",
    raritySource: "Pokémon TCG API",
    image: card.images?.large || card.images?.small || "",
    value: quote.value,
    priceSource: quote.priceSource,
    kind,
    packNumber,
    uniqueKey: crypto.randomUUID(),
  };
}

async function loadCards(setId: string): Promise<ApiCard[]> {
  const apiSetId = SET_IDS[setId] || setId;
  const tcgdexSetId = TCGDEX_SET_IDS[setId];
  if (tcgdexSetId) {
    try {
      const base = `https://api.tcgdex.net/v2/${TCGDEX_LANGUAGES[setId] || "en"}`;
      const setResponse = await fetch(`${base}/sets/${encodeURIComponent(tcgdexSetId)}`, { headers: { Accept: "application/json" } });
      if (!setResponse.ok) throw new Error(`TCGdex HTTP ${setResponse.status}`);
      const setData = await setResponse.json();
      if (!Array.isArray(setData.cards) || !setData.cards.length) throw new Error("TCGdex a renvoyé un catalogue vide.");
      const details: ApiCard[] = [];
      for (let start = 0; start < setData.cards.length; start += 16) {
        const batch = setData.cards.slice(start, start + 16);
        const result = await Promise.all(batch.map(async (reference: { id?: string }) => {
          const response = await fetch(`${base}/cards/${encodeURIComponent(reference.id || "")}`, { headers: { Accept: "application/json" } });
          if (!response.ok) throw new Error(`TCGdex carte HTTP ${response.status}`);
          const card = await response.json();
          const image = typeof card.image === "string" ? `${card.image}/high.webp` : "";
          const cardSet = (card.set || {}) as Record<string, unknown>;
          return {
            id: String(card.id || ""),
            name: String(card.name || "Carte inconnue"),
            number: String(card.localId || ""),
            rarity: String(card.rarity || ""),
            supertype: String(card.category || ""),
            images: { large: image, small: image },
            set: { name: String(cardSet.name || setId), printedTotal: Number((cardSet.cardCount as Record<string, unknown>)?.official || 0), total: Number((cardSet.cardCount as Record<string, unknown>)?.total || 0) },
            pricing: card.pricing,
          } satisfies ApiCard;
        }));
        details.push(...result.filter((card) => card.id));
      }
      if (details.length) return details;
    } catch (error) {
      console.warn("TCGdex indisponible, tentative API Pokémon TCG.", error);
    }
  }
  const apiKey = Deno.env.get("POKEMONTCG_API_KEY");
  let apiFailure = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`set.id:${apiSetId}`)}&pageSize=250`,
        { headers: { Accept: "application/json", ...(apiKey ? { "X-Api-Key": apiKey } : {}) } },
      );
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload.data) && payload.data.length) return payload.data;
        apiFailure = "réponse vide";
      } else {
        apiFailure = `HTTP ${response.status}`;
      }
    } catch (error) {
      apiFailure = error instanceof Error ? error.message : String(error);
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }

  const fallbackSetId = TCGDEX_SET_IDS[setId];
  if (!fallbackSetId) throw new Error(`Catalogue Pokémon TCG indisponible (${apiFailure}). Aucun fallback TCGdex pour ${setId}.`);
  try {
    const base = `https://api.tcgdex.net/v2/${TCGDEX_LANGUAGES[setId] || "en"}`;
    const setResponse = await fetch(`${base}/sets/${encodeURIComponent(fallbackSetId)}`, { headers: { Accept: "application/json" } });
    if (!setResponse.ok) throw new Error(`TCGdex HTTP ${setResponse.status}`);
    const setData = await setResponse.json();
    if (!Array.isArray(setData.cards) || !setData.cards.length) throw new Error("TCGdex a renvoyé un catalogue vide.");
    const details = await Promise.all(setData.cards.map(async (reference: { id?: string }) => {
      const response = await fetch(`${base}/cards/${encodeURIComponent(reference.id || "")}`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`TCGdex carte HTTP ${response.status}`);
      return response.json();
    }));
    return details.map((card: Record<string, unknown>) => {
      const image = typeof card.image === "string" ? `${card.image}/high.webp` : "";
      const set = (card.set || {}) as Record<string, unknown>;
      return {
        id: String(card.id || ""),
        name: String(card.name || "Carte inconnue"),
        number: String(card.localId || ""),
        rarity: String(card.rarity || ""),
        supertype: Array.isArray(card.category) ? card.category.join(", ") : String(card.category || ""),
        images: { large: image, small: image },
        set: { name: String(set.name || setId), printedTotal: Number(set.cardCount || 0), total: Number(set.cardCount || 0) },
      } satisfies ApiCard;
    }).filter((card) => card.id);
  } catch (fallbackError) {
    const detail = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
    throw new Error(`Catalogues indisponibles : Pokémon TCG (${apiFailure}) et TCGdex (${detail}).`);
  }
}

function generatePulls(cards: ApiCard[], setId: string, quantity: number) {
  const packSize = PACK_SIZES[setId] || 10;
  const basics = cards.filter(isBasic);
  const reverses = cards.filter(isReverse);
  const classics = cards.filter(isClassicHit);
  const ultras = cards.filter(isUltra);
  const secrets = cards.filter(isSecret);
  const rareFallback = cards.filter((card) => !isBasic(card));
  const pulls = [];
  for (let packNumber = 1; packNumber <= quantity; packNumber++) {
    for (let index = 0; index < packSize - 3; index++) pulls.push(toPull(choose(basics.length ? basics : cards), setId, "common", packNumber));
    for (let index = 0; index < 2; index++) pulls.push(toPull(choose(reverses.length ? reverses : cards), setId, "reverse", packNumber));
    const roll = Math.random();
    const pool = roll < 0.7
      ? classics
      : roll < 0.9 ? ultras : secrets;
    pulls.push(toPull(choose(pool.length ? pool : rareFallback), setId, "hit", packNumber));
  }
  if (pulls.length !== quantity * packSize) {
    throw new Error(`Catalogue serveur incohérent pour ${setId} : ${pulls.length} cartes générées au lieu de ${quantity * packSize}.`);
  }
  return pulls;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Connexion requise." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authClient = createClient(url, anonKey);
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Session Supabase invalide." }, 401);
    const body = await request.json();
    const setId = String(body.setId || "");
    const quantity = Number(body.quantity);
    const free = body.free === true;
    const removeSealedKey = body.removeSealedKey ? String(body.removeSealedKey) : null;
    const freeBoosterIndex = Number.isSafeInteger(body.freeBoosterIndex) ? body.freeBoosterIndex : null;
    if (!setId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 360) return json({ error: "Quantité ou extension invalide." }, 400);
    if (!Object.prototype.hasOwnProperty.call(PACK_PRICES, setId)) {
      return json({ error: `Extension non configurée côté serveur : ${setId}.` }, 400);
    }
    const cards = await loadCards(setId);
    const pulls = generatePulls(cards, setId, quantity);
    const serviceClient = createClient(url, serviceKey);
    const { data, error } = await serviceClient.rpc("open_boosters_internal", {
      p_user_id: userData.user.id,
      p_set_id: setId,
      p_quantity: quantity,
      p_free: free,
      p_remove_sealed_key: removeSealedKey,
      p_free_booster_index: freeBoosterIndex,
      p_pulls: pulls,
    });
    if (error) throw error;
    return json(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    console.error("Server-side booster opening failed", error);
    return json({ error: error instanceof Error ? error.message : "Ouverture serveur impossible." }, 400);
  }
});
