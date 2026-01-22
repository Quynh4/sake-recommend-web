package com.wine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String intlName;
    private String brandName;
    private String brandIntlName;
    private String yearMonth;
    private Integer rank;
    private Double score;
    private Double f1;
    private Double f2;
    private Double f3;
    private Double f4;
    private Double f5;
    private Double f6;
    private List<String> flavourTags;
    private Integer checkinCount;
    private List<String> pictures;
    private List<String> similarBrands;
}
