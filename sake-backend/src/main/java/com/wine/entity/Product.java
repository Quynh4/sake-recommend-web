package com.wine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "intl_name")
    private String intlName;
    
    @Column(name = "brand_name")
    private String brandName;
    
    @Column(name = "brand_intl_name")
    private String brandIntlName;
    
    @Column(name = "year_month")
    private String yearMonth;
    
    @Column(name = "rank")
    private Integer rank;
    
    @Column(name = "score")
    private Double score;
    
    @Column(name = "f1")
    private Double f1;
    
    @Column(name = "f2")
    private Double f2;
    
    @Column(name = "f3")
    private Double f3;
    
    @Column(name = "f4")
    private Double f4;
    
    @Column(name = "f5")
    private Double f5;
    
    @Column(name = "f6")
    private Double f6;
    
    @Column(name = "flavour_tags", length = 1000)
    private String flavourTags;
    
    @Column(name = "checkin_count")
    private Integer checkinCount;
    
    @Column(name = "pictures", length = 2000)
    private String pictures;
    
    @Column(name = "similar_brands", length = 1000)
    private String similarBrands;
}
