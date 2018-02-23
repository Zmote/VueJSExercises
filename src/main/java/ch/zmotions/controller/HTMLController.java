package ch.zmotions.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HTMLController {
    @GetMapping("/index")
    public String index(){
        return "index.html";
    }
    @GetMapping("/index2")
    public String index2(){
        return "index2.html";
    }
}
