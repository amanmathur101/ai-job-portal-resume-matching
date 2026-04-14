package com.aman.springboot.model;


import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
@Entity
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer postId;
    private String postProfile;
    private String postDesc;
    private Integer reqExperience;
    @ElementCollection
    @CollectionTable(name = "job_tech_stack", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tech")
    private List<String> postTechStack;

    public JobPost() {
    }

    public JobPost(Integer postId, String postProfile, String postDesc, Integer reqExperience, List<String> postTechStack) {
        this.postId = postId;
        this.postProfile = postProfile;
        this.postDesc = postDesc;
        this.reqExperience = reqExperience;
        this.postTechStack = postTechStack;
    }

    public Integer getPostId() { return postId; }
    public void setPostId(Integer postId) { this.postId = postId; }
    public String getPostProfile() { return postProfile; }
    public void setPostProfile(String postProfile) { this.postProfile = postProfile; }
    public String getPostDesc() { return postDesc; }
    public void setPostDesc(String postDesc) { this.postDesc = postDesc; }
    public Integer getReqExperience() { return reqExperience; }
    public void setReqExperience(Integer reqExperience) { this.reqExperience = reqExperience; }
    public List<String> getPostTechStack() { return postTechStack; }
    public void setPostTechStack(List<String> postTechStack) { this.postTechStack = postTechStack; }
}