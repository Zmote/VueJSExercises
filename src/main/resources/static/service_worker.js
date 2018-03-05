//Mit der Cache Version könnte man eventuell "neuer" offline Seiten laden
//z.B. im Sinne von der letzten aktuell gecached'ten Applikationszustand
const CACHE_VERSION = 1;
let CURRENT_CACHES = {
    offline: 'offline-v' + CACHE_VERSION
};
const OFFLINE_URL = "offline.html";

function createCacheBustedRequest(url) {
    //Hier wird ein neuer Request mi "url" und {cache: 'reload'} erzeugt, wobei {...} ein init-value darstellt
    //Das Property cache stellt im Request Objekt den Cache-Modus dar, siehe Web API für mehr info dazu
    let request = new Request(url, {cache: 'reload'});
    //Folglich sollte 'cache' auch im request enthalten sein, vielleicht ein Check, ob Erzeugung erfolgreich?
    //Könnte auch eine Kontrolle sein, ob Cache erfolgreich geladen werden konnte
    // TODO: Abklären^
    if ('cache' in request) {
        return request;
    }
    //
    //Busted URL --> hier ist self.location.href die Basis für die neue URL
    let bustedUrl = new URL(url, self.location.href);
    //Erweiterung des bustedURL um cachebust query param
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
    return new Request(bustedUrl);
}

self.addEventListener('install', event => {
    console.log("Service worker installed");
    //waitUntil speziell, wartet auf die Beendingung der Operation, die als Parameter übergeben wurde
    //ie. wenn install event eintrifft, soll vor dem Fortfahren darauf gewartet werden, dass der fetch
    //fertiggestellt wird.
    event.waitUntil(
        //Beim installieren wird also die offline HTML gecashed, damit bei Connectionverlust
        //diese vom Cache geladen werden kann.
        fetch(createCacheBustedRequest(OFFLINE_URL)).then(function (response) {
            return caches.open(CURRENT_CACHES.offline).then(function (cache) {
                return cache.put(OFFLINE_URL, response);
            })
        })
    )
});

//Activate wird sofort nach install ausgelöst
self.addEventListener('activate', event => {
    console.log("Service worker was activated...");
    console.log("CURRENT_CACHES", CURRENT_CACHES);
    //TODO: Ist exptectedCacheNames überhaupt nötig? Warum nicht direkt
    //CURRENT_CACHES.hasProperty(key) anstatt indexOf?
    let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
        return CURRENT_CACHES[key];
    });
    console.log("expectedCacheNames", expectedCacheNames);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(key => {
                    //falls der cachName im Browser-Cache nicht in unseren
                    //erwarteten Cache-Names ist, soll dieser von den Caches
                    //entfernt werden
                    // TODO: Entfernen wir somit nicht effektiv alle Caches ausser der Offline Cache?
                    // TODO: Wieso aber "out of date" cache?
                    if (expectedCacheNames.indexOf(key) === -1) {
                        console.log("Removing out of date cache... " + key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    console.log("Service worker has fetched something...");
    if (event.request.mode = "navigate" ||
            (event.request.method === "GET" && event.request.headers.get("accept").includes("text/html"))) {
        console.log("Handling fetch event for: " + event.request.url);
        event.respondWith(
            //Dieser Eventlistener macht eigentlich folgendes
            //1)Hört fetch - Request's ab und überprüft, ob fetch für eine HTML
            //2) Macht selbst ein fetch und sieht, ob es ein Fehler verursacht
            //3) Falls Fehler ja, gib die Offline - Seite zurück, die wir bei Install gecached haben.
          fetch(event.request).catch(error =>{
              console.log("Fetch unsuccessful; returning offline page, Error: ", error);
              return caches.match(OFFLINE_URL);
          })
        );
    }
});