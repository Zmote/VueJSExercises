package ch.zmotions.controller;

import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class IndexController {
    final private static Map<String, String> portfolio = new ConcurrentHashMap<>();
    @GetMapping("/portfolio")
    public String create() {
        UUID uuid = UUID.randomUUID();
        while(portfolio.containsKey(uuid.toString())) {
            uuid = UUID.randomUUID();
        }
        return "{\"uuid\": \""+uuid.toString()+"\"}";
    }
    @GetMapping("/portfolio/{uuid}")
    public String get(@PathVariable("uuid") String uuid) {
        String retVal = portfolio.get(uuid);
        if(retVal == null) {
            return "[]";
        }
        return retVal;
    }
    @RequestMapping(value = "/portfolio/{uuid}", method = RequestMethod.POST)
    public void set(HttpEntity<String> httpEntity, @PathVariable("uuid") String uuid) {
        String json = httpEntity.getBody();
        portfolio.put(uuid, json);
    }
}
