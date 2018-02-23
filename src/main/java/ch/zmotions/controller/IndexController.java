package ch.zmotions.controller;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.UUID;

@RestController
public class IndexController {
    JSONObject root = new JSONObject();
    private JSONParser parser = new JSONParser();

    @GetMapping("/portfolio")
    public String create() {
        UUID uuid = UUID.randomUUID();
        while (root.keySet().contains(uuid.toString())) {
            uuid = UUID.randomUUID();
        }
        return "{\"uuid\": \"" + uuid.toString() + "\"}";
    }

    @GetMapping("/portfolio/{uuid}")
    public String get(@PathVariable("uuid") String uuid) {
        JSONArray retVal = (JSONArray) root.get(uuid);
        if (retVal == null || retVal.isEmpty()) {
            return "[]";
        }
        return retVal.toJSONString();
    }


    @RequestMapping(value = "/portfolio/{uuid}", method = RequestMethod.POST)
    public void set(HttpEntity<String> httpEntity, @PathVariable("uuid") String uuid) {
        String json = httpEntity.getBody();
        try {
            JSONArray obj = (JSONArray) parser.parse(json);
            if (obj != null) {
                root.put(uuid, obj);
                try (FileWriter file = new FileWriter("mydb.json")) {
                    file.write(root.toJSONString());
                    file.flush();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void init() {
        try {
            root = (JSONObject) parser.parse(new FileReader("mydb.json"));
        } catch (IOException | ParseException e) {
            e.printStackTrace();
        }
    }
}
