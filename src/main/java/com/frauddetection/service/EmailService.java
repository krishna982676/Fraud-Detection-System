package com.frauddetection.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${sentinelx.app-url:http://localhost:3000}")
    private String appUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("alerts@sentinelx.io");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Sent email to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.warn("Email delivery skipped or failed for {}: {} (Mock/Local Mode)", to, e.getMessage());
        }
    }

    public void sendWelcomeAndVerificationEmail(String toEmail, String name, String token) {
        String verifyUrl = appUrl + "/verify-email?token=" + token;
        String html = """
            <div style="background-color: #050806; color: #E8FFF3; padding: 40px; font-family: sans-serif;">
                <h1 style="color: #00FF9C; letter-spacing: -0.5px;">Welcome to SentinelX</h1>
                <p style="font-size: 16px; color: #A7C4B3;">Hi %s,</p>
                <p style="font-size: 15px; color: #A7C4B3; line-height: 1.6;">
                    Your 30-day Enterprise Trial is live! You have instant access to our real-time ML scoring engine,
                    custom rule builder, and high-concurrency stream API.
                </p>
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #00FF9C; color: #03140B; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                        Verify Email & Launch Terminal
                    </a>
                </div>
                <p style="font-size: 13px; color: #7F9C8B;">If you did not request this, you can safely ignore this email.</p>
            </div>
            """.formatted(name != null ? name : "Operator", verifyUrl);

        sendHtmlEmail(toEmail, "Welcome to SentinelX — Verify Your Email", html);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = appUrl + "/reset-password?token=" + token;
        String html = """
            <div style="background-color: #050806; color: #E8FFF3; padding: 40px; font-family: sans-serif;">
                <h2 style="color: #00FF9C;">Password Reset Request</h2>
                <p style="font-size: 15px; color: #A7C4B3;">A security password reset was requested for your SentinelX account.</p>
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #00FF9C; color: #03140B; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 13px; color: #7F9C8B;">Link expires in 60 minutes. If you did not request this, please verify your credentials.</p>
            </div>
            """.formatted(resetUrl);

        sendHtmlEmail(toEmail, "SentinelX Security: Reset Your Password", html);
    }

    public void sendTrialReminderEmail(String toEmail, String orgName, int daysLeft) {
        String billingUrl = appUrl + "/app/billing";
        String html = """
            <div style="background-color: #050806; color: #E8FFF3; padding: 40px; font-family: sans-serif;">
                <h2 style="color: %s;">SentinelX Trial Notice: %d Days Remaining</h2>
                <p style="font-size: 15px; color: #A7C4B3;">
                    Your organization <strong>%s</strong> has %d days remaining on the SentinelX 30-Day Enterprise Trial.
                    To avoid transaction interruption or scoring rate limits, upgrade to an active subscription.
                </p>
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #00FF9C; color: #03140B; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                        Upgrade Subscription
                    </a>
                </div>
            </div>
            """.formatted(daysLeft <= 3 ? "#FF3B5C" : "#FFB020", daysLeft, orgName, daysLeft, billingUrl);

        sendHtmlEmail(toEmail, "SentinelX Trial Reminder: " + daysLeft + " Days Left", html);
    }

    public void sendPaymentFailedEmail(String toEmail, String orgName) {
        String billingUrl = appUrl + "/app/billing";
        String html = """
            <div style="background-color: #050806; color: #E8FFF3; padding: 40px; font-family: sans-serif;">
                <h2 style="color: #FF3B5C;">Payment Failed for SentinelX Subscription</h2>
                <p style="font-size: 15px; color: #A7C4B3;">
                    We were unable to process the recurring payment for organization <strong>%s</strong>.
                    Please update your billing method to prevent service suspension.
                </p>
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #FF3B5C; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                        Update Payment Method
                    </a>
                </div>
            </div>
            """.formatted(orgName, billingUrl);

        sendHtmlEmail(toEmail, "Action Required: Payment Failed for SentinelX", html);
    }
}
