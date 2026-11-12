import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACK_SIZES: Record<string, number> = {
  cel25: 4, me55: 5, M2a: 5, M4: 5, dc1: 7, det1: 4,
  pop1: 2, pop2: 2, pop3: 2, pop4: 2, pop6: 2, pop8: 2,
};
const COMING_SOON_SET_IDS = new Set(["me06"]);
const SET_IDS: Record<string, string> = {};
const TCGDEX_SET_IDS: Record<string, string> = {
  base1: "base1", swsh7: "swsh7", swsh12pt5: "swsh12.5", sv3pt5: "sv03.5",
  sv6: "sv06", swsh45: "swsh4.5", sv3: "sv03", sv2: "sv02", g1: "g1",
  sv7: "sv07", M2a: "M2a", "me02.5": "me02.5", M4: "M4", me04: "me04",
  me5: "me05", me3: "me03", me2: "me02", me1: "me01", sv8pt5: "sv08.5",
  sv8: "sv08", sv6pt5: "sv06.5", sv5: "sv05", sv4: "sv04", sv1: "sv01",
  swsh12: "swsh12", swsh10: "swsh10", swsh9: "swsh9", swsh2: "swsh2",
  swsh5: "swsh5", sm12: "sm12", sm9: "sm9", xy12: "xy12", xy4: "xy4",
  xy2: "xy2", swsh11: "swsh11", swsh8: "swsh8", swsh6: "swsh6",
  cel25: "cel25", sv4pt5: "sv04.5", sv9: "sv09", sv10: "sv10",
  me55: "30th", me06: "me06", xy6: "xy6",
  base4: "base4", base3: "base3", base2: "base2", base5: "base5",
  gym1: "gym1", gym2: "gym2", neo1: "neo1", neo2: "neo2",
  ex1: "ex1", ex3: "ex3", ex5: "ex5", ex6: "ex6", ex13: "ex13",
  ex14: "ex14", ex16: "ex16", dp1: "dp1", dp2: "dp2", dp3: "dp3",
  dp4: "dp4", dp7: "dp7", pl1: "pl1", pl2: "pl2", pl3: "pl3",
  pl4: "pl4", hgss1: "hgss1", col1: "col1", bw1: "bw1", bw2: "bw2",
  bw3: "bw3", bw4: "bw4", bw5: "bw5", bw6: "bw6", bw7: "bw7",
  bw8: "bw8", bw9: "bw9", bw10: "bw10", bw11: "bw11", xy1: "xy1",
  xy3: "xy3", xy5: "xy5", dc1: "dc1", xy7: "xy7", xy8: "xy8",
  xy9: "xy9", xy10: "xy10", xy11: "xy11", sm1: "sm1", sm2: "sm2",
  sm3: "sm3", "sm3.5": "sm3.5", sm4: "sm4", sm5: "sm5", sm6: "sm6",
  sm7: "sm7", "sm7.5": "sm7.5", sm8: "sm8", det1: "det1", sm10: "sm10",
  sm11: "sm11", sm115: "sm115", swsh1: "swsh1", swsh3: "swsh3",
  "swsh3.5": "swsh3.5", swsh4: "swsh4", "swsh10.5": "swsh10.5",
  "sv10.5b": "sv10.5b", "sv10.5w": "sv10.5w", pop1: "pop1", pop2: "pop2",
  pop3: "pop3", pop4: "pop4", pop6: "pop6", pop8: "pop8",
};
const TCGDEX_LANGUAGES: Record<string, string> = { M2a: "ja", M4: "ja" };
const PACK_PRICES: Record<string, number> = {
  base1: 875, swsh7: 42.5, swsh12pt5: 26, sv3pt5: 27, sv6: 9.5, swsh45: 18,
  sv3: 12.5, sv2: 15.5, g1: 335, sv7: 11, M2a: 8, "me02.5": 10.5, M4: 2.5,
  me04: 5.5, me5: 6, me3: 5.5, me2: 12, me1: 9, sv8pt5: 13.5, sv8: 9,
  sv6pt5: 12.5, sv5: 10.5, sv4: 9, sv1: 9, swsh12: 15, swsh10: 10.5,
  swsh9: 15, swsh2: 11.5, swsh5: 10, sm12: 72, sm9: 325, xy12: 71.5,
  xy4: 229.5, xy2: 162, swsh11: 17.5, swsh8: 19.5, swsh6: 12, cel25: 26.5,
  sv4pt5: 24.5, sv9: 6.5, sv10: 8.5, me55: 10, xy6: 88.5,
  base4: 459.5, base3: 340, base2: 327.5, base5: 329, gym1: 279,
  gym2: 420, neo1: 632, neo2: 1500, ex1: 800, ex3: 1125, ex5: 800,
  ex6: 1013, ex13: 1902, ex14: 1650, ex16: 1000, dp1: 304, dp2: 340,
  dp3: 628, dp4: 347.5, dp7: 596.5, pl1: 390, pl2: 1000, pl3: 737.5,
  pl4: 568, hgss1: 450, col1: 1115, bw1: 188, bw2: 112.5, bw3: 169,
  bw4: 383, bw5: 397, bw6: 366, bw7: 246, bw8: 651, bw9: 329,
  bw10: 275.5, bw11: 392.5, xy1: 140.5, xy3: 81.5, xy5: 96.5,
  dc1: 452.5, xy7: 153, xy8: 67.5, xy9: 51.5, xy10: 47, xy11: 34,
  sm1: 22, sm2: 38, sm3: 30.5, "sm3.5": 113, sm4: 19, sm5: 51,
  sm6: 52, sm7: 72.5, "sm7.5": 116.5, sm8: 55, det1: 24.5,
  sm10: 67.5, sm11: 81.5, sm115: 46.5, swsh1: 12, swsh3: 10.5,
  "swsh3.5": 20, swsh4: 10.5, "swsh10.5": 16, "sv10.5b": 14,
  "sv10.5w": 13, pop1: 145, pop2: 147, pop3: 194, pop4: 198.5,
  pop6: 47.5, pop8: 30,
};

