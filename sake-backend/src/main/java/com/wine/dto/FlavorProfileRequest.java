package com.wine.dto;

import lombok.Data;

@Data
public class FlavorProfileRequest {
    private Double f1;
    private Double f2;
    private Double f3;
    private Double f4;
    private Double f5;
    private Double f6;
    private Integer topK = 15; // Default top 15 results
}
