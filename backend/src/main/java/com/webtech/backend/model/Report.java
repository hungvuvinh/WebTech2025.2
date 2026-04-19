package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "reports")
public class Report {
    @Id
    @JsonProperty("_id")
    private String id;

    /**
     * Compass schema for `reports` is empty in provided model.
     * Keep flexible payload so you can store any report data.
     */
    private Map<String, Object> data = new HashMap<>();

    public Report() {}

    public Report(String id, Map<String, Object> data) {
        this.id = id;
        this.data = data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}