type ApiCard = {
  id?: string;
  name?: string;
  number?: string;
  rarity?: string;
  supertype?: string;
  images?: { large?: string; small?: string };
  variants?: { normal?: boolean; holo?: boolean; reverse?: boolean; wPromo?: boolean };
  variants_detailed?: Array<{ type?: string; pricing?: { tcgplayer?: { updated?: string; [key: string]: unknown } } }>;
  set?: { name?: string; printedTotal?: number; total?: number };
  tcgplayer?: { prices?: Record<string, { market?: number }>; updatedAt?: string };
  pricing?: { tcgplayer?: { market?: number }; cardmarket?: { trend?: number; unit?: string; updated?: string } };
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

function price(card: ApiCard, eurUsdRate: number | null, exchangeRateDate: string) {
  const prices = card.tcgplayer?.prices || {};
  for (const key of ["holofoil", "reverseHolofoil", "normal", "1stEditionHolofoil", "1stEditionNormal"]) {
    const value = Number(prices[key]?.market);
    if (Number.isFinite(value) && value > 0) return { value, priceSource: "tcgplayer", priceUpdatedAt: card.tcgplayer?.updatedAt || "" };
  }
  const tcgplayer = Number(card.pricing?.tcgplayer?.market);
  if (Number.isFinite(tcgplayer) && tcgplayer > 0) return { value: tcgplayer, priceSource: "tcgplayer", priceUpdatedAt: "" };
  const cardmarket = Number(card.pricing?.cardmarket?.trend);
  if (Number.isFinite(cardmarket) && cardmarket > 0 && card.pricing?.cardmarket?.unit === "EUR" && eurUsdRate) {
    return {
      value: Math.round(cardmarket * eurUsdRate * 100) / 100,
      priceSource: "cardmarket_trend",
      priceUpdatedAt: card.pricing.cardmarket.updated || "",
      priceMetric: "trend",
      priceOriginalValueEur: cardmarket,
      priceExchangeRate: eurUsdRate,
      priceExchangeRateDate: exchangeRateDate,
    };
  }
  return { value: null, priceSource: "unavailable", priceUpdatedAt: "" };
}

function tcgplayerPricing(card: Record<string, unknown>) {
  const prices: Record<string, { market?: number }> = {};
  let updatedAt = "";
  const detailed = Array.isArray(card.variants_detailed) ? card.variants_detailed as Array<Record<string, unknown>> : [];
  const pricingSources = detailed.map((variant) => {
    const pricing = variant.pricing as Record<string, unknown> | undefined;
    return pricing?.tcgplayer as Record<string, unknown> | undefined;
  });
  const cardPricing = card.pricing as Record<string, unknown> | undefined;
  pricingSources.push(cardPricing?.tcgplayer as Record<string, unknown> | undefined);
  for (const source of pricingSources) {
    if (!source) continue;
    if (typeof source.updated === "string") updatedAt = source.updated;
    for (const [variant, entry] of Object.entries(source)) {
      if (!entry || typeof entry !== "object") continue;
      const market = Number((entry as Record<string, unknown>).marketPrice ?? (entry as Record<string, unknown>).market);
      if (!Number.isFinite(market) || market <= 0) continue;
      const key = variant === "reverse-holofoil" ? "reverseHolofoil" : variant;
      prices[key] = { market };
    }
  }
  return Object.keys(prices).length ? { prices, updatedAt } : undefined;
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
  return value === "rare" || value === "rare holo" || value === "holo rare" || value === "rare holo ex" || value.includes("rgb rare");
}

function toPull(card: ApiCard, setId: string, kind: string, packNumber: number, eurUsdRate: number | null, exchangeRateDate: string) {
  const quote = price(card, eurUsdRate, exchangeRateDate);
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
    priceUpdatedAt: quote.priceUpdatedAt,
    priceMetric: "priceMetric" in quote ? quote.priceMetric : "",
    priceOriginalValueEur: "priceOriginalValueEur" in quote ? quote.priceOriginalValueEur : null,
    priceExchangeRate: "priceExchangeRate" in quote ? quote.priceExchangeRate : null,
    priceExchangeRateDate: "priceExchangeRateDate" in quote ? quote.priceExchangeRateDate : "",
    kind,
    finish: pulledFinish(card, kind),
    packNumber,
    uniqueKey: crypto.randomUUID(),
  };
}

