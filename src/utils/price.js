var cachedPrice = 88;
var lastFetch = 0;
var CACHE_MS = 60000;

export function getSolPrice() {
  return cachedPrice;
}

export function fetchSolPrice() {
  var now = Date.now();
  if (now - lastFetch < CACHE_MS) return Promise.resolve(cachedPrice);

  return fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.solana && data.solana.usd) {
        cachedPrice = data.solana.usd;
        lastFetch = now;
      }
      return cachedPrice;
    })
    .catch(function() {
      return cachedPrice;
    });
}
