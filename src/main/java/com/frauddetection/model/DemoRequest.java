package com.frauddetection.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "demo_requests")
public class DemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @NotBlank(message = "Business email is required")
    @Email(message = "Valid email is required")
    @Column(nullable = false)
    private String businessEmail;

    @NotBlank(message = "Company is required")
    @Column(nullable = false)
    private String company;

    @NotBlank(message = "Interest selection is required")
    @Column(nullable = false)
    private String interest;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public DemoRequest() {}

    public DemoRequest(String firstName, String lastName, String businessEmail, String company, String interest, String message) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.businessEmail = businessEmail;
        this.company = company;
        this.interest = interest;
        this.message = message;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getInterest() { return interest; }
    public void setInterest(String interest) { this.interest = interest; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

