package com.webtech.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class ReportUpsertRequest {

    @NotNull(message = "data is required")
    private Map<String, Object> data;

    public ReportUpsertRequest() {}

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}