function pulledFinish(card: ApiCard, kind: string) {
  const available = new Set<string>();
  const add = (value: string) => {
    const type = value.toLowerCase().replace(/[\s_-]+/g, "");
    if (type.includes("masterball")) available.add("masterball");
    else if (type.includes("pokeball")) available.add("pokeball");
    else if (type.includes("reverse")) available.add("reverse");
    else if (type.includes("holofoil") || type === "holo") available.add("holo");
    else if (type === "normal") available.add("normal");
  };
  for (const variant of card.variants_detailed || []) if (variant.type) add(variant.type);
  for (const key of Object.keys(card.tcgplayer?.prices || {})) add(key);
  if (card.variants?.normal) available.add("normal");
  if (card.variants?.holo) available.add("holo");
  if (card.variants?.reverse) available.add("reverse");
  if (kind === "reverse") {
    const finishes = ["reverse", "pokeball", "masterball", "holo"].filter((finish) => available.has(finish));
    if (finishes.length) return choose(finishes);
    return "reverse";
  }
  if (kind === "hit" && available.has("holo") && !available.has("normal")) return "holo";
  return "normal";
}

async function getEurUsdRate() {
  const response = await fetch("https://api.frankfurter.dev/v2/rate/eur/usd", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Taux EUR/USD indisponible (${response.status}).`);
  const data = await response.json();
  const rate = Number(data.rate);
  if (!Number.isFinite(rate) || rate <= 0 || data.base !== "EUR" || data.quote !== "USD") {
    throw new Error("Réponse de conversion EUR/USD invalide.");
  }
  return { rate, date: String(data.date || "") };
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
            tcgplayer: tcgplayerPricing(card),
            variants: card.variants,
            variants_detailed: card.variants_detailed,
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
        tcgplayer: tcgplayerPricing(card),
        variants: card.variants as ApiCard["variants"],
        variants_detailed: card.variants_detailed as ApiCard["variants_detailed"],
        set: { name: String(set.name || setId), printedTotal: Number(set.cardCount || 0), total: Number(set.cardCount || 0) },
      } satisfies ApiCard;
    }).filter((card) => card.id);
  } catch (fallbackError) {
    const detail = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
    throw new Error(`Catalogues indisponibles : Pokémon TCG (${apiFailure}) et TCGdex (${detail}).`);
  }
}

function generatePulls(cards: ApiCard[], setId: string, quantity: number, eurUsdRate: number | null, exchangeRateDate: string) {
  const packSize = PACK_SIZES[setId] || 10;
  const slots = packSize === 5 ? { common: 3, reverse: 1 }
    : packSize === 4 ? { common: 1, reverse: 2 }
      : packSize === 3 ? { common: 1, reverse: 1 }
        : packSize === 2 ? setId.startsWith("pop") ? { common: 1, reverse: 0 } : { common: 0, reverse: 1 }
          : { common: packSize - 3, reverse: 2 };
  const basics = cards.filter(isBasic);
  const reverses = cards.filter(isReverse);
  const classics = cards.filter(isClassicHit);
  const ultras = cards.filter(isUltra);
  const secrets = cards.filter(isSecret);
  const rareFallback = cards.filter((card) => !isBasic(card));
  const pulls = [];
  for (let packNumber = 1; packNumber <= quantity; packNumber++) {
    for (let index = 0; index < slots.common; index++) pulls.push(toPull(choose(basics.length ? basics : cards), setId, "common", packNumber, eurUsdRate, exchangeRateDate));
    for (let index = 0; index < slots.reverse; index++) pulls.push(toPull(choose(reverses.length ? reverses : cards), setId, "reverse", packNumber, eurUsdRate, exchangeRateDate));
    const roll = Math.random();
    const pool = roll < 0.7
      ? classics
      : roll < 0.9 ? ultras : secrets;
    pulls.push(toPull(choose(pool.length ? pool : rareFallback), setId, "hit", packNumber, eurUsdRate, exchangeRateDate));
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
    if (COMING_SOON_SET_IDS.has(setId)) return json({ error: "Cette extension arrive bientôt : ses illustrations ne sont pas encore disponibles." }, 409);
    if (!Object.prototype.hasOwnProperty.call(PACK_PRICES, setId)) {
      return json({ error: `Extension non configurée côté serveur : ${setId}.` }, 400);
    }
    const cards = await loadCards(setId);
    const needsEurUsdRate = cards.some((card) =>
      Number(card.pricing?.cardmarket?.trend) > 0
      && card.pricing?.cardmarket?.unit === "EUR"
      && price(card, null, "").priceSource === "unavailable"
    );
    let eurUsdRate: number | null = null;
    let exchangeRateDate = "";
    if (needsEurUsdRate) {
      try {
        const quote = await getEurUsdRate();
        eurUsdRate = quote.rate;
        exchangeRateDate = quote.date;
      } catch (error) {
        console.warn("Conversion Cardmarket EUR/USD indisponible; seules les cotations USD seront conservées.", error);
      }
    }
    const pulls = generatePulls(cards, setId, quantity, eurUsdRate, exchangeRateDate);
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
