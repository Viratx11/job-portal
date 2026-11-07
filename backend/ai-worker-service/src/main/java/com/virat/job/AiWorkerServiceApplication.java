package com.virat.job;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@SpringBootApplication
public class AiWorkerServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiWorkerServiceApplication.class, args);
    }
}
